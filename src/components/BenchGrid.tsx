import React from 'react';
import {useSelector} from 'react-redux';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {RootState} from '../store/store';
import {useDraggable, useDroppable} from "@dnd-kit/core";
import {UnitType} from "../store/playerSlice.ts";

const BenchItem: React.FC<{ unit: UnitType }> = ({unit}) => {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({id: `bench-${unit.id}`});
    const style = {
        transform: CSS.Transform.toString({...transform, scaleX: 1, scaleY: 1},),
        touchAction: 'none',
        cursor: 'grab',
    };

    const src = new URL(`../assets/${unit.unitType}_Idle.gif`, import.meta.url).href;
    const starSrc = new URL(`../assets/star.png`, import.meta.url).href;

    return (
        <div ref={setNodeRef} style={{
            ...style,
            position: 'relative'
        }} {...attributes} {...listeners} className="bench-slot">
            <img src={src} style={{}}/>
            <div style={{
                position: 'absolute',
                bottom: -10,
                left: '50%',
                zIndex: 1000,
                transform: 'translateX(-50%)',
                display: 'flex',
            }}>
                {Array.from({length: unit.tier}, (_, i) =>
                    <img
                        key={i}
                        style={{
                            width: 15,
                            height: 15
                        }}
                        src={starSrc}
                        alt="tier star"
                    />)}
            </div>
        </div>
    );
};

const BenchGrid: React.FC = () => {
    const bench = useSelector((state: RootState) => state.player.bench);
    const {setNodeRef: setBenchRef, isOver: isBenchOver} = useDroppable({id: 'bench-drop'});

    // Создаем массив из 8 элементов
    const slots = Array.from({length: 8}, (_, i) => bench[i] || null);

    return (
        <div style={{position: 'relative'}}>
            <img
                src={`${import.meta.env.BASE_URL}assets/lavka.png`}
                style={{inset: 0, position: "absolute", width: '100%', height: '100%'}} alt=""/>
            <div
                className="bench-grid"
                ref={setBenchRef}
            >
                {slots.map((unit, index) =>
                    unit ? (
                        <BenchItem key={unit.id} unit={unit}/>
                    ) : (
                        <div key={`empty-${index}`} className="bench-slot"/>
                    )
                )}
            </div>
        </div>

    );
};

export default BenchGrid;