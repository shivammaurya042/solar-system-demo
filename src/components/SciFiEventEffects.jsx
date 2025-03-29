import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useContext } from 'react';
import * as THREE from 'three';
import { SciFiEventContext } from './SciFiEventNotification';

// Signal Effect Component
const SignalEffect = ({ effect, position }) => {
  const ref = useRef();
  const particlesRef = useRef();
  
  // Generate signal particles
  useEffect(() => {
    if (particlesRef.current) {
      const geometry = new THREE.BufferGeometry();
      const particleCount = effect.particleCount || 200;
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 3;
        const angle = Math.random() * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.random() * 2 - 1;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesRef.current.geometry = geometry;
    }
  }, [effect.particleCount]);
  
  // Animate signal
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      ref.current.rotation.y = time * (effect.pulseRate || 0.8);
      
      // Pulse the signal
      const pulse = Math.sin(time * 3) * 0.2 + 1.0;
      ref.current.scale.set(pulse, pulse, pulse);
      
      // Animate particles
      if (particlesRef.current && particlesRef.current.geometry) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          const angle = time + idx * 0.01;
          positions[i] += Math.sin(angle) * 0.02;
          positions[i + 2] += Math.cos(angle) * 0.02;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Main signal ring */}
      <mesh>
        <torusGeometry args={[3, 0.2, 16, 50]} />
        <meshStandardMaterial 
          color={effect.color}
          emissive={effect.color}
          emissiveIntensity={2}
        />
      </mesh>
      
      {/* Signal particles */}
      <points ref={particlesRef}>
        <pointsMaterial 
          size={0.2}
          color={effect.color}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Central glow */}
      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={effect.color}
          transparent={true}
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

// Wormhole Effect Component - reused from Wormhole.jsx but customized
const WormholeEffect = ({ effect, position }) => {
  const ref = useRef();
  const innerRef = useRef();
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      ref.current.rotation.z = time * 0.2;
      
      if (innerRef.current) {
        innerRef.current.rotation.z = -time * 0.4;
        const pulse = Math.sin(time * 2) * 0.1 + 1;
        innerRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <mesh ref={innerRef}>
        <torusGeometry args={[effect.size || 2, (effect.size || 2) * 0.2, 16, 50]} />
        <meshStandardMaterial 
          color={effect.color || "#9932CC"} 
          emissive={effect.color || "#9932CC"}
          emissiveIntensity={2}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      
      <mesh>
        <sphereGeometry args={[(effect.size || 2) * 1.2, 16, 16]} />
        <meshBasicMaterial 
          color={effect.color || "#9932CC"}
          transparent={true}
          opacity={0.15}
        />
      </mesh>
    </group>
  );
};

