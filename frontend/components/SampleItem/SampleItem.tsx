import cx from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';

import { Sample } from '../../api';
import { player, TogglePlayOptions } from '../../helpers/Player';
import VisualizeAnalyserNode from './VisualizeAnalyserNode';

export interface SampleItemProps {
    sample: Sample;
}

function usePlayer(sample: Sample): {
    togglePlay(options: TogglePlayOptions): void;
    isPlaying: boolean;
    progresses: number[];
    analyserNode: AnalyserNode | null;
} {
    const [isPlaying, setPlaying] = useState<boolean>(() =>
        player.isPlaying(sample.key),
    );
    const [progresses, setProgresses] = useState<number[]>(() =>
        player.getProgresses(sample.key),
    );
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(() =>
        player.getAnalyserNode(sample.key),
    );

    useEffect(() => {
        function handlePlay() {
            setPlaying(true);
            setAnalyserNode(player.getAnalyserNode(key));
        }

        function handleEnded() {
            setPlaying(false);
            setAnalyserNode(null);
        }

        function handleProgress() {
            setProgresses(player.getProgresses(key));
        }

        const { key } = sample;
        player.on('play', key, handlePlay);
        player.on('ended', key, handleEnded);
        player.on('progress', key, handleProgress);

        return () => {
            player.off('play', key, handlePlay);
            player.off('ended', key, handleEnded);
            player.off('progress', key, handleProgress);
        };
    }, [sample]);

    const togglePlay = useCallback(
        (options) => {
            player.togglePlay(sample, options);
        },
        [sample],
    );

    return { togglePlay, isPlaying, progresses, analyserNode };
}

export default function SampleItem({ sample }: SampleItemProps) {
    const { togglePlay, isPlaying, progresses, analyserNode } =
        usePlayer(sample);

    return (
        <button
            className={cx('SampleItem', {
                'SampleItem--isPlaying': isPlaying,
            })}
            onClick={(e) => {
                togglePlay({
                    spam: e.shiftKey,
                    loop: e.ctrlKey,
                });
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <span className="SampleItem__name">{sample.name}</span>
            <span className="SampleItem__detail">
                {sample.categories.join(' / ')}
            </span>
            {isPlaying && (
                <>
                    {progresses.map((progress, index) => (
                        <div
                            key={index}
                            className="SampleItem__progress"
                            style={{ transform: `scaleX(${progress})` }}
                        />
                    ))}

                    <VisualizeAnalyserNode analyserNode={analyserNode} />
                </>
            )}
        </button>
    );
}