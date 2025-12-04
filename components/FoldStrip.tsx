import React, { useRef, useMemo } from 'react';
import { useFrame, useThree, ThreeElements } from '@react-three/fiber';
import * as THREE from 'three';

// Fix for TypeScript not recognizing R3F elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

interface ConnectedFoldingWallProps {
  texture: THREE.Texture;
  width: number;
  height: number;
  strips: number;
}

export const ConnectedFoldingWall: React.FC<ConnectedFoldingWallProps> = ({ 
  texture, 
  width, 
  height,
  strips 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, pointer } = useThree();
  
  // Create geometry once. 
  // We use a plane with 'strips' width segments.
  // This gives us strips + 1 columns of vertices.
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, strips, 1);
    // Center UVs are handled automatically by PlaneGeometry
    return geo;
  }, [width, height, strips]);

  // Store random offsets for each fold to create "inconsistent" movement
  const noiseOffsets = useMemo(() => {
    return new Float32Array(Array.from({ length: strips }, () => Math.random()));
  }, [strips]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const geo = meshRef.current.geometry;
    const positionAttribute = geo.attributes.position;
    
    // Time for animation
    const time = state.clock.getElapsedTime();
    
    // Interaction physics
    // Normalize mouse X (-1 to 1)
    const mouseX = pointer.x; // -1 to 1
    
    // Calculate global compression based on mouse
    // When mouse is at edges, compression is higher
    const globalCompression = Math.abs(mouseX) * 0.8; 
    
    // Original segment width (unfolded)
    const segWidth = width / strips;
    
    // Start drawing from the left, but we need to center the whole wall later
    // We'll construct a "skeleton" of the fold points (the top row of vertices)
    // The bottom row will just share x/z but have different y.
    
    let currentX = 0;
    const xPositions: number[] = [0];
    const zPositions: number[] = [0];
    
    for (let i = 0; i < strips; i++) {
      // Determine angle for this strip
      // Alternate direction for accordion effect: even (+), odd (-)
      const dir = i % 2 === 0 ? 1 : -1;
      
      // Dynamic folding logic:
      // 1. Base fold from mouse compression
      // 2. Wave effect over time
      // 3. Noise offset for "inconsistent" look
      const noise = noiseOffsets[i];
      const wave = Math.sin(time * 1.5 + i * 0.3) * 0.15;
      
      // Proximity effect: Folds near the mouse pointer are sharper
      // Map strip index to screen space roughly
      const stripScreenX = (i / strips - 0.5) * 2;
      const dist = Math.abs(stripScreenX - mouseX);
      const proximity = Math.max(0, 1 - dist); // 0 to 1
      
      // Calculate fold angle for this specific strip
      // Mix global compression + local activity
      const baseAngle = (globalCompression * 1.2 + wave * 0.2) * (1 + proximity * 0.5);
      
      // Clamp angle to prevent self-intersection craziness (< 85 degrees)
      const angle = dir * Math.min(Math.PI / 2.1, baseAngle + (noise * 0.1));
      
      // Calculate projected width of this strip on X axis
      const dx = segWidth * Math.cos(angle);
      
      // Calculate depth change on Z axis
      const dz = segWidth * Math.sin(angle);
      
      currentX += dx;
      
      // Store the NEXT vertex position
      // Pos[i+1] = Pos[i] + delta
      xPositions.push(currentX);
      
      // Accumulate Z? 
      // For a standard accordion, Z goes back and forth relative to a center line,
      // it doesn't accumulate indefinitely like a spiral.
      // The Z position of vertex i+1 is relative to vertex i.
      // Actually, for a pure zig-zag:
      // Vertex 0: Z=0
      // Vertex 1: Z = dZ
      // Vertex 2: Z = 0 (if angles are equal)
      // Since angles vary, we must accumulate.
      zPositions.push(zPositions[zPositions.length - 1] + dz);
    }
    
    // Calculate offset to center the wall horizontally
    const totalCurrentWidth = xPositions[xPositions.length - 1];
    const offsetX = -totalCurrentWidth / 2;
    
    // Update vertices
    // PlaneGeometry has (strips + 1) * 2 vertices.
    // First 'strips + 1' are the top row.
    // Next 'strips + 1' are the bottom row.
    
    for (let i = 0; i <= strips; i++) {
      const x = xPositions[i] + offsetX;
      const z = zPositions[i];
      
      // Update top row vertex (index i)
      positionAttribute.setXYZ(i, x, height / 2, z);
      
      // Update bottom row vertex (index i + strips + 1)
      positionAttribute.setXYZ(i + strips + 1, x, -height / 2, z);
    }
    
    positionAttribute.needsUpdate = true;
    
    // Important: We assume normals don't need expensive re-calc per frame 
    // because we use flatShading. Flat shading uses face normals, which are 
    // derived from vertex positions in the shader (mostly).
    // However, to get correct shadows, we might need to tell Three that bounds changed.
    meshRef.current.geometry.computeBoundingSphere();
    
    // Add subtle tilt to the whole wall based on mouse Y
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, pointer.y * 0.1, 0.1);
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={geometry} 
      castShadow 
      receiveShadow
    >
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        flatShading={true} // Crucial for the low-poly folded paper look
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  );
};