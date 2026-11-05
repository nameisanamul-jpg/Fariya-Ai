import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Square, Sliders, Volume2, Sparkles, Disc } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MusicGenDemo: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [prompt, setPrompt] = useState('Nostalgic late-night lo-fi hip hop beat with warm rhodes keys, vinyl tape saturation, and gentle sub bass');
  const [genre, setGenre] = useState('Lo-Fi Chill');
  const [bpm, setBpm] = useState(84);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<any>(null);

  const genres = ['Lo-Fi Chill', 'Cyber Synthwave', 'Cinematic Strings', 'Ambient Drift'];

  // Safe Web Audio API synthesizer for demonstration
  const startAudioDemo = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      setIsPlaying(true);
      const frequencies = genre === 'Cyber Synthwave' 
        ? [220, 277.18, 329.63, 440, 554.37]
        : genre === 'Cinematic Strings'
        ? [174.61, 220, 261.63, 329.63, 392]
        : [261.63, 293.66, 329.63, 392, 440]; // Lo-Fi Pentatonic

      let step = 0;
      const intervalMs = (60 / bpm / 2) * 1000;

      timerRef.current = setInterval(() => {
        if (!audioCtxRef.current) return;
        step = (step + 1) % 8;
        setActiveStep(step);

        // Play gentle sine harmonic note
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        const freq = frequencies[step % frequencies.length];
        osc.type = genre === 'Cyber Synthwave' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);

        gain.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.36);
      }, intervalMs);

      addSavedGeneration({
        toolId: 'ai-music',
        toolName: 'AI Music Generator',
        prompt,
        outputPreview: `Track: ${genre} @ ${bpm} BPM`,
        type: 'audio'
      });
    } catch {
      // AudioContext fallback
      setIsPlaying(true);
    }
  };

  const stopAudioDemo = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-[#090d20] rounded-xl border border-purple-950/50 overflow-hidden text-slate-100 p-4 sm:p-6">
      {/* Top Banner Notice */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-lg p-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="font-medium text-purple-200">Interactive Soundstage Demo</span>
          <span className="text-slate-400">· Web Audio Synthesizer Active · Suno/MusicLM API Ready</span>
        </div>
        <span className="text-[11px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800/40">
          Royalty-Free Audio Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Music Theme & Mood</span>
              <button
                onClick={() => setPrompt('Cinematic cyberpunk chase sequence with pounding analog bass and aggressive distortion')}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Preset
              </button>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-[#101636] border border-purple-900/40 rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Musical Genre</label>
            <div className="grid grid-cols-2 gap-1.5">
              {genres.map(g => (
                <button
                  key={g}
                  onClick={() => {
                    setGenre(g);
                    if (isPlaying) {
                      stopAudioDemo();
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate transition-colors border ${
                    genre === g
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
              <span>Tempo (BPM)</span>
              <span className="font-mono text-purple-300">{bpm} BPM</span>
            </div>
            <input
              type="range"
              min="70"
              max="140"
              value={bpm}
              onChange={e => {
                setBpm(Number(e.target.value));
                if (isPlaying) {
                  stopAudioDemo();
                }
              }}
              className="w-full accent-purple-500 bg-[#101636] rounded-lg h-2 cursor-pointer"
            />
          </div>

          <button
            onClick={isPlaying ? stopAudioDemo : startAudioDemo}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[44px]"
          >
            {isPlaying ? (
              <>
                <Square className="h-4 w-4 fill-white" />
                <span>Stop Audio Synthesizer</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Synthesize Audio Loop ({genre} @ {bpm} BPM)</span>
              </>
            )}
          </button>
        </div>

        {/* Visualizer and Beat Grid Column */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="rounded-xl border border-purple-900/40 bg-[#070a1a] p-6 flex flex-col items-center justify-center min-h-[260px] text-center space-y-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full bg-purple-950/80 border border-purple-800/50 ${isPlaying ? 'animate-spin' : ''}`}>
                <Disc className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">{genre} Sequence</div>
                <div className="text-xs text-purple-300 font-mono">{bpm} BPM · 4/4 Time Signature</div>
              </div>
            </div>

            {/* 8-Step Sequencer Indicator */}
            <div className="grid grid-cols-8 gap-2 w-full max-w-md">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(step => (
                <div
                  key={step}
                  className={`h-12 rounded-lg flex flex-col items-center justify-center transition-all ${
                    isPlaying && activeStep === step
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50 scale-105'
                      : 'bg-[#101738] border border-purple-900/40 text-slate-500'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold">{step + 1}</span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isPlaying && activeStep === step ? 'bg-white' : 'bg-purple-900/40'
                    }`}
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 max-w-sm">
              {isPlaying
                ? 'Synthesizing live audio frequencies through your browser Web Audio API engine.'
                : 'Tap "Synthesize Audio Loop" to hear algorithmic harmonics synthesized in real time.'}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Synthesis: Web Audio API Oscillator Matrix</span>
            <span>Key: C-Minor Pentatonic</span>
            <span>Production API: Suno / MusicLM Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
