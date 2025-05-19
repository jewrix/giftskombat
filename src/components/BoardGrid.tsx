import React from 'react';
import {useSelector} from 'react-redux';
import {useDndMonitor, useDraggable, useDroppable} from '@dnd-kit/core';
import {RootState} from '../store/store';
import {UnitType} from "../store/playerSlice.ts";
import {useRoom} from "../context/RoomContext.tsx";

interface CellProps {
    row: number;
    col: number;
    unit?: UnitType;
}

const style = (isOver?: boolean, isDraggable?: boolean): React.CSSProperties => ({
    border: isOver ? '2px solid #00f' : '2px dashed #ccc',
    width: 45,
    height: 45,
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
    const {attributes, listeners, setNodeRef: setDragRef} = useDraggable({id: draggableId});

    const src = new URL(`../assets/${unit?.unitType}_Idle.gif`, import.meta.url).href;


    return (
        <div
            ref={el => {
                setDropRef(el);
                if (isDraggable) setDragRef(el);
            }}
            id={isDraggable ? draggableId : dropId}
            className="board-cell"
            {...(isDraggable ? {...attributes, ...listeners} : {})}
            style={style(isOver, isDraggable)}
        >
            {unit && <img src={src} width={50} height={50}/>}
        </div>
    );
};

const BoardGrid: React.FC = () => {
    const room = useRoom();
    const boardMap = useSelector((s: RootState) => s.player.board);
    const units = Object.values(boardMap);

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
                    Array.from({length: 4}).map((_,  row) => {
                        return <EnemyCell key={`enemy-cell-${row}-${col}`}/>;
                    })
                )}
            </div>
        </div>

    );
};

export default BoardGrid;