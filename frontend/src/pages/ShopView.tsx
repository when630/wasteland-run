import React, { useState, useEffect } from 'react';
import { useRunStore } from '../store/useRunStore';
import { useDeckStore } from '../store/useDeckStore';
import { ALL_CARDS } from '../assets/data/cards';
import { RELICS } from '../assets/data/relics';
import type { Card } from '../types/gameTypes';
import type { Relic } from '../types/relicTypes';
import { customShuffle } from '../utils/rng';
import { useRngStore } from '../store/useRngStore';
import { RemoveCardModal } from '../components/ui/RemoveCardModal';
import shopBg from '../assets/images/shop_map_background.png';
import npcImg from '../assets/images/merchant.png';

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
    // 1. 판매할 카드 6장 무작위 뽑기
    const lootRng = useRngStore.getState().lootRng;
    const dropPool = ALL_CARDS.filter(c => c.tier !== 'BASIC');
    const shuffledCards = customShuffle(dropPool, lootRng);
    const selectedCards = shuffledCards.slice(0, 6).map((card, idx) => {
      // 50~80 랜덤 골드 책정 (10단위)
      const randomPrice = lootRng.nextInt(4) * 10 + 50;
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
    const shuffledRelics = customShuffle(availableRelics, lootRng);
    const selectedRelics = shuffledRelics.slice(0, Math.min(2, shuffledRelics.length)).map(relic => {
      // 티어별 기본 가격 산정 (유물 구매 접근성 상향)
      let price = 80;
      if (relic.tier === 'UNCOMMON') price = 120;
      else if (relic.tier === 'RARE') price = 200;

      // 약간의 랜덤 편차 (-20 ~ +20)
      price += lootRng.nextInt(5) * 10 - 20;
      return { ...relic, price, isSoldOut: false };
    });
    setShopRelics(selectedRelics);

    setRemoveServiceAvailable(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 카드 구매 로직
  const handleBuyCard = async (idx: number) => {
    const item = shopCards[idx];
    if (item.isSoldOut) return;
    if (gold < item.price) {
      setToastMessage('골드가 부족합니다…');
      return;
    }

    addGold(-item.price);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { price, isSoldOut, id, ...cardBlueprint } = item;
    addCardToMasterDeck(cardBlueprint as Omit<Card, 'id'>);

    setToastMessage(`${item.name} 획득!`);

    // 배열 업데이트 (품절 동기화)
    const newArr = [...shopCards];
    newArr[idx].isSoldOut = true;
    setShopCards(newArr);

    // 자동 저장
    await useRunStore.getState().saveRunData();
  };

  // 유물 구매 로직
  const handleBuyRelic = async (idx: number) => {
    const item = shopRelics[idx];
    if (item.isSoldOut) return;
    if (gold < item.price) {
      setToastMessage('골드가 부족합니다…');
      return;
    }

    addGold(-item.price);
    addRelic(item.id);
    setToastMessage(`${item.name} 획득!`);

    const newArr = [...shopRelics];
    newArr[idx].isSoldOut = true;
    setShopRelics(newArr);

    // 자동 저장
    await useRunStore.getState().saveRunData();
  };

  // 덱 압축 서비스 트리거
  const handleRemoveService = () => {
    if (!removeServiceAvailable) return;
    if (gold < REMOVE_PRICE) {
      setToastMessage('골드가 부족합니다…');
      return;
    }
    // 선 결제 대신 모달에서 진짜 제거가 확정될 때 차감하도록 모달만 먼저 띄움
    setIsRemoveModalOpen(true);
  };

  // 덱 압축 "성공" 시 콜백 (모달 안에서 실행됨)
  const onRemoveConfirm = async () => {
    addGold(-REMOVE_PRICE);
    setRemoveServiceAvailable(false);
    setIsRemoveModalOpen(false);
    setToastMessage('카드를 덱에서 제거했습니다.');

    // 자동 저장
    await useRunStore.getState().saveRunData();
  };

  const handleLeave = async () => {
    setScene('MAP');
    await useRunStore.getState().saveRunData();
  };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', height: '100vh', // 전체 화면 고정
      backgroundImage: `url(${shopBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(24, 24, 27, 0.7)',
      color: '#e5e7eb',
      display: 'flex', flexDirection: 'row', // 🌟 가로 2단 분리 레이아웃
      overflow: 'hidden'
    }}>

      {/* 🌟 좌측 패널: 상점 진열대 (약 60%) */}
      <div style={{
        flex: 6,
        padding: '20px',
        display: 'flex', flexDirection: 'column',
        gap: '15px',
        overflowY: 'hidden' // 스크롤 발생을 완전히 차단
      }}>
        {/* 상단 타이틀 및 골드 정보 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '12px' }}>
          <h1 style={{ fontSize: '32px', color: '#fbbf24', margin: 0 }}>
            💰 고철 암시장
          </h1>
          <div style={{ fontSize: '20px', color: '#fbbf24', fontWeight: 'bold' }}>
            보유 골드: {gold} G
          </div>
        </div>

        {/* 🌟 장비(카드) 판매 구역 (6장 최적화) */}
        <div style={{ backgroundColor: '#27272a', padding: '15px', borderRadius: '12px' }}>
          <h2 style={{ color: '#fff', margin: '0 0 10px 0', borderBottom: '1px solid #52525b', paddingBottom: '8px', fontSize: '20px' }}>장비 구입 (Cards)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 130px)', gap: '10px', justifyContent: 'center' }}>
            {shopCards.map((item, idx) => {
              let cardBg = '#2a2a4a';
              if (item.type.includes('ATTACK')) cardBg = '#4a2a2a';
              else if (item.type.includes('DEFENSE')) cardBg = '#2a4a3a';

              return (
                <div key={idx} style={{ position: 'relative' }}>
                  <div
                    onClick={() => handleBuyCard(idx)}
                    style={{
                      width: '130px', height: '170px',
                      backgroundColor: cardBg,
                      border: `2px solid #52525b`, borderRadius: '10px',
                      padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      opacity: item.isSoldOut ? 0.3 : 1,
                      cursor: item.isSoldOut ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.1s'
                    }}
                    onMouseEnter={e => { if (!item.isSoldOut) e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { if (!item.isSoldOut) e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#fff', textAlign: 'center' }}>{item.name}</h3>
                    <div style={{
                      backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 6px',
                      borderRadius: '16px', color: '#00ffff', marginBottom: '6px', fontSize: '10px'
                    }}>
                      AP: {item.costAp} {item.costAmmo > 0 && `| 탄: ${item.costAmmo}`}
                    </div>
                    <p style={{ color: '#ddd', fontSize: '11px', textAlign: 'center', lineHeight: '1.3', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                  </div>

                  {/* 가격표 뱃지 */}
                  {!item.isSoldOut && (
                    <div style={{
                      position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: gold >= item.price ? '#b45309' : '#991b1b',
                      color: '#fff', padding: '3px 10px', borderRadius: '10px',
                      fontWeight: 'bold', fontSize: '12px', border: '2px solid #fbbf24',
                      zIndex: 10
                    }}>
                      {item.price} G
                    </div>
                  )}
                  {item.isSoldOut && (
                    <div style={{ position: 'absolute', top: '40%', left: '0', right: '0', textAlign: 'center', color: '#ef4444', fontSize: '18px', fontWeight: 'bold', transform: 'rotate(-20deg)' }}>SOLD OUT</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 🌟 유물 & 서비스 구역 (높이 압축) */}
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* 유물 샵 */}
          <div style={{ backgroundColor: '#27272a', padding: '15px', borderRadius: '12px', flex: 1 }}>
            <h2 style={{ color: '#fff', margin: '0 0 10px 0', borderBottom: '1px solid #52525b', paddingBottom: '8px', fontSize: '18px' }}>진귀한 유물</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {shopRelics.map((relic, idx) => (
                <div
                  key={idx}
                  onClick={() => handleBuyRelic(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px', backgroundColor: '#3f3f46', borderRadius: '8px',
                    opacity: relic.isSoldOut ? 0.3 : 1, cursor: relic.isSoldOut ? 'default' : 'pointer',
                    border: '1px solid #52525b', transition: 'transform 0.1s'
                  }}
                  onMouseEnter={e => { if (!relic.isSoldOut) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { if (!relic.isSoldOut) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {relic.image ? <img src={relic.image} alt={relic.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '30px' }}>{relic.icon}</span>}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{relic.name}</div>
                    <div style={{ fontSize: '10px', color: '#a1a1aa' }}>[{relic.tier}]</div>
                  </div>
                  {!relic.isSoldOut && (
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: gold >= relic.price ? '#fbbf24' : '#ef4444' }}>
                      {relic.price} G
                    </div>
                  )}
                  {relic.isSoldOut && <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px' }}>SOLD</div>}
                </div>
              ))}
              {shopRelics.length === 0 && <p style={{ color: '#a1a1aa', fontSize: '12px' }}>판매 중인 유물이 없습니다.</p>}
            </div>
          </div>

          {/* 제거 서비스 */}
          <div style={{ backgroundColor: '#27272a', padding: '15px', borderRadius: '12px', flex: 1 }}>
            <h2 style={{ color: '#fff', margin: '0 0 10px 0', borderBottom: '1px solid #52525b', paddingBottom: '8px', fontSize: '18px' }}>서비스</h2>
            <button
              disabled={!removeServiceAvailable}
              onClick={handleRemoveService}
              style={{
                width: '100%', padding: '12px 15px', backgroundColor: removeServiceAvailable ? '#7f1d1d' : '#3f3f46',
                color: removeServiceAvailable ? '#fca5a5' : '#71717a', border: '1px solid #991b1b',
                borderRadius: '8px', cursor: removeServiceAvailable ? 'pointer' : 'not-allowed',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'filter 0.1s'
              }}
              onMouseEnter={e => { if (removeServiceAvailable) e.currentTarget.style.filter = 'brightness(1.2)'; }}
              onMouseLeave={e => { if (removeServiceAvailable) e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>🗑️ 덱 압축</span>
                <span style={{ fontSize: '12px', marginTop: '4px' }}>카드 1장 버리기</span>
              </div>
              {removeServiceAvailable && (
                <span style={{ fontWeight: 'bold', fontSize: '20px', color: gold >= REMOVE_PRICE ? '#fbbf24' : '#ef4444' }}>
                  {REMOVE_PRICE} G
                </span>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 🌟 우측 패널: 거대 NPC 및 나가기 버튼 (약 40%) */}
      <div style={{
        flex: 4,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', alignItems: 'center',
        padding: '20px',
        position: 'relative',
        borderLeft: '2px dashed rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.3)'
      }}>
        {/* 매우 큰 NPC 이미지 */}
        <img
          src={npcImg}
          alt="고철 상인"
          style={{
            height: '75vh', // 화면 높이의 75% 차지
            width: '100%',
            objectFit: 'contain',
            objectPosition: 'bottom center', // 하단 정렬
            filter: 'drop-shadow(5px 10px 15px rgba(0,0,0,0.8))',
            pointerEvents: 'none' // 클릭 방해 방지
          }}
        />

        {/* 나가기 버튼 */}
        <button
          onClick={handleLeave}
          style={{
            marginTop: '20px', padding: '20px 60px', fontSize: '24px', fontWeight: 'bold',
            backgroundColor: '#3f3f46', color: '#fff', border: '2px solid #a1a1aa',
            borderRadius: '12px', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            transition: 'all 0.2s', zIndex: 10
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#52525b'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3f3f46'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          은신처 떠나기 🏃
        </button>
      </div>

      {/* 덱 압축 시 모달 연동 (전체화면 오버레이이므로 위치 무관) */}
      {isRemoveModalOpen && (
        <RemoveCardModal
          onClose={() => setIsRemoveModalOpen(false)}
          onRemoveComplete={onRemoveConfirm}
        />
      )}
    </div>
  );
};
