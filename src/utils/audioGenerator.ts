const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

interface SoundParameters {
  type: OscillatorType;
  frequency: number;
  duration: number;
  gain?: number;
}

export const generateSound = ({
  type = 'sine',
  frequency,
  duration,
  gain = 0.5
}: SoundParameters): Promise<void> => {
  return new Promise((resolve) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
    
    oscillator.onended = () => {
      resolve();
    };
  });
};

export const predefinedSounds = {
  sine880: {
    type: 'sine' as OscillatorType,
    frequency: 880,
    duration: 0.2,
    gain: 0.4
  },
  sine440: {
    type: 'sine' as OscillatorType,
    frequency: 440,
    duration: 0.2,
    gain: 0.4
  },
  square330: {
    type: 'square' as OscillatorType,
    frequency: 330,
    duration: 0.2,
    gain: 0.3
  },
  square220: {
    type: 'square' as OscillatorType,
    frequency: 220,
    duration: 0.2,
    gain: 0.3
  },
  triangle165: {
    type: 'triangle' as OscillatorType,
    frequency: 165,
    duration: 0.2,
    gain: 0.5
  },
  triangle110: {
    type: 'triangle' as OscillatorType,
    frequency: 110,
    duration: 0.2,
    gain: 0.5
  },
  sawtooth55: {
    type: 'sawtooth' as OscillatorType,
    frequency: 55,
    duration: 0.3,
    gain: 0.4
  }
};

export type SoundType = keyof typeof predefinedSounds;