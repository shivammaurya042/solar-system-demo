import React from 'react';
import * as THREE from 'three';

// Glow effect for the sun
const SunGlow = ({ size, intensity, color }) => {
  return (
    <>
      {/* Inner glow layer */}
      <mesh>
        <sphereGeometry args={[size * 1.1, 32, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={intensity * 0.8}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Outer glow layer */}
      <mesh>
        <sphereGeometry args={[size * 1.3, 32, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={intensity * 0.4}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
};

export default SunGlow;
