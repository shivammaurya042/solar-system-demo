import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

// Moon component for planets with moons
const Moon = ({ moon, parentSize, speedFactor }) => {
  const ref = useRef();
  const moonRef = useRef();
  
  // Load texture at the top level
  let texture;
  try {
    texture = useTexture(moon.textureMap);
  } catch (error) {
    console.warn(`Failed to load texture for moon: ${moon.name}`, error);
    texture = null;
  }
  
  // Create material with texture
  const material = useMemo(() => {
    if (texture) {
      return <meshStandardMaterial map={texture} />;
    } else {
      return <meshStandardMaterial color="#D0D0D0" />;
    }
  }, [texture]);
  
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
    }
  });
  
  return (
    <group ref={ref}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[moon.size * parentSize, 16, 8]} />
        {material}
      </mesh>
    </group>
  );
};

export default Moon;
