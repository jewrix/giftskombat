import {useDndMonitor} from '@dnd-kit/core';
import {useRoom} from '../context/RoomContext.tsx';
import {UnitType} from '../store/playerSlice.ts';

export function useBoardDnd(units: UnitType[]) {
    const room = useRoom();

    useDndMonitor({
        onDragEnd({active, over}) {
            if (!over) return;

            const [fromType, rowA, colA, ...unitChunks] = String(active.id).split('-');
            const [toType, rowB, colB] = String(over.id).split('-');

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

            const moveInSameCell = rowA !== rowB || colA !== colB;

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
}
