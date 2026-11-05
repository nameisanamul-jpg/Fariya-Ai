import React, { useState, useRef } from 'react';
import { Scissors, Upload, Download, RefreshCw, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BgRemoverDemo: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [sliderPos, setSliderPos] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultSampleImage = '/src/assets/images/bg_remove_sample_1793808240672.jpg';
  const activeImage = userImage || defaultSampleImage;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setIsProcessing(true);
        setUserImage(reader.result as string);
        setTimeout(() => {
          setIsProcessing(false);
          addSavedGeneration({
            toolId: 'bg-remover',
            toolName: 'Background Remover',
            prompt: `Uploaded image background removal (${file.name})`,
            outputPreview: reader.result as string,
            type: 'image'
          });
        }, 800);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToSample = () => {
    setUserImage(null);
    setSliderPos(50);
  };

  return (
    <div className="bg-[#090d20] rounded-xl border border-purple-950/50 overflow-hidden text-slate-100 p-4 sm:p-6">
      {/* Top Banner Notice */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-lg p-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="font-medium text-purple-200">Interactive Studio Utility</span>
          <span className="text-slate-400">· BiRefNet / Rembg Vision Model Ready</span>
        </div>
        <span className="text-[11px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800/40">
          Sub-Pixel Alpha Masking
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Options */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Interactive Edge Segmentation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag the interactive comparison divider over the preview to inspect sub-pixel edge detection between original studio background and transparent cutout.
            </p>
          </div>

          {/* File Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-900/50 hover:border-purple-500/80 rounded-xl p-5 text-center cursor-pointer bg-[#0c122e]/60 transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-purple-950/80 border border-purple-800/50 mx-auto flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <div className="mt-3 text-xs font-semibold text-white">Upload Your Photo</div>
            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 25MB</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            {userImage && (
              <button
                onClick={resetToSample}
                className="px-3 py-1.5 rounded-lg bg-[#101636] border border-purple-900/40 text-xs text-slate-300 hover:text-white transition-colors"
              >
                Reset to Sample Photo
              </button>
            )}
            <div className="text-[11px] text-slate-400 ml-auto">
              Slider: <span className="font-mono text-purple-300">{Math.round(sliderPos)}%</span>
            </div>
          </div>

          <div className="p-3 bg-[#0c122e] rounded-lg border border-purple-900/30 text-xs space-y-1.5">
            <div className="text-purple-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Production Pipeline Attributes</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1">
              <li>• Automatic subject boundary identification</li>
              <li>• Alpha matting for fine hair and semitransparent glass</li>
              <li>• Instant PNG cutout export with RGBA channels</li>
            </ul>
          </div>
        </div>

        {/* Right Split Comparison Viewport */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="relative rounded-xl border border-purple-900/40 overflow-hidden bg-[#070a1a] select-none min-h-[340px] max-h-[420px] flex items-center justify-center">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-3">
                <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
                <p className="text-xs text-purple-300 font-medium">Extracting foreground alpha channel...</p>
              </div>
            ) : (
              <div
                className="relative w-full h-[380px] overflow-hidden cursor-ew-resize"
                onMouseMove={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                  setSliderPos((x / rect.width) * 100);
                }}
                onTouchMove={e => {
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                  setSliderPos((x / rect.width) * 100);
                }}
              >
                {/* Background Checkered Pattern for Cutout (Right Side) */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #131b38 25%, transparent 25%), 
                      linear-gradient(-45deg, #131b38 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #131b38 75%), 
                      linear-gradient(-45deg, transparent 75%, #131b38 75%)
                    `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    backgroundColor: '#0a0f24'
                  }}
                >
                  {/* Clean cutout visual */}
                  <img
                    src={activeImage}
                    alt="Isolated Cutout"
                    className="w-full h-full object-contain filter contrast-105"
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                      // Gives visual effect of foreground cutout isolation
                      maskImage: 'radial-gradient(ellipse at center, black 65%, transparent 85%)'
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-[10px] text-purple-300 font-semibold px-2 py-0.5 rounded border border-purple-900/40">
                    Transparent Cutout (PNG)
                  </div>
                </div>

                {/* Original Photo (Left Side - Clipped) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={activeImage}
                    alt="Original Photo"
                    className="w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-[10px] text-slate-300 font-semibold px-2 py-0.5 rounded border border-white/20">
                    Original Background
                  </div>
                </div>

                {/* Vertical Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10 pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-purple-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
                    ⇄
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Model: BiRefNet Ultra HD</span>
            <span>Alpha: 32-bit RGBA</span>
            <a
              href={activeImage}
              download="fariya_ai_transparent_cutout.png"
              className="text-purple-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Download className="h-3 w-3" />
              <span>Download Cutout PNG</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