// Quantum Fluctuations Effect
const QuantumEffect = ({ effect, position }) => {
  const ref = useRef();
  const particlesRef = useRef();
  
  useEffect(() => {
    if (particlesRef.current) {
      const geometry = new THREE.BufferGeometry();
      const particleCount = effect.particleCount || 500;
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * (effect.spread || 3);
        positions[i * 3] = (Math.random() - 0.5) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * radius;
        positions[i * 3 + 2] = (Math.random() - 0.5) * radius;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesRef.current.geometry = geometry;
    }
  }, [effect.particleCount, effect.spread]);
  
  useFrame(({ clock }) => {
    if (particlesRef.current && particlesRef.current.geometry) {
      const time = clock.getElapsedTime();
      
      const positions = particlesRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3;
        positions[i] += Math.sin(time + idx) * 0.01 * (effect.speed || 1);
        positions[i + 1] += Math.cos(time + idx * 0.5) * 0.01 * (effect.speed || 1);
        positions[i + 2] += Math.sin(time * 0.5 + idx * 0.2) * 0.01 * (effect.speed || 1);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <group ref={ref} position={position}>
      <points ref={particlesRef}>
        <pointsMaterial 
          size={0.15}
          color={effect.color || "#AAFFFF"}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

// Spacecraft Effect
const SpacecraftEffect = ({ effect, position }) => {
  const ref = useRef();
  const lightRef = useRef();
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      // Orbit around the planet
      const radius = 5;
      const angle = time * (effect.speed || 0.5);
      ref.current.position.x = position[0] + Math.cos(angle) * radius;
      ref.current.position.z = position[2] + Math.sin(angle) * radius;
      // Face direction of travel
      ref.current.rotation.y = -angle + Math.PI / 2;
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Spacecraft model */}
      <group scale={[effect.size || 0.3, effect.size || 0.3, effect.size || 0.3]}>
        {/* Main spacecraft body */}
        <mesh>
          <capsuleGeometry args={[0.5, 1.5, 8, 16]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            roughness={0.2}
            metalness={0.9}
            emissive="#444444"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Spacecraft self-illumination */}
        <pointLight 
          position={[0, 0, 0]}
          color="#FFFFFF"
          intensity={1}
          distance={3}
        />
        
        {/* Solar panels */}
        <mesh rotation={[0, 0, Math.PI/2]} position={[0, 0, 0]}>
          <boxGeometry args={[3, 0.05, 1]} />
          <meshStandardMaterial 
            color="#77AAFF"
            roughness={0.1}
            metalness={0.8}
            emissive="#3366CC"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Antenna */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial 
            color="#DDDDDD" 
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.3, 0.3, 16]} />
          <meshStandardMaterial 
            color="#DDDDDD"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Thruster */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.3, 0.1, 0.4, 16]} />
          <meshStandardMaterial 
            color="#777777"
            emissive="#FF6600"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Thruster glow */}
        <pointLight 
          ref={lightRef}
          position={[0, -1.5, 0]}
          color={effect.emissiveColor || "#FF6600"}
          intensity={3}
          distance={8}
        />
        
        {/* Thruster flame */}
        <mesh position={[0, -1.3, 0]}>
          <coneGeometry args={[0.2, 0.6, 16]} />
          <meshBasicMaterial 
            color={effect.emissiveColor || "#FF6600"} 
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        
        {/* Additional visibility light */}
        <spotLight
          position={[0, 2, 0]}
          angle={0.5}
          penumbra={0.2}
          intensity={2}
          color="#FFFFFF"
          distance={10}
        />
      </group>
    </group>
  );
};

// Temporal Anomaly Effect
const TemporalEffect = ({ effect, position }) => {
  const ref = useRef();
  const particlesRef = useRef();
  const distortionRef = useRef();
  
  useEffect(() => {
    if (particlesRef.current) {
      const geometry = new THREE.BufferGeometry();
      const particleCount = effect.particleCount || 150;
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * (effect.radius || 3);
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta);
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesRef.current.geometry = geometry;
    }
  }, [effect.particleCount, effect.radius]);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      
      // Spin the anomaly
      ref.current.rotation.y = time * 0.2;
      
      if (distortionRef.current) {
        // Pulse the distortion sphere
        const pulse = Math.sin(time * 1.5) * 0.2 + 1;
        distortionRef.current.scale.set(pulse, pulse, pulse);
      }
      
      // Animate particles - reverse direction if timeReversal is true
      if (particlesRef.current && particlesRef.current.geometry) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        const direction = effect.timeReversal ? -1 : 1;
        
        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          const angle = time * direction + idx * 0.1;
          
          // Spiral motion
          const radius = Math.sqrt(positions[i]**2 + positions[i+2]**2);
          if (radius > 0.1) {
            const currentAngle = Math.atan2(positions[i+2], positions[i]);
            const newAngle = currentAngle + 0.01 * direction;
            
            positions[i] = radius * Math.cos(newAngle);
            positions[i + 2] = radius * Math.sin(newAngle);
          }
          
          // Vertical oscillation
          positions[i + 1] += Math.sin(angle) * 0.01 * direction;
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Distortion sphere */}
      <mesh ref={distortionRef}>
        <sphereGeometry args={[effect.radius || 3, 20, 20]} />
        <meshStandardMaterial 
          color={effect.colorShift || "#FF00FF"}
          transparent={true}
          opacity={0.15}
          wireframe={true}
        />
      </mesh>
      
      {/* Particles */}
      <points ref={particlesRef}>
        <pointsMaterial 
          size={0.15}
          color={effect.colorShift || "#FF00FF"}
          transparent={true}
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

