import React from 'react';
import {useSelector} from 'react-redux';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {RootState} from '../store/store';
import {useDroppable} from "@dnd-kit/core";
import {UnitType} from "../store/playerSlice.ts";

const BenchItem: React.FC<{ unit: UnitType }> = ({unit}) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: `bench-${unit.id}`});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab',
    };

    const src = new URL(`../assets/${unit.unitType}_Idle.gif`, import.meta.url).href;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bench-slot">
            <img src={src}/>
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
            <img src='/assets/lavka.png' style={{inset: 0, position: "absolute", width: '100%', height: '100%'}} alt=""/>
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