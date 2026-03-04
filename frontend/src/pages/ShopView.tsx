import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { useDeckStore } from '../store/useDeckStore';
import { STARTING_CARDS } from '../assets/data/cards';
import { RELICS } from '../assets/data/relics';
import type { Card } from '../types/gameTypes';
import type { Relic } from '../types/relicTypes';
import { customShuffle } from '../utils/rng';
import { RemoveCardModal } from '../components/ui/RemoveCardModal';

// 상점 판매용 카드 타입 확장 (가격, 품절 속성)
interface ShopCard extends Card {
  price: number;
  isSoldOut: boolean;
}

interface ShopRelic extends Relic {
  price: number;
  isSoldOut: boolean;
}

export const ShopView: React.FC = () => {
  const { gold, addGold, setScene, setToastMessage, relics: ownedRelics, addRelic } = useRunStore();
  const { addCardToMasterDeck } = useDeckStore();

  const [shopCards, setShopCards] = useState<ShopCard[]>([]);
  const [shopRelics, setShopRelics] = useState<ShopRelic[]>([]);

  // 덱 압축 서비스 상태
  const [removeServiceAvailable, setRemoveServiceAvailable] = useState(true);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const REMOVE_PRICE = 50; // 기존 75에서 하향 (덱 압축 장려)

  // 컴포넌트 마운트 시 (상점 진입 시마다) 물품 로드
  useEffect(() => {
    // 1. 판매할 카드 4장 무작위 뽑기
    const shuffledCards = customShuffle([...STARTING_CARDS]);
    const selectedCards = shuffledCards.slice(0, 4).map((card, idx) => {
      // 50~80 랜덤 골드 책정 (10단위)
      const randomPrice = Math.floor(Math.random() * 4) * 10 + 50;
      return {
        ...card,
        id: `shop_card_${idx}`,
        price: randomPrice,
        isSoldOut: false
      } as ShopCard;
    });
    setShopCards(selectedCards);

    // 2. 판매할 미보유 유물 1~2개 뽑기 (보스 유물 제외)
    const availableRelics = RELICS.filter(
      r => r.tier !== 'BOSS' && !ownedRelics.includes(r.id)
    );
    const shuffledRelics = customShuffle(availableRelics);
    const selectedRelics = shuffledRelics.slice(0, Math.min(2, shuffledRelics.length)).map(relic => {
      // 티어별 기본 가격 산정 (유물 구매 접근성 상향)
      let price = 80;
      if (relic.tier === 'UNCOMMON') price = 120;
      else if (relic.tier === 'RARE') price = 200;

      // 약간의 랜덤 편차 (-20 ~ +20)
      price += Math.floor(Math.random() * 5) * 10 - 20;
      return { ...relic, price, isSoldOut: false };
    });
    setShopRelics(selectedRelics);

    setRemoveServiceAvailable(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 카드 구매 로직
  const handleBuyCard = (idx: number) => {
    const item = shopCards[idx];
    if (item.isSoldOut) return;
    if (gold < item.price) {
      setToastMessage('골드가 부족합니다.');
      return;
    }

    addGold(-item.price);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { price, isSoldOut, id, ...cardBlueprint } = item;
    addCardToMasterDeck(cardBlueprint as Omit<Card, 'id'>);

    setToastMessage(`[${item.name}] 카드를 구매했습니다.`);

    // 배열 업데이트 (품절 동기화)
    const newArr = [...shopCards];
    newArr[idx].isSoldOut = true;
    setShopCards(newArr);
  };

  // 유물 구매 로직
  const handleBuyRelic = (idx: number) => {
    const item = shopRelics[idx];
    if (item.isSoldOut) return;
    if (gold < item.price) {
      setToastMessage('골드가 부족합니다.');
      return;
    }

    addGold(-item.price);
    addRelic(item.id);
    setToastMessage(`[${item.name}] 유물을 구매했습니다.`);

    const newArr = [...shopRelics];
    newArr[idx].isSoldOut = true;
    setShopRelics(newArr);
  };

  // 덱 압축 서비스 트리거
  const handleRemoveService = () => {
    if (!removeServiceAvailable) return;
    if (gold < REMOVE_PRICE) {
      setToastMessage('골드가 부족합니다.');
      return;
    }
    // 선 결제 대신 모달에서 진짜 제거가 확정될 때 차감하도록 모달만 먼저 띄움
    setIsRemoveModalOpen(true);
  };

  // 덱 압축 "성공" 시 콜백 (모달 안에서 실행됨)
  const onRemoveConfirm = () => {
    addGold(-REMOVE_PRICE);
    setRemoveServiceAvailable(false);
    setIsRemoveModalOpen(false);
    setToastMessage('카드를 제거했습니다.');
  };

  const handleLeave = () => {
    setScene('MAP');
  };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', backgroundColor: '#18181b', color: '#e5e7eb',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1000px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '42px', color: '#fbbf24', margin: 0 }}>
          💰 고철 암시장
        </h1>
        <div style={{ fontSize: '28px', color: '#fbbf24', alignSelf: 'center', backgroundColor: '#3f3f46', padding: '10px 20px', borderRadius: '8px' }}>
          보유 골드: {gold} G
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', maxWidth: '1000px', width: '100%' }}>
        {/* 카드 진열(70% 너비) */}
        <div style={{ flex: 7, backgroundColor: '#27272a', padding: '20px', borderRadius: '12px' }}>
          <h2 style={{ color: '#fff', marginBottom: '20px', borderBottom: '1px solid #52525b', paddingBottom: '10px' }}>장비 구입 (Cards)</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
            {shopCards.map((item, idx) => {
              let cardBg = '#2a2a4a';
              if (item.type.includes('ATTACK')) cardBg = '#4a2a2a';
              else if (item.type.includes('DEFENSE')) cardBg = '#2a4a3a';

              return (
                <div key={idx} style={{ position: 'relative' }}>
                  <div
                    onClick={() => handleBuyCard(idx)}
                    style={{
                      width: '160px', height: '240px',
                      backgroundColor: cardBg,
                      border: `2px solid #52525b`, borderRadius: '10px',
                      padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      opacity: item.isSoldOut ? 0.3 : 1,
                      cursor: item.isSoldOut ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.1s'
                    }}
                    onMouseEnter={e => { if (!item.isSoldOut) e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { if (!item.isSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#fff', textAlign: 'center' }}>{item.name}</h3>
                    <div style={{
                      backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px',
                      borderRadius: '20px', color: '#00ffff', marginBottom: '10px', fontSize: '12px'
                    }}>
                      AP: {item.costAp} {item.costAmmo > 0 && `| 탄: ${item.costAmmo}`}
                    </div>
                    <p style={{ color: '#ddd', fontSize: '13px', textAlign: 'center', lineHeight: '1.4' }}>
                      {item.description}
                    </p>
                  </div>

                  {/* 가격표 뱃지 */}
                  {!item.isSoldOut && (
                    <div style={{
                      position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: gold >= item.price ? '#b45309' : '#991b1b', // 살 수 없으면 빨간색
                      color: '#fff', padding: '5px 15px', borderRadius: '15px',
                      fontWeight: 'bold', fontSize: '16px', border: '2px solid #fbbf24',
                      zIndex: 10
                    }}>
                      {item.price} G
                    </div>
                  )}
                  {item.isSoldOut && (
                    <div style={{ position: 'absolute', top: '40%', left: '0', right: '0', textAlign: 'center', color: '#ef4444', fontSize: '24px', fontWeight: 'bold', transform: 'rotate(-20deg)' }}>SOLD OUT</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 유물 및 스페셜 (30% 너비) */}
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 유물 샵 */}
          <div style={{ backgroundColor: '#27272a', padding: '20px', borderRadius: '12px', flex: 1 }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', borderBottom: '1px solid #52525b', paddingBottom: '10px' }}>진귀한 유물</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {shopRelics.map((relic, idx) => (
                <div
                  key={idx}
                  onClick={() => handleBuyRelic(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '15px',
                    padding: '10px', backgroundColor: '#3f3f46', borderRadius: '8px',
                    opacity: relic.isSoldOut ? 0.3 : 1, cursor: relic.isSoldOut ? 'default' : 'pointer',
                    border: '1px solid #52525b'
                  }}
                >
                  <span style={{ fontSize: '36px' }}>{relic.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{relic.name}</div>
                    <div style={{ fontSize: '12px', color: '#a1a1aa' }}>[{relic.tier}]</div>
                  </div>
                  {!relic.isSoldOut && (
                    <div style={{ fontWeight: 'bold', color: gold >= relic.price ? '#fbbf24' : '#ef4444' }}>
                      {relic.price} G
                    </div>
                  )}
                  {relic.isSoldOut && <div style={{ color: '#ef4444', fontWeight: 'bold' }}>SOLD</div>}
                </div>
              ))}
              {shopRelics.length === 0 && <p style={{ color: '#a1a1aa' }}>판매 중인 유물이 없습니다.</p>}
            </div>
          </div>

          {/* 제거 서비스 */}
          <div style={{ backgroundColor: '#27272a', padding: '20px', borderRadius: '12px' }}>
            <h2 style={{ color: '#fff', marginBottom: '15px', borderBottom: '1px solid #52525b', paddingBottom: '10px' }}>서비스</h2>
            <button
              disabled={!removeServiceAvailable}
              onClick={handleRemoveService}
              style={{
                width: '100%', padding: '15px', backgroundColor: removeServiceAvailable ? '#7f1d1d' : '#3f3f46',
                color: removeServiceAvailable ? '#fca5a5' : '#71717a', border: '1px solid #991b1b',
                borderRadius: '8px', cursor: removeServiceAvailable ? 'pointer' : 'not-allowed',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🗑️ 덱 압축</span>
                <span style={{ fontSize: '12px' }}>카드 1장 버리기</span>
              </div>
              {removeServiceAvailable && (
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: gold >= REMOVE_PRICE ? '#fbbf24' : '#ef4444' }}>
                  {REMOVE_PRICE} G
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleLeave}
        style={{
          marginTop: '40px', padding: '15px 50px', fontSize: '20px',
          backgroundColor: '#3f3f46', color: '#fff', border: '1px solid #52525b',
          borderRadius: '8px', cursor: 'pointer'
        }}
      >
        은신처 떠나기
      </button>

      {/* 덱 압축 시 모달 연동 */}
      {isRemoveModalOpen && (
        <RemoveCardModal
          onClose={() => setIsRemoveModalOpen(false)}
          onRemoveComplete={onRemoveConfirm}
        />
      )}
    </div>
  );
};
