import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const SellSlot: React.FC = () => {
    const { setNodeRef, isOver } = useDroppable({ id: 'sell-slot' });

    const style: React.CSSProperties = {
        fontSize: '10px',
        width: 75,
        position: 'absolute',
        height: 75,
        top: -6,
        right: 6,
        // border: isOver ? '2px solid red' : '2px dashed #ccc',
        // borderRadius: "100%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // background: '#ffecec',
        color: isOver ? 'red' : '#555',
        fontWeight: 'bold',
        cursor: 'pointer',

    };

    return (
        <div ref={setNodeRef} id="sell-slot" style={style}>
            <img src='/assets/SellButton.png' alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
        </div>
    );
};

export default SellSlot;