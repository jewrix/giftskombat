import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { tickPrepTimer, resetPrepTimer, phaseChanged } from '../store/gameSlice';

const PrepTimer: React.FC = () => {
    const dispatch = useDispatch();
    const prepTime = useSelector((state: RootState) => state.game.prepTime);
    const phase = useSelector((state: RootState) => state.game.phase);

    // Сбрасываем таймер при входе в фазу PREP и запускаем отсчёт
    useEffect(() => {
        if (phase !== 'PREP') return;
        dispatch(resetPrepTimer());
        const id = setInterval(() => {
            dispatch(tickPrepTimer());
        }, 1000);
        return () => clearInterval(id);
    }, [phase, dispatch]);

    // Когда время истекает, переходим в фазу BATTLE
    useEffect(() => {
        if (phase === 'PREP' && prepTime === 0) {
            dispatch(phaseChanged('BATTLE'));
        }
    }, [prepTime, phase, dispatch]);

    return (
        <div className="prep-timer">
            Время подготовки: {prepTime} сек
        </div>
    );
};

export default PrepTimer;