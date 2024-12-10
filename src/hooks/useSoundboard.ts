import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { generateSound, predefinedSounds, SoundType } from '../utils/audioGenerator';

interface Patterns {
  [key: string]: number[];
}

export const useSoundboard = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [patterns, setPatterns] = useState<Patterns>({});
  const [songName, setSongName] = useState('');
  const [globalBPM, setGlobalBPM] = useState(120);
  const [volume, setVolume] = useState(50);
  
  const intervalRef = useRef<number>();
  const stepRef = useRef(0);

  const clearBoard = useCallback(() => {
    console.log('Clearing board...');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setPatterns({});
    setSongName('');
    setIsPlaying(false);
    stepRef.current = 0;
    toast.success('Board cleared');
  }, []);

  const updatePattern = useCallback((soundType: string, pattern: number[]) => {
    console.log('Updating pattern for:', soundType, pattern);
    setPatterns(prev => ({
      ...prev,
      [soundType]: pattern
    }));
  }, []);

  const startPlaying = useCallback(() => {
    console.log('Starting playback...');
    setIsPlaying(true);
    stepRef.current = 0;

    const stepDuration = (60 / globalBPM) * 1000 / 4; // Duration for each step

    intervalRef.current = window.setInterval(() => {
      const currentStep = stepRef.current;
      
      // Play all active sounds for the current step
      Object.entries(patterns).forEach(([soundType, pattern]) => {
        if (pattern[currentStep]) {
          const soundConfig = predefinedSounds[soundType as SoundType];
          generateSound({
            ...soundConfig,
            gain: (volume / 100) * (soundConfig.gain || 0.5)
          });
        }
      });

      stepRef.current = (stepRef.current + 1) % 16;
    }, stepDuration) as unknown as number;
  }, [globalBPM, patterns, volume]);

  const stopPlaying = useCallback(() => {
    console.log('Stopping playback...');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    stepRef.current = 0;
  }, []);

  const saveSong = useCallback(() => {
    if (!songName) {
      toast.error('Please enter a song name');
      return;
    }

    console.log('Saving song:', { name: songName, patterns, bpm: globalBPM });
    toast.success('Song saved successfully!');
  }, [songName, patterns, globalBPM]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    startPlaying,
    stopPlaying,
    patterns,
    setPatterns,
    updatePattern,
    songName,
    setSongName,
    saveSong,
    clearBoard,
    globalBPM,
    setGlobalBPM,
    volume,
    setVolume,
  };
};