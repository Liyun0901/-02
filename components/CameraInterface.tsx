import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraInterfaceProps {
  onCapture: (imageData: string) => void;
}

export const CameraInterface: React.FC<CameraInterfaceProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "user"
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStreaming(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Unable to access camera. Please allow permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Calculate aspect ratio to center crop to square or portrait if needed
      // For now, we capture the full video frame
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip horizontally for a mirror effect (more natural for selfies)
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white">
      {error ? (
        <div className="text-red-400 p-4 border border-red-500 rounded bg-red-900/20">
          {error}
        </div>
      ) : (
        <>
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-zinc-700">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover transform -scale-x-100" 
              playsInline 
              muted 
            />
            {/* Grid Overlay for aesthetic */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="absolute inset-0 border-2 border-white/10 rounded-lg pointer-events-none flex">
                <div className="flex-1 border-r border-white/10"></div>
                <div className="flex-1 border-r border-white/10"></div>
                <div className="flex-1"></div>
            </div>
            
            {!streaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <p className="animate-pulse text-zinc-400">Initializing Camera...</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 z-10">
            <h1 className="text-3xl font-light tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
              Interactive Folding Wall
            </h1>
            <p className="text-zinc-400 text-sm max-w-md text-center">
              Take a selfie to generate a responsive 3D tapestry. Move your mouse to fold reality.
            </p>
            
            <button
              onClick={handleCapture}
              disabled={!streaming}
              className="group relative px-8 py-4 bg-white text-black font-bold tracking-widest uppercase text-sm rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Capture Reality</span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </>
      )}
    </div>
  );
};
