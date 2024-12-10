import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { generateSound, predefinedSounds, SoundType } from '../utils/audioGenerator';

export interface Sound {
  id: string;
  name: string;
  type: SoundType;
  isPlaying: boolean;
  loopInterval?: number;
  pattern?: number[];
  bpm?: number;
}

export interface Song {
  id: string;
  name: string;
  sounds: Sound[];
}

export const useSoundboard = () => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSounds, setRecordedSounds] = useState<Sound[]>([]);
  const [songName, setSongName] = useState('');
  const [globalBPM, setGlobalBPM] = useState(120);
  const [volume, setVolume] = useState(50);
  const navigate = useNavigate();
  const location = useLocation();

  const clearBoard = useCallback(() => {
    console.log('Clearing board...');
    sounds.forEach(sound => {
      if (sound.loopInterval) {
        clearInterval(sound.loopInterval);
      }
    });
    setSounds([]);
    setRecordedSounds([]);
    setSongName('');
    setIsRecording(false);
    navigate('/');
    toast.success('Board cleared');
  }, [navigate, sounds]);

  const addSound = useCallback((soundType: SoundType) => {
    const newSound: Sound = {
      id: crypto.randomUUID(),
      name: soundType,
      type: soundType,
      isPlaying: false,
      pattern: [1, 0, 0, 0], // Default 4/4 pattern
      bpm: globalBPM
    };
    setSounds(prev => [...prev, newSound]);
  }, [globalBPM]);

  const removeSound = useCallback((soundId: string) => {
    setSounds(prev => {
      const soundToRemove = prev.find(s => s.id === soundId);
      if (soundToRemove?.loopInterval) {
        clearInterval(soundToRemove.loopInterval);
      }
      return prev.filter(s => s.id !== soundId);
    });
  }, []);

  const updatePattern = useCallback((soundId: string, pattern: number[]) => {
    setSounds(prev => prev.map(sound => 
      sound.id === soundId ? { ...sound, pattern } : sound
    ));
  }, []);

  const toggleSound = useCallback((soundId: string) => {
    setSounds(prev => {
      return prev.map(sound => {
        if (sound.id === soundId) {
          if (sound.isPlaying && sound.loopInterval) {
            clearInterval(sound.loopInterval);
            return { ...sound, isPlaying: false, loopInterval: undefined };
          } else {
            const stepDuration = (60 / (sound.bpm || globalBPM)) * 1000 / 4;
            let step = 0;
            
            const interval = window.setInterval(() => {
              if (sound.pattern && sound.pattern[step % sound.pattern.length]) {
                generateSound({
                  ...predefinedSounds[sound.type],
                  gain: (volume / 100) * (predefinedSounds[sound.type].gain || 0.5)
                });
              }
              step++;
            }, stepDuration) as unknown as number;
            
            return { ...sound, isPlaying: true, loopInterval: interval };
          }
        }
        return sound;
      });
    });
  }, [globalBPM, volume]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordedSounds([]);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const recordSound = useCallback((sound: Sound) => {
    if (isRecording) {
      setRecordedSounds(prev => [...prev, sound]);
    }
  }, [isRecording]);

  const saveSong = useCallback(async () => {
    if (!songName) {
      toast.error('Please enter a song name');
      return;
    }

    const song: Song = {
      id: crypto.randomUUID(),
      name: songName,
      sounds: recordedSounds,
    };

    try {
      console.log('Saving song:', song);
      navigate(`/?song=${song.id}`);
      toast.success('Song saved successfully!');
      return song;
    } catch (error) {
      console.error('Error saving song:', error);
      toast.error('Failed to save song');
      return null;
    }
  }, [songName, recordedSounds, navigate]);

  const loadSong = useCallback(async (songId: string) => {
    try {
      console.log('Loading song:', songId);
      const mockSong: Song = {
        id: songId,
        name: 'Loaded Song',
        sounds: [],
      };
      
      setSongName(mockSong.name);
      setRecordedSounds(mockSong.sounds);
      toast.success('Song loaded successfully!');
    } catch (error) {
      console.error('Error loading song:', error);
      toast.error('Failed to load song');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const songId = params.get('song');
    if (songId) {
      loadSong(songId);
    }
  }, [location.search, loadSong]);

  return {
    sounds,
    addSound,
    removeSound,
    toggleSound,
    updatePattern,
    isRecording,
    startRecording,
    stopRecording,
    recordSound,
    recordedSounds,
    songName,
    setSongName,
    saveSong,
    loadSong,
    clearBoard,
    globalBPM,
    setGlobalBPM,
    volume,
    setVolume,
  };
};
