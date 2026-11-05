import React, { useState, useEffect } from 'react';
import { Film, Play, Pause, RotateCcw, Download, Sparkles, SlidersHorizontal, Video } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VideoGenDemo: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [prompt, setPrompt] = useState('Cinematic 16:9 aerial glide over a bioluminescent futuristic coastal metropolis at twilight, illuminated yachts in harbour, anamorphic lens flare');
  const [motionIntensity, setMotionIntensity] = useState(6);
  const [cameraMotion, setCameraMotion] = useState('Pan Right & Zoom In');
  const [duration, setDuration] = useState('4s');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoFramePath = '/src/assets/images/demo_video_frame_1793808240214.jpg';

  const cameraMotions = [
    'Pan Right & Zoom In',
    'Orbit 360 Orbit',
    'Drone Crane Up',
    'Dolly Zoom Forward'
  ];

  // Simulating motion playback
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && progress >= 100) {
      setProgress(0);
    }
  };

  return (
    <div className="bg-[#090d20] rounded-xl border border-purple-950/50 overflow-hidden text-slate-100 p-4 sm:p-6">
      {/* Top Banner Notice */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-lg p-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="font-medium text-purple-200">Interactive Video Motion Demo</span>
          <span className="text-slate-400">· Google Veo / Runway Gen-3 Integration Ready</span>
        </div>
        <span className="text-[11px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800/40">
          Cinematic Motion Synthesis
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Scene Prompt</span>
              <button
                onClick={() => setPrompt('Slow motion hyper-lapse of bioluminescent waves lapping against black sand beach with shooting stars in midnight sky')}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Preset Scene
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Camera Movement</label>
            <div className="grid grid-cols-2 gap-1.5">
              {cameraMotions.map(cm => (
                <button
                  key={cm}
                  onClick={() => setCameraMotion(cm)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate transition-colors border ${
                    cameraMotion === cm
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {cm}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
              <span>Motion Magnitude</span>
              <span className="font-mono text-purple-300">{motionIntensity} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={motionIntensity}
              onChange={e => setMotionIntensity(Number(e.target.value))}
              className="w-full accent-purple-500 bg-[#101636] rounded-lg h-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Clip Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {['3s', '4s', '6s'].map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-1.5 rounded-lg text-xs font-medium text-center transition-colors border ${
                    duration === d
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {d} HD
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={togglePlayback}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[44px]"
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause Motion Demo</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Play Camera Simulation ({cameraMotion})</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview Viewport */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative rounded-xl border border-purple-900/40 bg-[#070a1a] overflow-hidden aspect-video flex items-center justify-center group">
            {/* Image with dynamic CSS pan-zoom when playing */}
            <img
              src={videoFramePath}
              alt="Video Motion Preview"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-1000 ease-linear ${
                isPlaying
                  ? cameraMotion.includes('Zoom')
                    ? 'scale-115 translate-x-2'
                    : 'scale-110 -translate-x-3 translate-y-1'
                  : 'scale-100'
              }`}
            />

            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

            {/* Center Play Button Overlay */}
            {!isPlaying && (
              <button
                onClick={togglePlayback}
                className="absolute w-14 h-14 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
                aria-label="Play video simulation"
              >
                <Play className="h-6 w-6 fill-white ml-1" />
              </button>
            )}

            {/* Bottom Scrubber */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-2">
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <button onClick={togglePlayback} className="hover:text-white transition-colors">
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  </button>
                  <span className="font-mono">
                    00:0{Math.floor((progress / 100) * parseInt(duration))}.{Math.floor((progress % 25))} / 00:0{duration}
                  </span>
                  <span>·</span>
                  <span className="text-purple-300">{cameraMotion}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-purple-950/80 border border-purple-800/50 px-1.5 py-0.5 rounded text-[10px]">
                    24 FPS 4K
                  </span>
                  <a
                    href={videoFramePath}
                    download="fariya_ai_cinematic_frame.jpg"
                    className="hover:text-white transition-colors"
                    title="Download Frame"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Synthesis Model: Veo 2 Ready</span>
            <span>Interpolation: Flow Vectors Enabled</span>
            <span>Live API: BYOK Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};
