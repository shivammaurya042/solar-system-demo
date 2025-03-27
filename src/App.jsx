import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Import components
import Planet from './components/Planet';
import OrbitPath from './components/OrbitPath';

// Import data
import { planets } from './data/planetData';

// Main App component
export default function App() {
  const [speedFactor, setSpeedFactor] = useState(1);
  
  // Handle speed change with debounce to prevent excessive re-renders
  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeedFactor(newSpeed);
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 20, 40], fov: 60 }} style={{ background: 'black' }}>
        <ambientLight intensity={0.3} />
        
        {/* Enhanced lighting for sun */}
        <pointLight position={[0, 0, 0]} intensity={2} distance={100} color="#FDB813" />
        <pointLight position={[0, 0, 0]} intensity={1} distance={5} color="#FFFFFF" />
        
        {/* Stars background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
        
        {/* Orbit paths */}
        {planets.filter(planet => planet.orbitRadius).map((planet, index) => (
          <OrbitPath key={`orbit-${index}`} radius={planet.orbitRadius} />
        ))}
        
        {/* Planets */}
        {planets.map((planet, index) => (
          <Planet key={`planet-${planet.name}`} planet={planet} speedFactor={speedFactor} />
        ))}
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      {/* Speed control slider */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Orbital Speed: {speedFactor.toFixed(1)}x</h3>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={speedFactor}
          onChange={handleSpeedChange}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '5px' }}>
          <span>0.1x</span>
          <span>10x</span>
        </div>
      </div>
      
      {/* Info panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '300px',
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Solar System Demo</h3>
        <p style={{ margin: '0 0 5px 0' }}>Use mouse to rotate, zoom and pan</p>
      </div>
    </div>
  );
}