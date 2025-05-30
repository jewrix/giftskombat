import React from 'react';
import {useSelector} from 'react-redux';
import {useDndMonitor, useDraggable, useDroppable} from '@dnd-kit/core';
import {RootState} from '../store/store';
import {UnitType} from "../store/playerSlice.ts";
import {useRoom} from "../context/RoomContext.tsx";
import {CSS} from '@dnd-kit/utilities';

interface CellProps {
    row: number;
    col: number;
    unit?: UnitType;
}

const style = (isOver?: boolean, isDraggable?: boolean): React.CSSProperties => ({
    border: isOver ? '1px solid #00f' : '1px dashed #ccc',
    width: '5vw',
    height: '10vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isDraggable ? 'grab' : 'default',
    position: 'relative',
    backgroundColor: 'transparent',
});

const EnemyCell = () => {
    return <div className="board-cell" style={{...style(), backgroundColor: 'gray',}}></div>;
};


const Cell: React.FC<CellProps> = ({row, col, unit}) => {
    // Зона для drop
    const dropId = `cell-${row}-${col}`;
    const {setNodeRef: setDropRef, isOver} = useDroppable({id: dropId});

    // Draggable для юнита, если он есть
    const draggableId = unit ? `cell-${row}-${col}-${unit.id}` : '';
    const isDraggable = Boolean(unit);
    const {attributes, listeners, setNodeRef: setDragRef, transform} = useDraggable({id: draggableId});

    const src = new URL(`../assets/${unit?.unitType}_Idle.gif`, import.meta.url).href;
    const starSrc = new URL(`../assets/star.png`, import.meta.url).href;

    return (
        <div
            ref={el => {
                setDropRef(el);
                if (isDraggable) setDragRef(el);
            }}
            id={isDraggable ? draggableId : dropId}
            className="board-cell"
            {...(isDraggable ? {...attributes, ...listeners} : {})}
            style={{
                ...style(isOver, isDraggable),
                // transition,
            }}
        >
            {unit && <div style={{
                position: 'relative',
                transform: CSS.Translate.toString(transform),
            }}>
                <img src={src} style={{
                    width: "100%",
                    height: '100%'
                }}/>
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
            </div>}
        </div>
    );
};

const BoardGrid: React.FC = () => {
    const room = useRoom();
    const boardMap = useSelector((s: RootState) => s.player.board);
    const units = Object.values(boardMap);

    // TODO: Вынести из компонента
    // ② Ловим окончание любого DnD и, если drop на ячейку поля, шлём на сервер
    useDndMonitor({
        onDragEnd({active, over}) {
            if (!over) return;

            const [fromType, rowA, colA, ...unitChunks] = String(active.id).split('-');
            const [toType, rowB, colB] = String(over.id).split('-');

            // если закинули ски из bench на поле
            if (fromType === 'bench' && toType === 'cell') {
                const figureId = String(active.id).replace('bench-', '');

                room.send('placeFigure', {
                    figureId,
                    position: {
                        x: Number(rowB),
                        y: Number(colB),
                    }
                });
            }

            // если перекладываем с клетки на клетку
            const moveInSameCell = rowA !== rowB || colA !== colB

            if (fromType === 'cell' && toType === 'cell' && active.id !== over.id && moveInSameCell) {
                const figureId = unitChunks.join('-');

                room.send('moveUnit', {
                    figureId,
                    position: {
                        x: Number(rowB),
                        y: Number(colB),
                    }
                });
            }

            // если возвращаем на bench (over.id === 'bench-drop')
            if (fromType === 'cell' && over.id === 'bench-drop') {
                const figureId = unitChunks.join('-');

                room.send('move_unit_to_bench', {
                    figureId,
                });
            }

            if (fromType === 'cell' && over.id === 'sell-slot') {
                const figureId = unitChunks.join('-');
                room.send('sellFigure', {figureId});
            }

            if (fromType === 'item' && toType === 'cell') {
                const selectedUnit = units.find(u => u.positionX === Number(rowB) && u.positionY === Number(colB));

                if (selectedUnit) {
                    const itemId = [rowA, colA, ...unitChunks].join('-');
                    room.send('equip_item', {figureId: selectedUnit.id, itemId});
                }
            }

            if (fromType === 'bench' && over.id === 'sell-slot') {
                const figureId = String(active.id).replace('bench-', '');
                room.send('sellFigure', {figureId});
            }

        },
    });

    return (
        <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
            <div className="board-grid">
                {Array.from({length: 4}).flatMap((_, col) =>
                    Array.from({length: 4}).map((_, row) => {
                        const unit = units.find(u => u.positionX === row && u.positionY === col);
                        return <Cell key={`cell-${row}-${col}`} row={row} col={col} unit={unit}/>;
                    })
                )}
            </div>

            <div className="board-grid">
                {Array.from({length: 4}).flatMap((_, col) =>
                    Array.from({length: 4}).map((_, row) => {
                        return <EnemyCell key={`enemy-cell-${row}-${col}`}/>;
                    })
                )}
            </div>
        </div>

    );
};

export default BoardGrid;