import React from 'react';
import {useSelector} from 'react-redux';
import {useDraggable, useDroppable} from '@dnd-kit/core';
import {RootState} from '../store/store';
import {UnitType} from "../store/playerSlice.ts";
import {CSS} from '@dnd-kit/utilities';
import {useBoardDnd} from "../hooks/useBoardDnd.ts";

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
    const boardMap = useSelector((s: RootState) => s.player.board);
    const units = Object.values(boardMap);

    useBoardDnd(units);

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