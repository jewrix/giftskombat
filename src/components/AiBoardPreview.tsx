import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const AiBoardPreview: React.FC = () => {
    const aiBoards = useSelector((state: RootState) => state.player.aiBoards);

    return (
        <div className="ai-preview-container">
            {aiBoards.map((board, idx) => (
                <div key={idx} className="ai-board-preview">
                    <h4>AI Opponent {idx + 1}</h4>
                    <div className="board-grid">
                        {Array.from({ length: 4 }).flatMap((_, row) =>
                            Array.from({ length: 4 }).map((_, col) => {
                                const unit = board.find(u => u.position?.row === row && u.position?.col === col);
                                return (
                                    <div key={`${row}-${col}`} className="board-cell">
                                        {unit?.name}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AiBoardPreview;