// Mars Mission Spacecraft Effect - Realistic Earth to Mars trajectory
const MarsMissionEffect = ({ effect, position }) => {
  const ref = useRef();
  const trajectoryRef = useRef();
  const spacecraftRef = useRef();
  const lightRef = useRef();
  const { clock } = useThree();
  const [launchProgress, setLaunchProgress] = useState(0);
  
  // Earth and Mars positions in the solar system
  const earthPosition = new THREE.Vector3(10, 0, 0); // Earth's orbit radius is 10
  const marsPosition = new THREE.Vector3(13, 0, 0);  // Mars' orbit radius is 13
  
  // Calculate Hohmann transfer orbit parameters
  useEffect(() => {
    if (trajectoryRef.current) {
      // Create the Hohmann transfer ellipse
      const r1 = 10; // Earth orbit radius 
      const r2 = 13; // Mars orbit radius
      const a = (r1 + r2) / 2; // Semi-major axis
      const b = Math.sqrt(r1 * r2); // Semi-minor axis approximation
      const e = Math.sqrt(1 - (b*b)/(a*a)); // Eccentricity
      
      // Create the transfer orbit curve
      const curve = new THREE.EllipseCurve(
        0, 0,             // Center
        a, b,             // X and Y radius
        0, Math.PI,       // Start and end angle (half-ellipse for transfer)
        false,            // Clockwise
        Math.PI/2         // Rotation angle to orient correctly
      );
      
      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      trajectoryRef.current.geometry = geometry;
    }
  }, []);
  
  // Animate the spacecraft along the trajectory
  useFrame(() => {
    if (ref.current && spacecraftRef.current) {
      // Get the time from the start of the animation
      const time = clock.getElapsedTime();
      const missionDuration = effect.missionDuration || 20; // Total seconds for the mission
      const progress = Math.min((time % missionDuration) / missionDuration, 1);
      setLaunchProgress(progress);
      
      // Calculate Earth and Mars positions at current time
      // Earth orbits at 0.005 speed, Mars at 0.004
      const earthAngle = time * 0.005;
      const marsAngle = time * 0.004;
      const earthPos = new THREE.Vector3(
        Math.cos(earthAngle) * 10,
        0,
        Math.sin(earthAngle) * 10
      );
      const marsPos = new THREE.Vector3(
        Math.cos(marsAngle) * 13,
        0,
        Math.sin(marsAngle) * 13
      );
      
      // First part of the mission: launch preparation (0-5%)
      if (progress < 0.05) {
        // Position the spacecraft on Earth
        spacecraftRef.current.position.copy(earthPos);
        spacecraftRef.current.lookAt(marsPos);
        
        // Make spacecraft "sit" on the planet surface
        const launchOffset = new THREE.Vector3(0, 0.8, 0); // Just above the planet
        spacecraftRef.current.position.add(launchOffset);
      } 
      // Second part: launch and escape Earth's orbit (5-15%)
      else if (progress < 0.15) {
        const p = (progress - 0.05) / 0.1; // Normalized progress for this phase
        
        // Start spiraling outward from Earth
        const spiralRadius = 0.8 + p * 1.5;
        const spiralAngle = p * Math.PI * 8;
        const spiralOffset = new THREE.Vector3(
          Math.cos(spiralAngle) * spiralRadius,
          p * 0.5, // Rising up slightly
          Math.sin(spiralAngle) * spiralRadius
        );
        
        spacecraftRef.current.position.copy(earthPos).add(spiralOffset);
        spacecraftRef.current.lookAt(marsPos);
      } 
      // Third part: Hohmann transfer orbit (15-85%)
      else if (progress < 0.85) {
        const p = (progress - 0.15) / 0.7; // Normalized progress for transfer
        
        // Earth's position at launch
        const initialEarthAngle = earthAngle - (0.7 * 0.005 * missionDuration * p);
        const initialEarthPos = new THREE.Vector3(
          Math.cos(initialEarthAngle) * 10,
          0,
          Math.sin(initialEarthAngle) * 10
        );
        
        // Calculate position along the transfer orbit
        const r1 = 10; // Earth orbit radius 
        const r2 = 13; // Mars orbit radius
        const a = (r1 + r2) / 2; // Semi-major axis
        
        // Parametric equation of the transfer ellipse
        const angle = p * Math.PI; // 0 to π for half-ellipse
        const r = a * (1 - Math.pow(Math.cos(angle - Math.PI/2), 2) * (1 - r1/r2));
        
        // Calculate spacecraft position in the orbit
        const transferAngle = initialEarthAngle + angle + Math.PI/2;
        const spacecraftPos = new THREE.Vector3(
          Math.cos(transferAngle) * r,
          Math.sin(angle - Math.PI/2) * 0.5, // Small vertical variation for visual interest
          Math.sin(transferAngle) * r
        );
        
        spacecraftRef.current.position.copy(spacecraftPos);
        
        // Orient spacecraft toward Mars
        spacecraftRef.current.lookAt(marsPos);
      } 
      // Final part: Mars approach and landing (85-100%)
      else {
        const p = (progress - 0.85) / 0.15; // Normalized progress for this phase
        
        // Spiral inward to Mars
        const spiralRadius = 1.5 * (1 - p) + 0.8;
        const spiralAngle = p * Math.PI * 6;
        const spiralOffset = new THREE.Vector3(
          Math.cos(spiralAngle) * spiralRadius,
          (1 - p) * 0.5, // Descending
          Math.sin(spiralAngle) * spiralRadius
        );
        
        spacecraftRef.current.position.copy(marsPos).add(spiralOffset);
        spacecraftRef.current.lookAt(marsPos);
      }
      
      // Rotate the spacecraft for visual interest
      spacecraftRef.current.rotation.z = time * 0.1;
      
      // Add thruster effect during certain phases
      if (progress < 0.15 || (progress > 0.75 && progress < 0.95)) {
        // Thruster is firing during launch or landing
        if (lightRef.current) {
          lightRef.current.intensity = 2 + Math.sin(time * 10) * 0.5; // Pulsating light
        }
      } else {
        // Cruising phase - lower intensity
        if (lightRef.current) {
          lightRef.current.intensity = 0.5;
        }
      }
    }
  });
  
  return (
    <group ref={ref}>
      {/* Transfer orbit trajectory visualization */}
      <line ref={trajectoryRef}>
        <lineBasicMaterial 
          color="#FF9966" 
          opacity={0.4} 
          transparent={true} 
          linewidth={1}
          dashSize={0.5}
          gapSize={0.2}
        />
      </line>
      
      {/* Spacecraft model */}
      <group ref={spacecraftRef} scale={[effect.size || 0.3, effect.size || 0.3, effect.size || 0.3]}>
        {/* Main spacecraft body */}
        <mesh>
          <capsuleGeometry args={[0.5, 1.5, 8, 16]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            roughness={0.2}
            metalness={0.9}
            emissive="#444444"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Spacecraft self-illumination */}
        <pointLight 
          position={[0, 0, 0]}
          color="#FFFFFF"
          intensity={1}
          distance={3}
        />
        
        {/* Solar panels */}
        <mesh rotation={[0, 0, Math.PI/2]} position={[0, 0, 0]}>
          <boxGeometry args={[3, 0.05, 1]} />
          <meshStandardMaterial 
            color="#77AAFF"
            roughness={0.1}
            metalness={0.8}
            emissive="#3366CC"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Antenna */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial 
            color="#DDDDDD" 
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0, 1.2, 0]} rotation={[Math.PI/2, 0, 0]}>
          <coneGeometry args={[0.3, 0.3, 16]} />
          <meshStandardMaterial 
            color="#DDDDDD"
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Thruster */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.3, 0.1, 0.4, 16]} />
          <meshStandardMaterial 
            color="#777777"
            emissive="#FF6600"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Thruster glow */}
        <pointLight 
          ref={lightRef}
          position={[0, -1.5, 0]}
          color={effect.emissiveColor || "#FF6600"}
          intensity={3}
          distance={8}
        />
        
        {/* Thruster flame */}
        <mesh position={[0, -1.3, 0]}>
          <coneGeometry args={[0.2, 0.6, 16]} />
          <meshBasicMaterial 
            color={effect.emissiveColor || "#FF6600"} 
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        
        {/* Additional visibility light */}
        <spotLight
          position={[0, 2, 0]}
          angle={0.5}
          penumbra={0.2}
          intensity={2}
          color="#FFFFFF"
          distance={10}
        />
      </group>
    </group>
  );
};

