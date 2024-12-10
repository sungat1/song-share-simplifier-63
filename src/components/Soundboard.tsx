import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { useSoundboard } from '../hooks/useSoundboard';
import { Play, Square, Save, Download, Upload } from 'lucide-react';
import { predefinedSounds } from '../utils/audioGenerator';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { toast } from 'sonner';

const Soundboard: React.FC = () => {
  const {
    isPlaying,
    startPlaying,
    stopPlaying,
    updatePattern,
    songName,
    setSongName,
    saveSong,
    clearBoard,
    globalBPM,
    setGlobalBPM,
    volume,
    setVolume,
    patterns,
    setPatterns,
  } = useSoundboard();

  const handleDownload = () => {
    const songData = {
      name: songName,
      patterns,
      bpm: globalBPM,
      volume
    };

    const blob = new Blob([JSON.stringify(songData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songName || 'bitboard'}-pattern.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Downloading pattern:', songData);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const songData = JSON.parse(content);
        
        // Validate the uploaded data
        if (!songData.patterns || !songData.bpm || songData.volume === undefined) {
          throw new Error('Invalid file format');
        }

        setPatterns(songData.patterns);
        setGlobalBPM(songData.bpm);
        setVolume(songData.volume);
        if (songData.name) {
          setSongName(songData.name);
        }

        console.log('Uploaded pattern:', songData);
        toast.success('Pattern loaded successfully!');
      } catch (error) {
        console.error('Error loading pattern:', error);
        toast.error('Failed to load pattern. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-black text-cyan-400 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-500">Bitboard</h1>
        
        {/* Controls Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 glass-effect p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              onClick={isPlaying ? stopPlaying : startPlaying}
              className="bg-cyan-400 hover:bg-cyan-500 text-black min-w-[100px]"
            >
              {isPlaying ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Stop' : 'Play'}
            </Button>
            
            <Button
              variant="outline"
              onClick={clearBoard}
              className="border-cyan-500/30 text-cyan-400"
            >
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-cyan-400">BPM:</span>
            <div className="w-48">
              <Slider
                value={[globalBPM]}
                onValueChange={(value) => setGlobalBPM(value[0])}
                max={200}
                min={40}
                step={1}
                className="[&_[role=slider]]:bg-cyan-400"
              />
            </div>
            <span className="min-w-[3ch]">{globalBPM}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-cyan-400">Volume:</span>
            <div className="w-48">
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                min={0}
                step={1}
                className="[&_[role=slider]]:bg-cyan-400"
              />
            </div>
            <span className="min-w-[3ch]">{volume}%</span>
          </div>

          <div className="flex items-center gap-4">
            <Input
              placeholder="Song title"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              className="bg-transparent border-cyan-500/30 text-cyan-400 w-48"
            />
            <Button 
              onClick={saveSong}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Upload pattern"
              />
              <Button
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* Sound Grid */}
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(predefinedSounds).map(([soundType, config]) => (
            <div key={soundType} className="glass-effect rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-cyan-400 w-24">{soundType}</span>
                <ToggleGroup 
                  type="multiple"
                  className="grid grid-cols-16 gap-1 flex-1"
                  value={patterns[soundType] ? patterns[soundType].map((v, i) => v ? i.toString() : '').filter(Boolean) : []}
                  onValueChange={(value) => {
                    const newPattern = Array(16).fill(0);
                    value.forEach(v => {
                      newPattern[parseInt(v)] = 1;
                    });
                    updatePattern(soundType, newPattern);
                  }}
                >
                  {Array(16).fill(0).map((_, i) => (
                    <ToggleGroupItem
                      key={i}
                      value={i.toString()}
                      aria-label={`Step ${i + 1}`}
                      className="w-full h-10 border border-cyan-500/30 bg-transparent data-[state=on]:bg-cyan-500 data-[state=on]:text-black hover:bg-cyan-500/20"
                    />
                  ))}
                </ToggleGroup>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Soundboard;