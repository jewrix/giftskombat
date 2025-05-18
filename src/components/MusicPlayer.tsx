import React, { useState, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import MusicNote from '@mui/icons-material/MusicNote';
import Box from '@mui/material/Box';

const tracks = [
    '/music/track1.mp3',
    '/music/track2.mp3',
    '/music/track3.mp3'
];

const MusicPlayer: React.FC = () => {
    const audioRef = useRef(new Audio(tracks[0]));
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [volume, setVolume] = useState(1);

    // Управление громкостью
    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // Обработка окончания трека
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => setCurrentTrack(prev => (prev + 1) % tracks.length);

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    // Смена трека и управление воспроизведением
    useEffect(() => {
        const audio = audioRef.current;
        const wasPlaying = isPlaying;

        audio.src = tracks[currentTrack];
        audio.load();

        if (wasPlaying) {
            audio.play().catch(() => setIsPlaying(false));
        }

        return () => audio.pause();
    }, [currentTrack]);

    // Переключение воспроизведения/паузы
    const togglePlayback = () => {
        const audio = audioRef.current;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(() => setIsPlaying(false));
        }
        setIsPlaying(!isPlaying);
    };

    // Смена трека через меню
    const handleTrackChange = (index: number) => {
        setCurrentTrack(index);
        setAnchorEl(null);
    };

    return (
        <Box
            className="music-player"
            sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '28px',
                padding: '8px 16px',
                boxShadow: 3,
                zIndex: 1000,
                backdropFilter: 'blur(4px)',
                width: 'auto',
                maxWidth: 300
            }}
        >
            <IconButton onClick={togglePlayback} size="small">
                {volume === 0 || !isPlaying ? <VolumeOff /> : <VolumeUp />}
            </IconButton>

            <Slider
                value={volume}
                onChange={(_, value) => setVolume(value as number)}
                min={0}
                max={1}
                step={0.1}
                sx={{
                    width: 90,
                    color: '#0077b5',
                    '& .MuiSlider-thumb': {
                        width: 14,
                        height: 14,
                    }
                }}
            />

            <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="Select track"
                size="small"
            >
                <MusicNote />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                {tracks.map((_, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleTrackChange(index)}
                        selected={index === currentTrack}
                        sx={{ minWidth: 120 }}
                    >
                        Track {index + 1}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default MusicPlayer;