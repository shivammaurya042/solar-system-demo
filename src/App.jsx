import React, { useState, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Import components
import Planet from './components/Planet';
import OrbitPath from './components/OrbitPath';
import Wormhole from './components/Wormhole';
import SciFiEventNotification from './components/SciFiEventNotification';
import SciFiEventEffects from './components/SciFiEventEffects';
import SciFiBackground from './components/SciFiBackground';

// Import data
import { planets } from './data/planetData';
import { sciFiPlanets } from './data/sciFiPlanetData';

// Main App component
export default function App() {
  const [speedFactor, setSpeedFactor] = useState(3);
  const [isSciFiMode, setIsSciFiMode] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([0, 20, 40]);
  const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);
  const [cameraAnimation, setCameraAnimation] = useState(null);
  const [randomSeed, setRandomSeed] = useState(Math.random());
  
  // Use either standard or sci-fi planet data based on the mode
  const activePlanets = useMemo(() => {
    return isSciFiMode ? sciFiPlanets : planets;
  }, [isSciFiMode]);
  
  // Handle speed change with debounce to prevent excessive re-renders
  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeedFactor(newSpeed);
  };
  
  // Toggle sci-fi mode
  const toggleSciFiMode = () => {
    setIsSciFiMode(prev => !prev);
    // Reset camera when toggling modes
    setCameraPosition([0, 20, 40]);
    setCameraTarget([0, 0, 0]);
    // Generate new random seed for wormhole positions
    setRandomSeed(Math.random());
  };
  
  // Generate random positions for wormholes in the outer solar system
  const wormholePositions = useMemo(() => {
    if (!isSciFiMode) return [];
    
    // Use the random seed to ensure consistent positions until mode is toggled
    const positions = [];
    
    // Create 3-5 wormholes
    const count = 3 + Math.floor(THREE.MathUtils.seededRandom(randomSeed) * 3);
    
    for (let i = 0; i < count; i++) {
      // Place wormholes in the outer solar system (beyond Jupiter)
      const distance = 20 + THREE.MathUtils.seededRandom(randomSeed + i) * 20; // Between orbit of Jupiter and Neptune
      const angle = THREE.MathUtils.seededRandom(randomSeed + i + 100) * Math.PI * 2;
      
      positions.push({
        x: Math.cos(angle) * distance,
        y: (THREE.MathUtils.seededRandom(randomSeed + i + 200) - 0.5) * 5, // Some vertical variation
        z: Math.sin(angle) * distance,
        size: 1 + THREE.MathUtils.seededRandom(randomSeed + i + 300) * 1 // Size between 1-2
      });
    }
    
    return positions;
  }, [isSciFiMode, randomSeed]);
  
  // Handle wormhole jump
  const handleWormholeJump = useCallback((position) => {
    // Animate camera to new position
    const startPos = [...cameraPosition];
    const startTarget = [...cameraTarget];
    
    // Calculate a position looking at the wormhole from a distance
    const direction = new THREE.Vector3(
      position.x, 
      position.y, 
      position.z
    ).normalize();
    
    // Target the wormhole
    const newTarget = [position.x, position.y, position.z];
    
    // Position the camera 15 units away from the wormhole
    const newPosition = [
      position.x - direction.x * 15,
      position.y - direction.y * 15 + 5, // Slightly above for better angle
      position.z - direction.z * 15
    ];
    
    // Clear any existing animation
    if (cameraAnimation) {
      clearInterval(cameraAnimation);
    }
    
    // Create animation
    let progress = 0;
    const animationDuration = 60; // frames
    
    const animation = setInterval(() => {
      progress += 1 / animationDuration;
      
      if (progress >= 1) {
        clearInterval(animation);
        setCameraAnimation(null);
        // Trigger a random event after the jump
        return;
      }
      
      // Ease in and out
      const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
      
      // Interpolate position and target
      setCameraPosition([
        startPos[0] + (newPosition[0] - startPos[0]) * easedProgress,
        startPos[1] + (newPosition[1] - startPos[1]) * easedProgress,
        startPos[2] + (newPosition[2] - startPos[2]) * easedProgress
      ]);
      
      setCameraTarget([
        startTarget[0] + (newTarget[0] - startTarget[0]) * easedProgress,
        startTarget[1] + (newTarget[1] - startTarget[1]) * easedProgress,
        startTarget[2] + (newTarget[2] - startTarget[2]) * easedProgress
      ]);
    }, 16); // ~60fps
    
    setCameraAnimation(animation);
  }, [cameraPosition, cameraTarget, cameraAnimation]);
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Wrap the entire app in the SciFiEventContext provider */}
      <SciFiEventNotification isSciFiMode={isSciFiMode}>
        <Canvas camera={{ position: cameraPosition, fov: 60 }} style={{ background: 'black' }}>
          <ambientLight intensity={0.3} />
          
          {/* Enhanced lighting for sun */}
          <pointLight position={[0, 0, 0]} intensity={2} distance={100} color={isSciFiMode ? "#00FFFF" : "#FDB813"} />
          <pointLight position={[0, 0, 0]} intensity={1} distance={5} color="#FFFFFF" />
          
          {/* Sci-fi background (nebulae and galaxies) */}
          <SciFiBackground isActive={isSciFiMode} />
          
          {/* Regular stars background (dimmed in sci-fi mode) */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={isSciFiMode ? 0 : 0.5} fade={true} />
          
          {/* Orbit paths */}
          {activePlanets.filter(planet => planet.orbitRadius).map((planet, index) => (
            <OrbitPath 
              key={`orbit-${index}`} 
              radius={planet.orbitRadius} 
              color={isSciFiMode ? new THREE.Color(planet.color).getHex() : undefined}
              opacity={isSciFiMode ? 0.3 : 0.1}
            />
          ))}
          
          {/* Planets */}
          {activePlanets.map((planet, index) => (
            <Planet 
              key={`planet-${planet.name}`} 
              planet={planet} 
              speedFactor={speedFactor}
              isSciFiMode={isSciFiMode}
            />
          ))}
          
          {/* Wormholes (only in sci-fi mode) */}
          {isSciFiMode && wormholePositions.map((pos, index) => (
            <Wormhole 
              key={`wormhole-${index}`}
              position={[pos.x, pos.y, pos.z]}
              size={pos.size}
              onJump={() => handleWormholeJump(pos)}
            />
          ))}
          
          {/* SciFi Event Effects (when events are active) */}
          {isSciFiMode && <SciFiEventEffects />}
          
          {/* Camera controller */}
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            target={new THREE.Vector3(...cameraTarget)}
          />
        </Canvas>
      </SciFiEventNotification>
      
      {/* Sci-fi mode toggle button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: isSciFiMode ? 'rgba(0, 40, 80, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        color: isSciFiMode ? '#00FFFF' : 'white',
        fontFamily: isSciFiMode ? 'monospace' : 'Arial, sans-serif',
        cursor: 'pointer',
        border: isSciFiMode ? '1px solid #00FFFF' : 'none',
        boxShadow: isSciFiMode ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none',
        transition: 'all 0.3s ease'
      }} onClick={toggleSciFiMode}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isSciFiMode && (
            <div style={{ 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              backgroundColor: '#00FFFF', 
              marginRight: '10px',
              boxShadow: '0 0 8px #00FFFF',
              animation: 'pulse 2s infinite'
            }} />
          )}
          <h3 style={{ margin: 0 }}>
            {isSciFiMode ? "Disable Sci-Fi Mode" : "Enable Sci-Fi Mode"}
          </h3>
        </div>
        {isSciFiMode && (
          <style>{`
            @keyframes pulse {
              0% { opacity: 0.6; }
              50% { opacity: 1; }
              100% { opacity: 0.6; }
            }
          `}</style>
        )}
      </div>
      
      {/* Speed control slider */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        backgroundColor: isSciFiMode ? 'rgba(0, 40, 80, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: isSciFiMode ? '#00FFFF' : 'white',
        fontFamily: isSciFiMode ? 'monospace' : 'Arial, sans-serif',
        border: isSciFiMode ? '1px solid #00FFFF' : 'none',
        boxShadow: isSciFiMode ? '0 0 15px rgba(0, 255, 255, 0.3)' : 'none',
      }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Speed: {speedFactor.toFixed(1)}x</h3>
        <input
          type="range"
          min="0.5"
          max="50"
          step="0.1"
          value={speedFactor}
          onChange={handleSpeedChange}
          style={{ 
            width: '90%', 
            cursor: 'pointer',
            accentColor: isSciFiMode ? '#00FFFF' : undefined
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', marginTop: '2px', fontSize: '12px' }}>
          <span>0.5x</span>
          <span>50x</span>
        </div>
      </div>
      
      {/* Info panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: isSciFiMode ? 'rgba(0, 40, 80, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        color: isSciFiMode ? '#00FFFF' : 'white',
        fontFamily: isSciFiMode ? 'monospace' : 'Arial, sans-serif',
        maxWidth: '300px',
        border: isSciFiMode ? '1px solid #00FFFF' : 'none',
        boxShadow: isSciFiMode ? '0 0 15px rgba(0, 255, 255, 0.3)' : 'none',
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{isSciFiMode ? "Galactic Explorer" : "Solar System Demo"}</h3>
        <p style={{ margin: '0 0 5px 0' }}>Use mouse to rotate, zoom and pan</p>
        {isSciFiMode && (
          <p style={{ margin: '5px 0', color: '#FF00FF' }}>Click wormholes to jump to new locations!</p>
        )}
      </div>
    </div>
  );
}