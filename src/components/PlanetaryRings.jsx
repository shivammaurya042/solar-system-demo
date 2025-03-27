import React from 'react';
import * as THREE from 'three';

// Rings component for gas giants
const PlanetaryRings = ({ size, innerRadius, outerRadius, color, opacity }) => {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size * innerRadius, size * outerRadius, 64]} />
      <meshStandardMaterial 
        color={color} 
        transparent={true} 
        opacity={opacity} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default PlanetaryRings;
