import React, { useMemo } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, ContactShadows, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ConnectedFoldingWall } from './FoldStrip';

// Fix for TypeScript not recognizing R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface Scene3DProps {
  imageSrc: string;
  onReset: () => void;
}

export const Scene3D: React.FC<Scene3DProps> = ({ imageSrc, onReset }) => {
  const texture = useMemo(() => {
    const t = new THREE.TextureLoader().load(imageSrc);
    // Ensure texture looks good
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [imageSrc]);

  return (
    <div className="relative w-full h-full bg-zinc-900">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 14]} fov={45} />
        
        <color attach="background" args={['#050505']} />
        
        {/* Soft shadows for realistic depth */}
        <SoftShadows size={15} samples={10} focus={0} />

        {/* Lighting Setup designed to accentuate folds */}
        <ambientLight intensity={0.4} />
        
        {/* Main Key Light - Directional to cast shadows from the folds */}
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        >
          <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
        </directionalLight>

        {/* Rim lights for aesthetics */}
        <spotLight position={[-10, 0, -5]} intensity={5} color="#6366f1" angle={0.5} penumbra={1} />
        <spotLight position={[10, 0, -5]} intensity={5} color="#ec4899" angle={0.5} penumbra={1} />

        <ConnectedFoldingWall 
          texture={texture}
          width={16} // Wider wall
          height={10}
          strips={32} // High strip count for smooth folding
        />
        
        {/* Floor shadow */}
        <ContactShadows 
          resolution={1024} 
          scale={50} 
          blur={3} 
          opacity={0.7} 
          far={10} 
          color="#000000" 
          position={[0, -6, 0]}
        />
        
        <Environment preset="city" blur={0.8} />
        
        <OrbitControls 
          enableZoom={true} 
          minDistance={8} 
          maxDistance={25}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          enablePan={false}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="text-white">
          <h2 className="text-xl font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500">
            Folding Reality
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Move cursor horizontally to fold space
          </p>
        </div>
        
        <button 
          onClick={onReset}
          className="pointer-events-auto px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          New Capture
        </button>
      </div>
    </div>
  );
};