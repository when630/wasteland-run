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
import shopBg from '../assets/images/backgrounds/shop_map_background.png';
import npcImg from '../assets/images/characters/merchant.png';
import { iconGoldReward, iconCardRemove } from '../assets/images/GUI';
import { useResponsive } from '../hooks/useResponsive';

interface ShopCard extends Card { price: number; isSoldOut: boolean; }
interface ShopRelic extends Relic { price: number; isSoldOut: boolean; }

export const ShopView: React.FC = () => {
  const { gold, addGold, setScene, setToastMessage, relics: ownedRelics, addRelic } = useRunStore();
  const { isMobile } = useResponsive();
  const { addCardToMasterDeck } = useDeckStore();

  const [shopCards, setShopCards] = useState<ShopCard[]>([]);
  const [shopRelics, setShopRelics] = useState<ShopRelic[]>([]);
  const [removeServiceAvailable, setRemoveServiceAvailable] = useState(true);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const REMOVE_PRICE = 50;

  useEffect(() => {
    const lootRng = useRngStore.getState().lootRng;
    const chapter = useRunStore.getState().currentChapter;
    const dropPool = ALL_CARDS.filter(c => c.tier !== 'BASIC' && (c.chapter ?? 1) <= chapter);
    const shuffledCards = customShuffle(dropPool, lootRng);
    const selectedCards = shuffledCards.slice(0, 6).map((card, idx) => {
      const randomPrice = lootRng.nextInt(4) * 10 + 50;
      return { ...card, id: `shop_card_${idx}`, price: randomPrice, isSoldOut: false } as ShopCard;
    });
    setShopCards(selectedCards);

    const availableRelics = RELICS.filter(r => r.tier !== 'BOSS' && !ownedRelics.includes(r.id));
    const shuffledRelics = customShuffle(availableRelics, lootRng);
    const selectedRelics = shuffledRelics.slice(0, Math.min(2, shuffledRelics.length)).map(relic => {
      let price = 80;
      if (relic.tier === 'UNCOMMON') price = 120;
      else if (relic.tier === 'RARE') price = 200;
      price += lootRng.nextInt(5) * 10 - 20;
      return { ...relic, price, isSoldOut: false };
    });
    setShopRelics(selectedRelics);
    setRemoveServiceAvailable(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuyCard = async (idx: number) => {
    const item = shopCards[idx];
    if (item.isSoldOut) return;
    if (gold < item.price) { setToastMessage('골드가 부족합니다...'); return; }
    addGold(-item.price);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { price, isSoldOut, id, ...cardBlueprint } = item;
    addCardToMasterDeck(cardBlueprint as Omit<Card, 'id'>);
    setToastMessage(`${item.name} 획득!`);
    const newArr = [...shopCards]; newArr[idx].isSoldOut = true; setShopCards(newArr);
    await useRunStore.getState().saveRunData();
  };

  const handleBuyRelic = async (idx: number) => {
    const item = shopRelics[idx];
    if (item.isSoldOut) return;
    if (gold < item.price) { setToastMessage('골드가 부족합니다...'); return; }
    addGold(-item.price);
    addRelic(item.id);
    setToastMessage(`${item.name} 획득!`);
    const newArr = [...shopRelics]; newArr[idx].isSoldOut = true; setShopRelics(newArr);
    await useRunStore.getState().saveRunData();
  };

  const handleRemoveService = () => {
    if (!removeServiceAvailable) return;
    if (gold < REMOVE_PRICE) { setToastMessage('골드가 부족합니다...'); return; }
    setIsRemoveModalOpen(true);
  };

  const onRemoveConfirm = async () => {
    addGold(-REMOVE_PRICE);
    setRemoveServiceAvailable(false);
    setIsRemoveModalOpen(false);
    setToastMessage('카드를 덱에서 제거했습니다.');
    await useRunStore.getState().saveRunData();
  };

  // 공용 스타일
  const panelBg = 'rgba(18, 15, 10, 0.88)';
  const panelBorder = '1px solid rgba(120, 90, 40, 0.25)';

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', height: '100vh',
      backgroundImage: `url(${shopBg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(18, 14, 10, 0.7)',
      color: '#e8dcc8',
      display: 'flex', flexDirection: isMobile ? 'column' : 'row',
      overflow: isMobile ? 'auto' : 'hidden',
    }}>

      {/* 좌측: 상점 진열대 */}
      <div style={{
        flex: isMobile ? undefined : 6,
        padding: isMobile ? '12px' : '20px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        overflowY: isMobile ? 'auto' : 'hidden',
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: panelBg, padding: isMobile ? '10px 14px' : '12px 22px',
          borderRadius: '8px', border: panelBorder, flexWrap: 'wrap', gap: '4px',
          boxShadow: '0 2px 15px rgba(0,0,0,0.3)',
        }}>
          <h1 style={{
            fontSize: isMobile ? '20px' : '28px', color: '#d4a854', margin: 0,
            display: 'flex', alignItems: 'center', gap: '8px',
            textShadow: '1px 2px 3px rgba(0,0,0,0.7)',
          }}>
            <img src={iconGoldReward} alt="" style={{ width: isMobile ? 24 : 30, height: isMobile ? 24 : 30, objectFit: 'contain', filter: 'drop-shadow(0 0 4px rgba(212,168,84,0.5))' }} />
            고철 암시장
          </h1>
          <div style={{ fontSize: isMobile ? '16px' : '20px', color: '#d4a854', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            {gold} G
          </div>
        </div>

        {/* 카드 판매 */}
        <div style={{ backgroundColor: panelBg, padding: '15px', borderRadius: '8px', border: panelBorder }}>
          <h2 style={{ color: '#b8a078', margin: '0 0 10px 0', borderBottom: '1px solid rgba(120, 90, 40, 0.2)', paddingBottom: '8px', fontSize: '18px' }}>장비 구입</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 130px)', gap: '10px', justifyContent: 'center' }}>
            {shopCards.map((item, idx) => {
              let cardBorder = 'rgba(100, 80, 50, 0.4)';
              if (item.type.includes('ATTACK')) cardBorder = 'rgba(180, 80, 60, 0.4)';
              else if (item.type.includes('DEFENSE')) cardBorder = 'rgba(60, 140, 100, 0.4)';

              return (
                <div key={idx} style={{ position: 'relative' }}>
                  <div
                    onClick={() => handleBuyCard(idx)}
                    style={{
                      width: isMobile ? '100%' : '130px', height: isMobile ? '140px' : '170px',
                      backgroundColor: 'rgba(25, 20, 15, 0.9)',
                      border: `1px solid ${cardBorder}`, borderRadius: '8px',
                      padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                      opacity: item.isSoldOut ? 0.25 : 1,
                      cursor: item.isSoldOut ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { if (!item.isSoldOut) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(180, 140, 50, 0.15)'; } }}
                    onMouseLeave={e => { if (!item.isSoldOut) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; } }}
                  >
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#e0d4bc', textAlign: 'center' }}>{item.name}</h3>
                    <div style={{
                      backgroundColor: 'rgba(0,0,0,0.4)', padding: '2px 8px',
                      borderRadius: '4px', color: '#88bbcc', marginBottom: '6px', fontSize: '10px',
                      border: '1px solid rgba(80, 130, 180, 0.2)',
                    }}>
                      AP: {item.costAp} {item.costAmmo > 0 && `| 탄: ${item.costAmmo}`}
                    </div>
                    <p style={{ color: '#a09888', fontSize: '11px', textAlign: 'center', lineHeight: '1.3', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                  </div>

                  {!item.isSoldOut && (
                    <div style={{
                      position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: gold >= item.price ? 'rgba(80, 55, 15, 0.95)' : 'rgba(80, 20, 15, 0.95)',
                      color: gold >= item.price ? '#d4a854' : '#cc6666', padding: '3px 12px', borderRadius: '4px',
                      fontWeight: 'bold', fontSize: '12px',
                      border: `1px solid ${gold >= item.price ? 'rgba(180, 140, 50, 0.5)' : 'rgba(180, 60, 60, 0.5)'}`,
                      zIndex: 10,
                    }}>
                      {item.price} G
                    </div>
                  )}
                  {item.isSoldOut && (
                    <div style={{ position: 'absolute', top: '40%', left: '0', right: '0', textAlign: 'center', color: '#884444', fontSize: '16px', fontWeight: 'bold', transform: 'rotate(-20deg)', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>SOLD OUT</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 유물 & 서비스 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ backgroundColor: panelBg, padding: '15px', borderRadius: '8px', border: panelBorder, flex: 1 }}>
            <h2 style={{ color: '#b8a078', margin: '0 0 10px 0', borderBottom: '1px solid rgba(120, 90, 40, 0.2)', paddingBottom: '8px', fontSize: '16px' }}>진귀한 유물</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shopRelics.map((relic, idx) => (
                <div
                  key={idx}
                  onClick={() => handleBuyRelic(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', backgroundColor: 'rgba(25, 20, 15, 0.8)', borderRadius: '6px',
                    opacity: relic.isSoldOut ? 0.25 : 1, cursor: relic.isSoldOut ? 'default' : 'pointer',
                    border: '1px solid rgba(100, 80, 50, 0.25)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!relic.isSoldOut) { e.currentTarget.style.backgroundColor = 'rgba(40, 32, 22, 0.9)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(180, 140, 50, 0.1)'; } }}
                  onMouseLeave={e => { if (!relic.isSoldOut) { e.currentTarget.style.backgroundColor = 'rgba(25, 20, 15, 0.8)'; e.currentTarget.style.boxShadow = 'none'; } }}
                >
                  <span style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {relic.image ? <img src={relic.image} alt={relic.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '28px' }}>{relic.icon}</span>}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#e0d4bc', fontSize: '14px' }}>{relic.name}</div>
                    <div style={{ fontSize: '10px', color: '#8a7e6a' }}>[{relic.tier}]</div>
                  </div>
                  {!relic.isSoldOut && (
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: gold >= relic.price ? '#d4a854' : '#cc6666' }}>
                      {relic.price} G
                    </div>
                  )}
                  {relic.isSoldOut && <div style={{ color: '#884444', fontWeight: 'bold', fontSize: '12px' }}>SOLD</div>}
                </div>
              ))}
              {shopRelics.length === 0 && <p style={{ color: '#6a5e4a', fontSize: '12px' }}>판매 중인 유물이 없습니다.</p>}
            </div>
          </div>

          <div style={{ backgroundColor: panelBg, padding: '15px', borderRadius: '8px', border: panelBorder, flex: 1 }}>
            <h2 style={{ color: '#b8a078', margin: '0 0 10px 0', borderBottom: '1px solid rgba(120, 90, 40, 0.2)', paddingBottom: '8px', fontSize: '16px' }}>서비스</h2>
            <button
              disabled={!removeServiceAvailable}
              onClick={handleRemoveService}
              style={{
                width: '100%', padding: '12px 15px',
                backgroundColor: removeServiceAvailable ? 'rgba(60, 20, 15, 0.85)' : 'rgba(25, 20, 15, 0.5)',
                color: removeServiceAvailable ? '#cc8888' : '#5a5040',
                border: `1px solid ${removeServiceAvailable ? 'rgba(180, 60, 60, 0.3)' : 'rgba(60, 50, 40, 0.2)'}`,
                borderRadius: '6px', cursor: removeServiceAvailable ? 'pointer' : 'not-allowed',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (removeServiceAvailable) { e.currentTarget.style.backgroundColor = 'rgba(80, 30, 20, 0.9)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(180, 60, 60, 0.15)'; } }}
              onMouseLeave={e => { if (removeServiceAvailable) { e.currentTarget.style.backgroundColor = 'rgba(60, 20, 15, 0.85)'; e.currentTarget.style.boxShadow = 'none'; } }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={iconCardRemove} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} /> 덱 압축
                </span>
                <span style={{ fontSize: '11px', marginTop: '4px', color: removeServiceAvailable ? '#8a6a6a' : '#4a4030' }}>카드 1장 버리기</span>
              </div>
              {removeServiceAvailable && (
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: gold >= REMOVE_PRICE ? '#d4a854' : '#cc6666' }}>
                  {REMOVE_PRICE} G
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 우측: NPC + 나가기 */}
      <div style={{
        flex: isMobile ? undefined : 4,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', alignItems: 'center',
        padding: isMobile ? '16px' : '20px',
        position: 'relative',
        borderLeft: isMobile ? undefined : '1px solid rgba(120, 90, 40, 0.15)',
        backgroundColor: 'rgba(0,0,0,0.25)',
      }}>
        {!isMobile && (
          <img
            src={npcImg} alt="고철 상인"
            style={{
              height: '75vh', width: '100%',
              objectFit: 'contain', objectPosition: 'bottom center',
              filter: 'drop-shadow(5px 10px 20px rgba(0,0,0,0.8))',
              pointerEvents: 'none',
            }}
          />
        )}

        <button
          onClick={() => setScene('MAP')}
          style={{
            marginTop: isMobile ? '0' : '20px',
            padding: isMobile ? '14px 30px' : '18px 55px',
            fontSize: isMobile ? '16px' : '20px', fontWeight: 'bold',
            backgroundColor: 'rgba(40, 35, 28, 0.9)', color: '#a09078',
            border: '1px solid rgba(120, 100, 70, 0.4)',
            borderRadius: '6px', cursor: 'pointer',
            transition: 'all 0.2s', zIndex: 10,
            width: isMobile ? '100%' : undefined,
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(55, 48, 35, 0.95)'; e.currentTarget.style.color = '#c8b898'; e.currentTarget.style.boxShadow = '0 0 12px rgba(120, 100, 70, 0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(40, 35, 28, 0.9)'; e.currentTarget.style.color = '#a09078'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          은신처 떠나기
        </button>
      </div>

      {isRemoveModalOpen && (
        <RemoveCardModal
          onClose={() => setIsRemoveModalOpen(false)}
          onRemoveComplete={onRemoveConfirm}
        />
      )}
    </div>
  );
};
