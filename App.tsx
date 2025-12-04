import React, { useState } from 'react';
import { CameraInterface } from './components/CameraInterface';
import { Scene3D } from './components/Scene3D';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setAppState(AppState.PROCESSING);
    
    // Simulate a brief processing moment for UX impact
    setTimeout(() => {
      setAppState(AppState.INTERACTIVE);
    }, 800);
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAppState(AppState.IDLE);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black font-sans selection:bg-indigo-500 selection:text-white">
      {appState === AppState.IDLE && (
        <CameraInterface onCapture={handleCapture} />
      )}

      {appState === AppState.PROCESSING && (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
           {/* Background Image blur */}
           {capturedImage && (
             <div 
                className="absolute inset-0 opacity-30 blur-3xl scale-110"
                style={{ backgroundImage: `url(${capturedImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
             />
           )}
           <div className="z-10 flex flex-col items-center gap-4">
             <div className="w-16 h-16 border-4 border-t-indigo-500 border-r-purple-500 border-b-zinc-800 border-l-zinc-800 rounded-full animate-spin"></div>
             <p className="text-zinc-300 text-sm tracking-widest uppercase animate-pulse">Constructing Geometry...</p>
           </div>
        </div>
      )}

      {appState === AppState.INTERACTIVE && capturedImage && (
        <Scene3D imageSrc={capturedImage} onReset={handleReset} />
      )}
    </div>
  );
};

export default App;
