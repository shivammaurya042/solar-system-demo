import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Import components
import Planet from './components/Planet';
import OrbitPath from './components/OrbitPath';
import Wormhole from './components/Wormhole';
import Spacecraft from './components/Spacecraft';
import SciFiEventNotification from './components/SciFiEventNotification';
import SciFiEventEffects from './components/SciFiEventEffects';
import SciFiBackground from './components/SciFiBackground';

// Import data
import { planets } from './data/planetData';
import { sciFiPlanets } from './data/sciFiPlanetData';

// Main App component
export default function App() {
  const [speedFactor, setSpeedFactor] = useState(4);
  const [isSciFiMode, setIsSciFiMode] = useState(false);
  const [cameraPosition, setCameraPosition] = useState([0, 20, 40]);
  const [cameraTarget, setCameraTarget] = useState([0, 0, 0]);
  const [isSpacecraftMode, setIsSpacecraftMode] = useState(false);
  const [spacecraftPosition, setSpacecraftPosition] = useState([0, 0, 0]);
  const [randomSeed, setRandomSeed] = useState(Math.random());
  const audioRef = useRef(null);
  
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
  
  // Initialize audio
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/sounds/space-journey.mp3');
    audioRef.current.volume = 0.7;
    audioRef.current.loop = true;
    
    return () => {
      // Clean up
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);
  
  // Toggle body class for SciFi mode to help with CSS targeting
  useEffect(() => {
    if (isSciFiMode) {
      document.body.classList.add('scifi-active');
    } else {
      document.body.classList.remove('scifi-active');
    }
    
    // Clean up on component unmount
    return () => {
      document.body.classList.remove('scifi-active');
    };
  }, [isSciFiMode]);
  
  // Handle wormhole jump - start spacecraft travel mode
  const handleWormholeJump = useCallback((position) => {
    // Store current camera position before switching to spacecraft mode
    const prevCameraPos = [...cameraPosition];
    
    // Set the initial spacecraft position to be near the wormhole
    const initialPosition = [position.x, position.y, position.z];
    setSpacecraftPosition(initialPosition);
    
    // Create a smooth camera transition before enabling spacecraft mode
    const startPos = [...cameraPosition];
    const startTarget = [...cameraTarget];
    const endPos = [position.x, position.y + 2, position.z - 8]; // Position closer to the spacecraft
    const endTarget = [position.x, position.y, position.z];
    
    // Create and display the message notification
    const messageElement = document.createElement('div');
    messageElement.className = 'wormhole-message';
    messageElement.textContent = 'Lets turn up the vibe! CRANK UP YOUR VOLUME!';
    messageElement.style.position = 'fixed';
    messageElement.style.top = '20%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.padding = '20px';
    messageElement.style.borderRadius = '10px';
    messageElement.style.background = 'rgba(0, 0, 0, 0.8)';
    messageElement.style.color = '#FF00FF';
    messageElement.style.fontFamily = 'monospace, sans-serif';
    messageElement.style.fontSize = '24px';
    messageElement.style.fontWeight = 'bold';
    messageElement.style.zIndex = '9999';
    messageElement.style.textAlign = 'center';
    messageElement.style.boxShadow = '0 0 20px #9932CC';
    messageElement.style.border = '2px solid #9932CC';
    document.body.appendChild(messageElement);
    
    // Remove the message and start playing audio after 3 seconds
    setTimeout(() => {
      // Remove the message
      if (document.body.contains(messageElement)) {
        document.body.removeChild(messageElement);
      }
      
      // Start playing music
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Audio playback failed:", e));
      }
    }, 3000); // 3 seconds
    
    // Animate camera to better position for spacecraft transition
    let startTime = null;
    const animDuration = 800; // milliseconds (0.8 seconds)
    
    // Use requestAnimationFrame for smoother animation
    const animateCamera = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      
      // Cubic easing function - more gentle acceleration and deceleration
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Update camera and target with the eased value
      setCameraPosition([
        startPos[0] + (endPos[0] - startPos[0]) * eased,
        startPos[1] + (endPos[1] - startPos[1]) * eased,
        startPos[2] + (endPos[2] - startPos[2]) * eased
      ]);
      
      setCameraTarget([
        startTarget[0] + (endTarget[0] - startTarget[0]) * eased,
        startTarget[1] + (endTarget[1] - startTarget[1]) * eased,
        startTarget[2] + (endTarget[2] - startTarget[2]) * eased
      ]);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        // After camera is in position, enable spacecraft mode
        setTimeout(() => {
          setIsSpacecraftMode(true);
        }, 100);
      }
    };
    
    // Start the animation
    requestAnimationFrame(animateCamera);
  }, [cameraPosition, cameraTarget]);
  
  // Handle the end of spacecraft mode
  const handleEndSpacecraftMode = useCallback(() => {
    // Start smooth transition back to normal view
    const startPos = [...cameraPosition];
    const endPos = [0, 20, 40]; // Default view position
    
    const startTarget = [...cameraTarget];
    const endTarget = [0, 0, 0]; // Default target (center)
    
    // Stop music
    if (audioRef.current) {
      // Fade out audio
      const fadeAudio = setInterval(() => {
        if (audioRef.current.volume > 0.1) {
          audioRef.current.volume -= 0.1;
        } else {
          clearInterval(fadeAudio);
          audioRef.current.pause();
          audioRef.current.volume = 0.7; // Reset volume for next time
        }
      }, 100);
    }
    
    // Don't disable spacecraft mode immediately to allow for smooth transition
    let startTime = null;
    const animDuration = 1200; // milliseconds (1.2 seconds)
    
    // Use requestAnimationFrame for smoother animation
    const animateExitCamera = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      
      // Cubic easing function - more gentle acceleration and deceleration
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Update camera position and target
      setCameraPosition([
        startPos[0] + (endPos[0] - startPos[0]) * eased,
        startPos[1] + (endPos[1] - startPos[1]) * eased,
        startPos[2] + (endPos[2] - startPos[2]) * eased
      ]);
      
      setCameraTarget([
        startTarget[0] + (endTarget[0] - startTarget[0]) * eased,
        startTarget[1] + (endTarget[1] - startTarget[1]) * eased,
        startTarget[2] + (endTarget[2] - startTarget[2]) * eased
      ]);
      
      if (progress < 1) {
        requestAnimationFrame(animateExitCamera);
      } else {
        // Only disable spacecraft mode after camera transition is complete
        setIsSpacecraftMode(false);
      }
    };
    
    // Start the animation
    requestAnimationFrame(animateExitCamera);
  }, [cameraPosition, cameraTarget]);
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Wrap the entire app in the SciFiEventContext provider */}
      <SciFiEventNotification isSciFiMode={isSciFiMode}>
        <Canvas camera={{ position: cameraPosition, fov: 60 }} style={{ background: 'black' }}>
          <ambientLight intensity={0.6} />
          
          {/* Enhanced lighting for sun */}
          <pointLight position={[0, 0, 0]} intensity={2.5} distance={150} color={isSciFiMode ? "#00FFFF" : "#FDB813"} />
          <pointLight position={[0, 0, 0]} intensity={1.5} distance={10} color="#FFFFFF" />
          
          {/* Additional fill light to better illuminate planets */}
          <hemisphereLight skyColor="#FFFFFF" groundColor="#303030" intensity={0.4} />
          
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
          {isSciFiMode && !isSpacecraftMode && wormholePositions.map((pos, index) => (
            <Wormhole 
              key={`wormhole-${index}`}
              position={[pos.x, pos.y, pos.z]}
              size={pos.size}
              onJump={handleWormholeJump}
            />
          ))}
          
          {/* Spacecraft (only when spacecraft mode is active) */}
          {isSciFiMode && isSpacecraftMode && (
            <Spacecraft 
              position={spacecraftPosition}
              onEnd={handleEndSpacecraftMode}
            />
          )}
          
          {/* SciFi Event Effects (when events are active) */}
          {isSciFiMode && <SciFiEventEffects />}
          
          {/* Camera controller - only active when spacecraft mode is off */}
          {!isSpacecraftMode && (
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              target={new THREE.Vector3(...cameraTarget)}
            />
          )}
        </Canvas>
      </SciFiEventNotification>
      
      {/* Control UI elements - these should be hidden in spacecraft mode */}
      {!isSpacecraftMode && (
        <>
          {/* Sci-fi mode toggle button */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: isSciFiMode ? 'rgba(0, 40, 80, 0.8)' : 'rgba(0, 0, 0, 0.7)',
            padding: isSciFiMode ? '12px' : '10px',
            borderRadius: '10px',
            color: isSciFiMode ? '#00FFFF' : 'white',
            fontFamily: isSciFiMode ? 'monospace' : 'Arial, sans-serif',
            cursor: 'pointer',
            border: isSciFiMode ? '1px solid #00FFFF' : 'none',
            boxShadow: isSciFiMode ? '0 0 15px rgba(0, 255, 255, 0.5)' : 'none',
            transition: 'all 0.3s ease',
            fontSize: 'clamp(0.8rem, 3vw, 1.1rem)',
            maxWidth: '45vw',
            zIndex: 10
          }} onClick={toggleSciFiMode} className="scifi-toggle-btn">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isSciFiMode && (
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: '#00FFFF', 
                  marginRight: '6px',
                  boxShadow: '0 0 8px #00FFFF',
                  animation: 'pulse 2s infinite'
                }} />
              )}
              <h3 style={{ margin: 0, fontSize: 'inherit', whiteSpace: 'nowrap' }}>
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
          
          {/* Info panel */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: isSciFiMode ? 'rgba(0, 40, 80, 0.8)' : 'rgba(0, 0, 0, 0.7)',
            padding: '10px',
            borderRadius: '10px',
            color: isSciFiMode ? '#00FFFF' : 'white',
            fontFamily: isSciFiMode ? 'monospace' : 'Arial, sans-serif',
            maxWidth: 'min(300px, 40vw)',
            border: isSciFiMode ? '1px solid #00FFFF' : 'none',
            boxShadow: isSciFiMode ? '0 0 15px rgba(0, 255, 255, 0.3)' : 'none',
            fontSize: 'clamp(0.7rem, 2.5vw, 1rem)',
            zIndex: 10
          }} className="info-panel">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1em', whiteSpace: 'normal' }}>{isSciFiMode ? "Galactic Explorer" : ""}</h3>
            {!isSciFiMode && <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', whiteSpace: 'normal' }}></p>}
            {isSciFiMode && (
              <p style={{ margin: '5px 0', color: '#FF00FF', fontSize: '0.9em', whiteSpace: 'normal' }}>Click wormholes to travel in a spacecraft!</p>
            )}
          </div>
          
          <style>{`
            @media screen and (max-width: 768px) {
              .info-panel {
                padding: 8px !important;
                font-size: clamp(0.6rem, 2vw, 0.9rem) !important;
              }
              body.scifi-active .info-panel {
                right: auto !important;
                left: 20px !important;
                top: 75px !important;
                max-width: min(250px, 45vw) !important;
              }
              .scifi-toggle-btn {
                padding: 10px !important;
                font-size: clamp(0.9rem, 3.5vw, 1.2rem) !important;
                min-width: 120px !important;
              }
            }
            
            @media screen and (max-width: 480px) {
              .info-panel {
                padding: 6px !important;
                max-width: 45vw !important;
                font-size: clamp(0.5rem, 1.8vw, 0.8rem) !important;
              }
              .info-panel h3 {
                margin: 0 0 4px 0 !important;
                font-size: 1em !important;
              }
              .scifi-toggle-btn {
                padding: 10px !important;
                font-size: clamp(0.7rem, 3.2vw, 1rem) !important;
                min-width: 100px !important;
              }
              body.scifi-active .info-panel {
                top: 65px !important;
              }
            }
          `}</style>
          
          {/* Speed control slider */}
          <div style={{
            position: 'absolute', 
            bottom: '5px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            width: 'min(220px, 80vw)', 
            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
            padding: '5px', 
            borderRadius: '6px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            color: 'white', 
            fontFamily: 'Arial, sans-serif', 
            border: 'none', 
            boxShadow: 'none', 
            fontSize: 'clamp(0.5rem, 2vw, 0.8rem)'
          }} data-component-name="App">
            <h3 style={{ margin: '0px 0px 2px', fontSize: '0.8em', color: 'rgba(255, 255, 255, 0.7)' }}>Speed: {speedFactor.toFixed(1)}x</h3>
            <input 
              type="range" 
              min="0.5" 
              max="50" 
              step="0.1" 
              value={speedFactor} 
              onChange={handleSpeedChange} 
              style={{ 
                width: '80%', 
                height: '12px',
                cursor: 'pointer'
              }} 
              data-component-name="App" 
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              width: '80%', 
              marginTop: '1px', 
              fontSize: '0.6em' 
            }} data-component-name="App">
              <span>0.5x</span>
              <span data-component-name="App">50x</span>
            </div>
          </div>
        </>
      )}
      
      {/* Exit spacecraft button */}
      {isSpacecraftMode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 40, 80, 0.8)',
          padding: '15px',
          borderRadius: '10px',
          color: '#00FFFF',
          fontFamily: 'monospace',
          textAlign: 'center',
          border: '1px solid #00FFFF',
          boxShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
          fontSize: '0.9rem',
          cursor: 'pointer',
          zIndex: 1000
        }} onClick={handleEndSpacecraftMode}>
          EXIT SPACECRAFT
        </div>
      )}
    </div>
  );
}