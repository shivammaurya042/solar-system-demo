import React from 'react';
import * as THREE from 'three';

// Orbit path component for visualizing planetary orbits
const OrbitPath = ({ radius }) => {
  const points = [];
  const segments = 128;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = radius * Math.sin(angle);
    const z = radius * Math.cos(angle);
    points.push(new THREE.Vector3(x, 0, z));
  }
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="white" transparent opacity={0.2} />
    </line>
  );
};

export default OrbitPath;
