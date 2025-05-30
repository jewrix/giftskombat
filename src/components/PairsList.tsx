import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store/store';

const PairsList: React.FC = () => {
    const pairs = useSelector((s: RootState) => s.game.pairs) ?? [];
    const pairResults = useSelector((s: RootState) => s.game.pairResults) ?? [];

    return (
        <div className="pairs-list">
            <ul>
                {pairs.map((p, i) => {
                    const pairResult = pairResults.find(pr => pr.playerA === p.a && pr.playerB === p.b);
                    return (
                        <li key={i}>
                            <strong style={{color: pairResult ? pairResult.winner === p.a ? 'green' : 'red' : 'inherit'}}>
                                {p.a}
                            </strong>
                            vs
                            <strong style={{color: pairResult ? pairResult.winner === p.b ? 'green' : 'red' : 'inherit'}}>
                                {p.b}
                            </strong>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default PairsList;
