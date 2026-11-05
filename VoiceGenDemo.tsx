import React, { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Square, Play, RotateCcw, Sparkles, Check, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VoiceGenDemo: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [text, setText] = useState('Welcome to Fariya AI, your unified platform for artificial intelligence. From high-resolution visual generation to voice cloning, everything lives in one frictionless suite.');
  const [selectedVoice, setSelectedVoice] = useState<'aria' | 'marcus' | 'elena' | 'david'>('aria');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const voiceProfiles = [
    { id: 'aria', name: 'Aria', desc: 'Warm, natural & articulate' },
    { id: 'marcus', name: 'Marcus', desc: 'Deep narrative & documentary' },
    { id: 'elena', name: 'Elena', desc: 'Energetic conversational' },
    { id: 'david', name: 'David', desc: 'Clear executive business' },
  ] as const;

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = selectedVoice === 'marcus' ? pitch * 0.75 : selectedVoice === 'elena' ? pitch * 1.25 : pitch;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    addSavedGeneration({
      toolId: 'ai-voice',
      toolName: 'AI Voice Generator',
      prompt: text.slice(0, 60) + '...',
      outputPreview: `Voice: ${selectedVoice.toUpperCase()} · Speed: ${speed}x`,
      type: 'audio'
    });
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#090d20] rounded-xl border border-purple-950/50 overflow-hidden text-slate-100 p-4 sm:p-6">
      {/* Top Banner Notice */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-lg p-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="font-medium text-purple-200">Interactive Speech Sandbox</span>
          <span className="text-slate-400">· Browser Engine Active · ElevenLabs API Ready</span>
        </div>
        <span className="text-[11px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800/40">
          Audio Synthesizer Demo
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Text to Synthesize</span>
              <button
                onClick={() => setText('Fariya AI consolidates generative workflows into one cohesive, beautifully designed workspace.')}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Sample Script
              </button>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-[#101636] border border-purple-900/40 rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Voice Model</label>
            <div className="grid grid-cols-2 gap-2">
              {voiceProfiles.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id as any)}
                  className={`p-2.5 rounded-lg text-left transition-colors border ${
                    selectedVoice === v.id
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{v.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1">
                <span>Speed</span>
                <span className="font-mono text-purple-300">{speed}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={speed}
                onChange={e => setSpeed(Number(e.target.value))}
                className="w-full accent-purple-500 bg-[#101636] rounded-lg h-2 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1">
                <span>Pitch</span>
                <span className="font-mono text-purple-300">{pitch}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={pitch}
                onChange={e => setPitch(Number(e.target.value))}
                className="w-full accent-purple-500 bg-[#101636] rounded-lg h-2 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleSpeak}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[44px]"
          >
            {isSpeaking ? (
              <>
                <Square className="h-4 w-4 fill-white" />
                <span>Stop Audio Playback</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                <span>Speak Out Loud ({voiceProfiles.find(v => v.id === selectedVoice)?.name})</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Visualizer & Waveform Preview */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="rounded-xl border border-purple-900/40 bg-[#070a1a] p-6 flex flex-col items-center justify-center min-h-[260px] text-center space-y-5">
            {/* Waveform Bars animation */}
            <div className="flex items-end gap-1.5 h-20 px-4 py-2">
              {[24, 40, 18, 65, 30, 85, 45, 95, 70, 35, 80, 50, 90, 60, 30, 75, 40, 20].map((h, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-full transition-all duration-150 ${
                    isSpeaking
                      ? 'bg-gradient-to-t from-purple-600 to-indigo-400'
                      : 'bg-purple-950/80 border border-purple-900/30'
                  }`}
                  style={{
                    height: isSpeaking ? `${Math.max(15, (h * (i % 2 === 0 ? 1 : 0.8)))}%` : '18%'
                  }}
                />
              ))}
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">
                {isSpeaking ? `Playing Live Voice: ${selectedVoice.toUpperCase()}` : 'Ready to Synthesize'}
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                {isSpeaking
                  ? 'Your browser is currently speaking the text above using the configured parameters.'
                  : 'Tap "Speak Out Loud" to test real speech output directly through your device speakers.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyText}
                className="px-3 py-1.5 rounded-lg bg-[#101636] border border-purple-900/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Synthesis: Web Speech API (Client-side)</span>
            <span>Bitrate: 320 kbps ready</span>
            <span>Cloning: ElevenLabs Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
