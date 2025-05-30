import React from 'react';
import { useSelector } from 'react-redux';
import { Box, useTheme } from '@mui/material';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { RootState } from '../store/store';
import {Item} from "../store/playerSlice.ts";

interface ItemCellProps {
    item: Item;
}

const ItemCell: React.FC<ItemCellProps> = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `item-${item.id}`,
        data: { item },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 }),
        touchAction: 'none',
        cursor: 'grab',
        width: '100%',
        aspectRatio: '1 / 1',
    };

    const src = new URL(`../assets/items/${item.name}_Item.png`, import.meta.url).href;

    return (
        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            sx={{
                mb: 1,
            }}
            style={style}
        >
            <img
                src={src}
                alt={item.name}
                style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'contain',
                }}
            />
        </Box>
    );
};

const ItemSidebar: React.FC = () => {
    const theme = useTheme();
    const items = useSelector((state: RootState) => state.player.inventory);
    const { setNodeRef } = useDroppable({ id: 'sidebar-drop' });

    return (
        <Box
            ref={setNodeRef}
            position="absolute"
            top={"20%"}
            right={0}
            height="40vh"
            width="75px"
            minWidth="80px"
            bgcolor={"#095389cc"}
            p={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            sx={{
                overflow: 'visible',
                boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
                zIndex: 1000,
            }}
        >
            {items.length > 0 ? (
                items.map(item => (
                    <ItemCell key={item.id} item={item} />
                ))
            ) : (
                <Box
                    sx={{
                        mt: 2,
                        color: theme.palette.text.disabled,
                        textAlign: 'center',
                        fontSize: '0.9rem',
                    }}
                >
                    No items
                </Box>
            )}
        </Box>
    );
};

export default ItemSidebar;