// Main component to render the appropriate effect
const SciFiEventEffects = () => {
  const { activeEvent } = useContext(SciFiEventContext);
  const [planetPositions, setPlanetPositions] = useState({});
  const [cameraControlled, setCameraControlled] = useState(false);
  const { camera, scene } = useThree();
  
  // Debug log when activeEvent changes
  useEffect(() => {
    console.log("SciFiEventEffects received event:", activeEvent);
  }, [activeEvent]);
  
  // Find planet positions
  useFrame(() => {
    if (!activeEvent) return;
    
    // Only calculate planet positions once per event
    if (Object.keys(planetPositions).length === 0) {
      const newPositions = {};
      scene.traverse((object) => {
        // Log all object names for debugging
        if (object.name) {
          console.log("Object in scene:", object.name, object.type, object.position);
        }
        
        // Look for planet mesh groups
        if (object.name && (object.name.includes('planet-') || object.name.toLowerCase() === activeEvent.planetTarget?.toLowerCase())) {
          let planetName = object.name.includes('planet-') ? object.name.replace('planet-', '') : object.name;
          newPositions[planetName.toLowerCase()] = object.position.clone();
        }
      });
      if (Object.keys(newPositions).length > 0) {
        setPlanetPositions(newPositions);
      } else {
        console.warn("No planets found in scene with proper names");
      }
    }
    
    // Focus camera on event if needed
    if (activeEvent.cameraFocus && !cameraControlled && activeEvent.planetTarget) {
      const targetPlanet = activeEvent.planetTarget.toLowerCase();
      Object.entries(planetPositions).forEach(([name, position]) => {
        if (name.toLowerCase().includes(targetPlanet)) {
          // Move camera to focus on the event
          setCameraControlled(true);
          
          // Animation will be handled in useEffect cleanup
        }
      });
    }
  });
  
  // Reset camera control when event changes
  useEffect(() => {
    return () => {
      setCameraControlled(false);
    };
  }, [activeEvent]);
  
  if (!activeEvent) return null;
  
  // Determine target position
  let targetPosition = [0, 0, 0];
  if (activeEvent.planetTarget) {
    const targetPlanet = activeEvent.planetTarget.toLowerCase();
    Object.entries(planetPositions).forEach(([name, position]) => {
      if (name.toLowerCase().includes(targetPlanet)) {
        targetPosition = [position.x, position.y, position.z];
      }
    });
  }
  
  // Render the appropriate effect based on the event type
  return (
    <group>
      {activeEvent.effect.type === 'signal' && (
        <SignalEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'wormhole' && (
        <WormholeEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'quantum' && (
        <QuantumEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'spacecraft' && (
        <SpacecraftEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'temporal' && (
        <TemporalEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'energySurge' && (
        <EnergySurgeEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'darkMatter' && (
        <DarkMatterEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'binaryStar' && (
        <BinaryStarEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'transmission' && (
        <TransmissionEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'gravitationalWaves' && (
        <GravitationalWavesEffect effect={activeEvent.effect} position={targetPosition} />
      )}
      
      {activeEvent.effect.type === 'marsMission' && (
        <MarsMissionEffect effect={activeEvent.effect} position={targetPosition} />
      )}
    </group>
  );
};

// Energy Surge Effect
const EnergySurgeEffect = ({ effect, position }) => {
  const ref = useRef();
  const particlesRef = useRef();
  
  useEffect(() => {
    if (particlesRef.current) {
      const geometry = new THREE.BufferGeometry();
      const particleCount = 200;
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * 3;
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta);
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesRef.current.geometry = geometry;
    }
  }, []);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      
      // Rotate the energy surge
      ref.current.rotation.y = time * 0.5;
      
      // Animate particles
      if (particlesRef.current && particlesRef.current.geometry) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          const angle = time * (effect.pulseFrequency || 1.5) + idx * 0.1;
          
          // Expand particles outward
          const x = positions[i];
          const y = positions[i + 1];
          const z = positions[i + 2];
          const dist = Math.sqrt(x*x + y*y + z*z);
          
          if (dist < 5) {
            positions[i] += (x / dist) * 0.02 * (effect.expansionRate || 0.6);
            positions[i + 1] += (y / dist) * 0.02 * (effect.expansionRate || 0.6);
            positions[i + 2] += (z / dist) * 0.02 * (effect.expansionRate || 0.6);
          } else {
            // Reset particles that go too far
            const radius = Math.random() * 1;
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            
            positions[i] = radius * Math.sin(theta) * Math.cos(phi);
            positions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i + 2] = radius * Math.cos(theta);
          }
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Energy core */}
      <mesh>
        <sphereGeometry args={[1, 20, 20]} />
        <meshStandardMaterial 
          color={effect.color || "#FFAA00"}
          emissive={effect.color || "#FFAA00"}
          emissiveIntensity={(effect.intensity || 3)}
        />
      </mesh>
      
      {/* Energy particles */}
      <points ref={particlesRef}>
        <pointsMaterial 
          size={0.2}
          color={effect.color || "#FFAA00"}
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Lightning bolts */}
      {Array.from({ length: effect.lightningCount || 8 }).map((_, i) => (
        <mesh key={`lightning-${i}`} rotation={[0, i * Math.PI * 2 / (effect.lightningCount || 8), 0]}>
          <cylinderGeometry args={[0.05, 0.05, 4, 3, 1, true]} />
          <meshBasicMaterial 
            color={effect.color || "#FFAA00"}
            transparent={true}
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

// Dark Matter Effect
const DarkMatterEffect = ({ effect, position }) => {
  const ref = useRef();
  const particlesRef = useRef();
  
  useEffect(() => {
    if (particlesRef.current) {
      const geometry = new THREE.BufferGeometry();
      const particleCount = 300;
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        const radius = Math.random() * (effect.radius || 5);
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = radius * Math.cos(theta);
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesRef.current.geometry = geometry;
    }
  }, [effect.radius]);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      
      // Slow rotation for dark matter cloud
      ref.current.rotation.y = time * 0.1;
      
      // Animate particles
      if (particlesRef.current && particlesRef.current.geometry) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          
          // Swirl motion
          const x = positions[i];
          const z = positions[i + 2];
          const dist = Math.sqrt(x*x + z*z);
          
          if (dist > 0.1) {
            const angle = Math.atan2(z, x) + 0.002 * (effect.distortionStrength || 2);
            positions[i] = dist * Math.cos(angle);
            positions[i + 2] = dist * Math.sin(angle);
          }
          
          // Vertical oscillation
          positions[i + 1] += Math.sin(time * 0.2 + idx * 0.05) * 0.005;
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Dark matter cloud */}
      <points ref={particlesRef}>
        <pointsMaterial 
          size={0.15}
          color={effect.color || "#330066"}
          transparent={true}
          opacity={(effect.density || 0.7)}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Central distortion */}
      <mesh>
        <sphereGeometry args={[(effect.radius || 5) * 0.3, 20, 20]} />
        <meshBasicMaterial 
          color={effect.color || "#330066"}
          transparent={true}
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

// Binary Star Effect
const BinaryStarEffect = ({ effect, position }) => {
  const ref = useRef();
  const star1Ref = useRef();
  const star2Ref = useRef();
  
  useFrame(({ clock }) => {
    if (ref.current && star1Ref.current && star2Ref.current) {
      const time = clock.getElapsedTime();
      
      // Orbit the stars around each other
      const orbitRadius = effect.distance || 25;
      const orbitSpeed = effect.orbitSpeed || 0.2;
      const angle = time * orbitSpeed;
      
      star1Ref.current.position.x = Math.cos(angle) * orbitRadius * 0.5;
      star1Ref.current.position.z = Math.sin(angle) * orbitRadius * 0.5;
      
      star2Ref.current.position.x = -Math.cos(angle) * orbitRadius * 0.5;
      star2Ref.current.position.z = -Math.sin(angle) * orbitRadius * 0.5;
      
      // Pulse the stars
      const pulseRate1 = effect.pulseRate ? effect.pulseRate[0] : 0.5;
      const pulseRate2 = effect.pulseRate ? effect.pulseRate[1] : 0.7;
      
      const pulse1 = Math.sin(time * pulseRate1) * 0.1 + 1;
      const pulse2 = Math.sin(time * pulseRate2) * 0.1 + 1;
      
      star1Ref.current.scale.set(pulse1, pulse1, pulse1);
      star2Ref.current.scale.set(pulse2, pulse2, pulse2);
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* First star */}
      <group ref={star1Ref}>
        <mesh>
          <sphereGeometry args={[effect.starSize ? effect.starSize[0] : 1.5, 20, 20]} />
          <meshStandardMaterial 
            color={effect.colors ? effect.colors[0] : "#FFBB22"}
            emissive={effect.colors ? effect.colors[0] : "#FFBB22"}
            emissiveIntensity={2}
          />
        </mesh>
        <pointLight 
          color={effect.colors ? effect.colors[0] : "#FFBB22"}
          intensity={2}
          distance={30}
        />
      </group>
      
      {/* Second star */}
      <group ref={star2Ref}>
        <mesh>
          <sphereGeometry args={[effect.starSize ? effect.starSize[1] : 1.2, 20, 20]} />
          <meshStandardMaterial 
            color={effect.colors ? effect.colors[1] : "#22AAFF"}
            emissive={effect.colors ? effect.colors[1] : "#22AAFF"}
            emissiveIntensity={2}
          />
        </mesh>
        <pointLight 
          color={effect.colors ? effect.colors[1] : "#22AAFF"}
          intensity={1.5}
          distance={25}
        />
      </group>
    </group>
  );
};

// Transmission Effect
const TransmissionEffect = ({ effect, position }) => {
  const ref = useRef();
  const beamRef = useRef();
  const particlesRef = useRef();
  
  useEffect(() => {
    if (particlesRef.current && effect.messageParticles) {
      const geometry = new THREE.BufferGeometry();
      const particleCount = 100;
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        // Create particles along the beam
        const t = i / particleCount;
        const beamLength = effect.beamLength || 15;
        
        positions[i * 3] = 0;
        positions[i * 3 + 1] = beamLength * t;
        positions[i * 3 + 2] = 0;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesRef.current.geometry = geometry;
    }
  }, [effect.messageParticles, effect.beamLength]);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      
      // Rotate the beam slowly
      ref.current.rotation.y = time * 0.1;
      
      // Pulse the beam
      if (beamRef.current) {
        const pulse = Math.sin(time * (effect.pulseFrequency || 1.2)) * 0.3 + 0.7;
        beamRef.current.material.opacity = pulse;
      }
      
      // Animate message particles
      if (particlesRef.current && particlesRef.current.geometry) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        const beamLength = effect.beamLength || 15;
        
        for (let i = 0; i < positions.length; i += 3) {
          // Move particles up the beam
          positions[i + 1] += 0.1;
          
          // Reset particles that reach the top
          if (positions[i + 1] > beamLength) {
            positions[i + 1] = 0;
          }
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Transmission beam */}
      <mesh ref={beamRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry 
          args={[
            effect.beamWidth || 0.5, 
            effect.beamWidth || 0.5, 
            effect.beamLength || 15, 
            8, 
            1, 
            true
          ]} 
        />
        <meshBasicMaterial 
          color={effect.color || "#00FF00"}
          transparent={true}
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Message particles */}
      {effect.messageParticles && (
        <points ref={particlesRef}>
          <pointsMaterial 
            size={0.2}
            color={effect.color || "#00FF00"}
            transparent={true}
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
};

// Gravitational Waves Effect
const GravitationalWavesEffect = ({ effect, position }) => {
  const ref = useRef();
  const wavesRefs = useRef([]);
  
  // Initialize wave refs
  useEffect(() => {
    wavesRefs.current = Array(effect.waveCount || 5).fill().map(() => React.createRef());
  }, [effect.waveCount]);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      
      // Animate each wave
      wavesRefs.current.forEach((waveRef, index) => {
        if (waveRef.current) {
          // Scale waves outward
          const progress = ((time * (effect.speed || 0.8)) % 1 + index / (effect.waveCount || 5)) % 1;
          const scale = progress * (effect.radius || 40);
          
          waveRef.current.scale.set(scale, scale, scale);
          
          // Fade out as they expand
          waveRef.current.material.opacity = 1 - progress;
        }
      });
    }
  });
  
  return (
    <group ref={ref} position={position}>
      {/* Gravitational waves */}
      {Array.from({ length: effect.waveCount || 5 }).map((_, index) => (
        <mesh 
          key={`wave-${index}`} 
          ref={el => wavesRefs.current[index] = el}
        >
          <ringGeometry args={[0.9, 1, 32]} />
          <meshBasicMaterial 
            color={effect.color || "#AAAAFF"}
            transparent={true}
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      
      {/* Central source */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial 
          color={effect.color || "#AAAAFF"}
          opacity={0.5}
          transparent={true}
        />
      </mesh>
    </group>
  );
};

export default SciFiEventEffects;
