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
import { CardFrame } from '../components/ui/CardFrame';
import shopBg from '../assets/images/backgrounds/shop_map_background.webp';
import npcImg from '../assets/images/characters/merchant.webp';
import { iconGoldReward, iconCardRemove } from '../assets/images/GUI';

interface ShopCard extends Card { price: number; isSoldOut: boolean; }
interface ShopRelic extends Relic { price: number; isSoldOut: boolean; }

export const ShopView: React.FC = () => {
  const { gold, addGold, setScene, setToastMessage, relics: ownedRelics, addRelic } = useRunStore();
  const { addCardToMasterDeck } = useDeckStore();

  const [shopCards, setShopCards] = useState<ShopCard[]>([]);
  const [shopRelics, setShopRelics] = useState<ShopRelic[]>([]);
  const [removeServiceAvailable, setRemoveServiceAvailable] = useState(true);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const cardRemovalCount = useRunStore(s => s.cardRemovalCount);
  const hasMembership = ownedRelics.includes('merchant_membership');
  const discount = hasMembership ? 0.5 : 1;
  const REMOVE_PRICE = Math.floor((75 + cardRemovalCount * 25) * discount);

  // 프리뷰 상태
  const [previewCardIdx, setPreviewCardIdx] = useState<number | null>(null);
  const [previewRelicIdx, setPreviewRelicIdx] = useState<number | null>(null);

  useEffect(() => {
    const lootRng = useRngStore.getState().lootRng;
    const dropPool = ALL_CARDS.filter(c => c.tier !== 'BASIC');
    const shuffledCards = customShuffle(dropPool, lootRng);
    const selectedCards = shuffledCards.slice(0, 6).map((card, idx) => {
      const basePrice = lootRng.nextInt(4) * 10 + 50;
      const randomPrice = Math.floor(basePrice * discount);
      return { ...card, id: `shop_card_${idx}`, price: randomPrice, isSoldOut: false } as ShopCard;
    });
    setShopCards(selectedCards);

    const availableRelics = RELICS.filter(r => r.tier !== 'BOSS' && !ownedRelics.includes(r.id));
    const shuffledRelics = customShuffle(availableRelics, lootRng);
    const selectedRelics = shuffledRelics.slice(0, Math.min(3, shuffledRelics.length)).map(relic => {
      let price = 80;
      if (relic.tier === 'UNCOMMON') price = 120;
      else if (relic.tier === 'RARE') price = 200;
      price += lootRng.nextInt(5) * 10 - 20;
      price = Math.floor(price * discount);
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
    setPreviewCardIdx(null);
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
    setPreviewRelicIdx(null);
    await useRunStore.getState().saveRunData();
  };

  const handleRemoveService = () => {
    if (!removeServiceAvailable) return;
    if (gold < REMOVE_PRICE) { setToastMessage('골드가 부족합니다...'); return; }
    setIsRemoveModalOpen(true);
  };

  const onRemoveConfirm = async () => {
    addGold(-REMOVE_PRICE);
    useRunStore.setState(s => ({ cardRemovalCount: s.cardRemovalCount + 1 }));
    setRemoveServiceAvailable(false);
    setIsRemoveModalOpen(false);
    setToastMessage('카드를 덱에서 제거했습니다.');
    await useRunStore.getState().saveRunData();
  };

  const cardW = 140;
  const previewCardW = 280;
  const relicSize = 64;

  const previewCard = previewCardIdx !== null ? shopCards[previewCardIdx] : null;
  const previewRelic = previewRelicIdx !== null ? shopRelics[previewRelicIdx] : null;

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', height: '100vh',
      backgroundImage: `url(${shopBg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(18, 14, 10, 0.7)',
      color: '#e8dcc8',
      display: 'flex', flexDirection: 'row',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* 상인 NPC */}
      <img
        src={npcImg} alt="고철 상인"
        style={{
          position: 'absolute',
          right: 0, bottom: 0,
          height: '80%',
          objectFit: 'contain', objectPosition: 'bottom right',
          filter: 'drop-shadow(5px 10px 20px rgba(0,0,0,0.8))',
          pointerEvents: 'none', opacity: 0.5,
          zIndex: 0,
        }}
      />

      {/* 메인 컨텐츠 */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', zIndex: 1, position: 'relative',
      }}>
        {/* 골드 표시 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 24px',
          alignSelf: 'flex-end', flexShrink: 0,
        }}>
          <img src={iconGoldReward} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          <span style={{ fontSize: '20px', color: '#d4a854', fontWeight: 'bold' }}>{gold} G</span>
        </div>

        {/* 카드 + 유물 진열 영역 */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '20px',
          padding: '0 20px',
          overflow: 'hidden',
        }}>
          {/* 카드 진열 */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '14px',
            justifyContent: 'center', alignItems: 'flex-end',
            background: 'radial-gradient(ellipse at center, rgba(80, 60, 30, 0.12) 0%, transparent 70%)',
            padding: '10px',
          }}>
            {shopCards.map((item, idx) => (
              <div
                key={idx}
                onClick={() => { if (!item.isSoldOut) setPreviewCardIdx(idx); }}
                style={{
                  position: 'relative',
                  cursor: item.isSoldOut ? 'not-allowed' : 'pointer',
                  opacity: item.isSoldOut ? 0.3 : 1,
                  transition: 'transform 0.2s, filter 0.2s',
                  transform: `rotate(${(idx - 2.5) * 1.5}deg)`,
                }}
                onMouseEnter={e => { if (!item.isSoldOut) { e.currentTarget.style.transform = 'translateY(-8px) scale(1.08)'; e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(212, 168, 84, 0.3))'; } }}
                onMouseLeave={e => { if (!item.isSoldOut) { e.currentTarget.style.transform = `rotate(${(idx - 2.5) * 1.5}deg)`; e.currentTarget.style.filter = 'none'; } }}
              >
                <CardFrame card={item} width={cardW} />
                {!item.isSoldOut && (
                  <div style={{
                    position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: gold >= item.price ? 'rgba(80, 55, 15, 0.95)' : 'rgba(80, 20, 15, 0.95)',
                    color: gold >= item.price ? '#d4a854' : '#cc6666',
                    padding: '2px 10px', borderRadius: '10px',
                    fontWeight: 'bold', fontSize: '12px',
                    border: `1px solid ${gold >= item.price ? 'rgba(180, 140, 50, 0.5)' : 'rgba(180, 60, 60, 0.5)'}`,
                    zIndex: 10, whiteSpace: 'nowrap',
                  }}>
                    {item.price} G
                  </div>
                )}
                {item.isSoldOut && (
                  <div style={{
                    position: 'absolute', top: '40%', left: 0, right: 0, textAlign: 'center',
                    color: '#884444', fontSize: '16px', fontWeight: 'bold',
                    transform: 'rotate(-20deg)', textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  }}>SOLD OUT</div>
                )}
              </div>
            ))}
          </div>

          {/* 유물 진열 */}
          <div style={{
            display: 'flex', gap: '20px',
            justifyContent: 'center', alignItems: 'center',
            padding: '8px 16px',
          }}>
            {shopRelics.map((relic, idx) => (
              <div
                key={idx}
                onClick={() => { if (!relic.isSoldOut) setPreviewRelicIdx(idx); }}
                style={{
                  position: 'relative',
                  cursor: relic.isSoldOut ? 'not-allowed' : 'pointer',
                  opacity: relic.isSoldOut ? 0.3 : 1,
                  transition: 'transform 0.2s, filter 0.2s',
                  transform: `rotate(${(idx - 1) * 3}deg)`,
                }}
                onMouseEnter={e => { if (!relic.isSoldOut) { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(212, 168, 84, 0.4))'; } }}
                onMouseLeave={e => { if (!relic.isSoldOut) { e.currentTarget.style.transform = `rotate(${(idx - 1) * 3}deg)`; e.currentTarget.style.filter = 'none'; } }}
              >
                <div style={{
                  width: relicSize, height: relicSize,
                  backgroundColor: 'rgba(30, 25, 18, 0.9)',
                  border: '2px solid rgba(120, 90, 40, 0.5)',
                  borderRadius: '50%',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  overflow: 'hidden',
                }}>
                  {relic.image
                    ? <img src={relic.image} alt={relic.name} style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: relicSize * 0.5 }}>{relic.icon}</span>
                  }
                </div>
                {!relic.isSoldOut && (
                  <div style={{
                    position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: gold >= relic.price ? 'rgba(80, 55, 15, 0.95)' : 'rgba(80, 20, 15, 0.95)',
                    color: gold >= relic.price ? '#d4a854' : '#cc6666',
                    padding: '1px 6px', borderRadius: '8px',
                    fontWeight: 'bold', fontSize: '11px',
                    border: `1px solid ${gold >= relic.price ? 'rgba(180, 140, 50, 0.5)' : 'rgba(180, 60, 60, 0.5)'}`,
                    zIndex: 10, whiteSpace: 'nowrap',
                  }}>
                    {relic.price}G
                  </div>
                )}
                {relic.isSoldOut && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    color: '#884444', fontSize: '10px', fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  }}>SOLD</div>
                )}
              </div>
            ))}
            {shopRelics.length === 0 && <span style={{ color: '#6a5e4a', fontSize: '11px' }}>유물 없음</span>}

            {/* 덱 압축 */}
            <div style={{ width: '30px' }} />
            <button
              disabled={!removeServiceAvailable}
              onClick={handleRemoveService}
              style={{
                background: 'none', border: 'none',
                cursor: removeServiceAvailable ? 'pointer' : 'not-allowed',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                opacity: removeServiceAvailable ? 1 : 0.4,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => { if (removeServiceAvailable) e.currentTarget.style.transform = 'scale(1.15)'; }}
              onMouseLeave={e => { if (removeServiceAvailable) e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <img src={iconCardRemove} alt="덱 압축" style={{ width: 96, height: 96, objectFit: 'contain' }} />
              {removeServiceAvailable && (
                <span style={{ fontWeight: 'bold', fontSize: '12px', color: gold >= REMOVE_PRICE ? '#d4a854' : '#cc6666' }}>{REMOVE_PRICE}G</span>
              )}
            </button>
          </div>
        </div>

        {/* 하단: 떠나기 */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '12px 24px',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setScene('MAP')}
            style={{
              padding: '8px 24px',
              fontSize: '14px', fontWeight: 'bold',
              background: 'none', color: '#a09078',
              border: '1px solid rgba(120, 100, 70, 0.4)',
              borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
              textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
          >
            떠나기
          </button>
        </div>
      </div>

      {/* 카드 프리뷰 오버레이 */}
      {previewCard && !previewCard.isSoldOut && (
        <div
          onClick={() => setPreviewCardIdx(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '20px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ filter: 'drop-shadow(0 0 20px rgba(212, 168, 84, 0.3))' }}>
            <CardFrame card={previewCard} width={previewCardW} />
          </div>
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '18px', color: gold >= previewCard.price ? '#d4a854' : '#cc6666', fontWeight: 'bold' }}>
              {previewCard.price} G
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setPreviewCardIdx(null)}
                style={{
                  padding: '10px 24px', fontSize: '16px',
                  background: 'none', color: '#a09078', border: '1px solid rgba(120, 100, 70, 0.4)',
                  borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
              >
                닫기
              </button>
              <button
                onClick={() => handleBuyCard(previewCardIdx!)}
                disabled={gold < previewCard.price}
                style={{
                  padding: '10px 30px', fontSize: '18px', fontWeight: 'bold',
                  background: 'none',
                  color: gold >= previewCard.price ? '#d4a854' : '#888',
                  border: `1px solid ${gold >= previewCard.price ? 'rgba(212, 168, 84, 0.5)' : 'rgba(100, 100, 100, 0.3)'}`,
                  borderRadius: '6px',
                  cursor: gold >= previewCard.price ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={e => { if (gold >= previewCard.price) { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.8)'; e.currentTarget.style.color = '#e8c878'; } }}
                onMouseLeave={e => { if (gold >= previewCard.price) { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.5)'; e.currentTarget.style.color = '#d4a854'; } }}
              >
                구입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 유물 프리뷰 오버레이 */}
      {previewRelic && !previewRelic.isSoldOut && (
        <div
          onClick={() => setPreviewRelicIdx(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '20px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          }}>
            {/* 유물 확대 이미지 */}
            <div style={{
              width: 120, height: 120,
              backgroundColor: 'rgba(30, 25, 18, 0.95)',
              border: '3px solid rgba(180, 140, 50, 0.6)',
              borderRadius: '50%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              overflow: 'hidden',
              filter: 'drop-shadow(0 0 20px rgba(212, 168, 84, 0.3))',
            }}>
              {previewRelic.image
                ? <img src={previewRelic.image} alt={previewRelic.name} style={{ width: '75%', height: '75%', objectFit: 'contain' }} />
                : <span style={{ fontSize: 60 }}>{previewRelic.icon}</span>
              }
            </div>

            {/* 유물 정보 */}
            <div style={{ textAlign: 'center', maxWidth: '300px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#e0d4bc' }}>{previewRelic.name}</h3>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#8a7e6a' }}>[{previewRelic.tier}]</p>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#b8a888', lineHeight: '1.4' }}>{previewRelic.description}</p>
              <div style={{ fontSize: '18px', color: gold >= previewRelic.price ? '#d4a854' : '#cc6666', fontWeight: 'bold', marginBottom: '12px' }}>
                {previewRelic.price} G
              </div>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
              <button
                onClick={() => setPreviewRelicIdx(null)}
                style={{
                  padding: '10px 24px', fontSize: '16px',
                  background: 'none', color: '#a09078', border: '1px solid rgba(120, 100, 70, 0.4)',
                  borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(180, 150, 100, 0.6)'; e.currentTarget.style.color = '#c8b898'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(120, 100, 70, 0.4)'; e.currentTarget.style.color = '#a09078'; }}
              >
                닫기
              </button>
              <button
                onClick={() => handleBuyRelic(previewRelicIdx!)}
                disabled={gold < previewRelic.price}
                style={{
                  padding: '10px 30px', fontSize: '18px', fontWeight: 'bold',
                  background: 'none',
                  color: gold >= previewRelic.price ? '#d4a854' : '#888',
                  border: `1px solid ${gold >= previewRelic.price ? 'rgba(212, 168, 84, 0.5)' : 'rgba(100, 100, 100, 0.3)'}`,
                  borderRadius: '6px',
                  cursor: gold >= previewRelic.price ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  textShadow: '1px 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={e => { if (gold >= previewRelic.price) { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.8)'; e.currentTarget.style.color = '#e8c878'; } }}
                onMouseLeave={e => { if (gold >= previewRelic.price) { e.currentTarget.style.borderColor = 'rgba(212, 168, 84, 0.5)'; e.currentTarget.style.color = '#d4a854'; } }}
              >
                구입
              </button>
            </div>
          </div>
        </div>
      )}

      {isRemoveModalOpen && (
        <RemoveCardModal
          onClose={() => setIsRemoveModalOpen(false)}
          onRemoveComplete={onRemoveConfirm}
        />
      )}
    </div>
  );
};
