import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import SciFiEffect from './SciFiEffect';

// Moon component for planets with moons
const Moon = ({ moon, parentSize, speedFactor, isSciFiMode = false }) => {
  const ref = useRef();
  const moonRef = useRef();
  
  // Handle texture loading with proper configuration
  // Use useTexture at the top level without callbacks to follow React's Rules of Hooks
  const texturePath = moon.textureMap || '';
  const texture = useTexture(texturePath);
  
  // Apply texture settings in a useEffect
  useEffect(() => {
    if (texture) {
      texture.encoding = THREE.sRGBEncoding;
      texture.flipY = false;
    }
  }, [texture]);
  
  // Create material with texture
  const material = React.useMemo(() => {
    return (
      <meshStandardMaterial 
        map={texture}
        emissive={isSciFiMode && moon.emissive ? moon.color : undefined}
        emissiveIntensity={isSciFiMode && moon.emissive ? moon.emissiveIntensity || 0.5 : 0}
      />
    );
  }, [texture, isSciFiMode, moon.emissive, moon.color, moon.emissiveIntensity]);
  
  useFrame(({ clock }) => {
    if (ref.current && moonRef.current) {
      const time = clock.getElapsedTime() * speedFactor;
      
      // Orbit around parent planet
      const angle = time * moon.orbitSpeed;
      const x = Math.sin(angle) * moon.orbitRadius * parentSize;
      const z = Math.cos(angle) * moon.orbitRadius * parentSize;
      ref.current.position.set(x, 0, z);
      
      // Self rotation
      if (moon.rotationSpeed) {
        moonRef.current.rotation.y += moon.rotationSpeed * speedFactor * 0.01;
      }
      
      // If in sci-fi mode, add some wobble to the orbit for alien moons
      if (isSciFiMode && moon.emissive) {
        ref.current.position.y = Math.sin(time * 2) * 0.1 * parentSize;
      }
    }
  });
  
  return (
    <group ref={ref}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[moon.size * parentSize, 16, 8]} />
        {material}
      </mesh>
      
      {/* Add sci-fi effect for glowing moons */}
      {isSciFiMode && moon.emissive && (
        <SciFiEffect 
          size={moon.size * parentSize} 
          pulsating={false} 
          color={moon.color || "#FFFFFF"} 
        />
      )}
    </group>
  );
};

export default Moon;
