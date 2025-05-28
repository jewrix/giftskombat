import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../store/store';
import {Item} from '../store/playerSlice';
import {useRoom} from "../context/RoomContext.tsx";
import {closeItemShop} from "../store/itemShopSlice.ts";

const ItemShopPanel: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>();
    const isVisible = useSelector((state: RootState) => state.itemShop.isOpen);

    const room = useRoom()
    const offers = useSelector((state: RootState) => state.itemShop.offers);

    const onBuy = (item: Item) => {
        room?.send('buy_item', {itemId: item.id});
        dispatch(closeItemShop());
    };

    const getItemBuff = (item: Item) => {
        let result = ''

        if (item.attackBonus) {
            result += `${item.attackBonus} к урону `
        }
        if (item.hpBonus) {
            result += `${item.hpBonus} к здоровью `
        }
        if (item.speedBonus) {
            result += `${item.speedBonus} к скорости `
        }
        if (item.rangeBonus) {
            result += `${item.rangeBonus} к дальности `
        }
        if (item.costBonus) {
            result += `${item.costBonus} к стоимости `
        }
        if (item.armorBonus) {
            result += `${item.armorBonus} к броне `
        }

        return result
    }

    return (
        <>
            <div className="shop-container">
                <div className={`shop-panel ${isVisible ? '' : 'hidden'}`}>
                    <h2>Выбери предмет</h2>
                    <div className="shop-items">
                        {offers.map(unit => {
                            const src = new URL(`../assets/items/${unit.name}_Item.png`, import.meta.url).href;
                            return (
                                <div key={unit.id} className="shop-card" onClick={() => onBuy(unit)}>
                                    <img src={src} alt={unit.name}/>
                                    <span>
                                        {getItemBuff(unit)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ItemShopPanel;