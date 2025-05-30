import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store/store';
import {buyUnit, UnitType} from '../store/playerSlice';
import {closeShop, openShop, rerollShop} from '../store/shopSlice';
import {useRoom} from "../context/RoomContext.tsx";

const ShopPanel: React.FC = () => {

    const isShopVisible = useSelector((state: RootState) => state.shop.isOpen);

    const room = useRoom()
    const dispatch = useDispatch();
    const offers = useSelector((state: RootState) => state.shop.offers);
    const gold = useSelector((state: RootState) => state.player.balance);
    const cost = useSelector((state: RootState) => state.shop.rerollCost);

    const onBuy = (unit: UnitType) => {
        if (gold >= unit.cost) {
            dispatch(buyUnit(unit));
            room?.send('buyFromShop', {offerId: unit.id});
        }
    };

    const onReroll = () => {
        if (gold >= cost) {
            dispatch(rerollShop());
            room?.send('refreshShop', {});
        }
    };

    const getUnitStat = (item: UnitType) => {
        let result = ''

        if (item.baseAttackPower) {
            result += `${item.baseAttackPower} ⚔️ `
        }
        if (item.baseHp) {
            result += `${item.baseHp} ❤️\r\n`
        }
        if (item.baseAttackRange) {
            result += item.baseAttackRange > 1 ? `🏹\r\n` : ''
        }

        return result
    }

    return (
        <>
            <div className="shop-container">
                <div className={`shop-panel ${isShopVisible ? '' : 'hidden'}`}>
                    <button
                        className="close-button"
                        onClick={() => dispatch(closeShop())}
                    >
                        ×
                    </button>
                    <h2>Shop</h2>
                    <div className="shop-items">
                        {offers.map(unit => {
                            const src = new URL(`../assets/${unit.unitType}_Idle.gif`, import.meta.url).href;
                            return (
                                <div key={unit.id} className="shop-card" onClick={() => onBuy(unit)}>
                                    <img src={src} alt={unit.unitType}/>
                                    <p>{unit.cost}🪙</p>
                                    <p style={{
                                        margin: '0'
                                    }}>
                                        {getUnitStat(unit)}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                    <button className="reroll-button" onClick={onReroll}>
                        Reroll ({cost} 🪙)
                    </button>
                </div>
            </div>
            <button
                className="open-button"
                onClick={() => dispatch(openShop())}
            >
                <img src={`${import.meta.env.BASE_URL}assets/StoreButton.png`} alt=""
                     style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
            </button>
        </>
    );
};

export default ShopPanel;