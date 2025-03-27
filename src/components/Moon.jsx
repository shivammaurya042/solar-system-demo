import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import SciFiEffect from './SciFiEffect';

// Moon component for planets with moons
const Moon = ({ moon, parentSize, speedFactor, isSciFiMode = false }) => {
  const ref = useRef();
  const moonRef = useRef();
  
  // Handle texture loading with error handling
  let texturePath = moon.textureMap;
  let texture = null;
  try {
    texture = useTexture(texturePath);
  } catch (error) {
    console.error(`Failed to load texture for moon: ${texturePath}`, error);
  }
  
  // Create material with texture
  const material = React.useMemo(() => {
    if (texture) {
      return (
        <meshStandardMaterial 
          map={texture}
          emissive={isSciFiMode && moon.emissive ? moon.color : undefined}
          emissiveIntensity={isSciFiMode && moon.emissive ? moon.emissiveIntensity || 0.5 : 0}
        />
      );
    } else {
      return (
        <meshStandardMaterial 
          color={moon.color || "#D0D0D0"} 
          emissive={isSciFiMode && moon.emissive ? moon.color : undefined}
          emissiveIntensity={isSciFiMode && moon.emissive ? moon.emissiveIntensity || 0.5 : 0}
        />
      );
    }
  }, [texture, moon.color, isSciFiMode, moon.emissive, moon.emissiveIntensity]);
  
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
