import React, {useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { phaseChanged } from '../store/gameSlice';
// import { damagePlayer } from '../store/gameSlice';

const ResultsPanel: React.FC = () => {
    const dispatch = useDispatch();
    const res = useSelector((s: RootState) => s.game.lastResult)!;

    // После нажатия — новый раунд
    const onNext = () => {
        // if (!res.win) dispatch(damagePlayer(res.opponentRemaining));
        dispatch(phaseChanged('PREP'));
    };

    useEffect(() => {
        const timer = setTimeout(() => dispatch(phaseChanged('PREP')), 2000);
        return () => clearTimeout(timer);
    }, [dispatch]);

    return (
        <div className="results-panel">
            <h2>{res.win ? 'Победа!' : 'Поражение!'}</h2>
            <p>Выживших: {res.playerRemaining}</p>
            <p>У противника: {res.opponentRemaining}</p>
            <button onClick={onNext}>Далее</button>
        </div>
    );
};

export default ResultsPanel;