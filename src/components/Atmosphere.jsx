import React from 'react';
import * as THREE from 'three';

// Atmosphere effect for planets
const Atmosphere = ({ size, color, opacity }) => {
  return (
    <mesh>
      <sphereGeometry args={[size, 32, 16]} />
      <meshBasicMaterial 
        color={color} 
        transparent={true} 
        opacity={opacity}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

export default Atmosphere;
