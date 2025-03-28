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
      {/* Spacecraft body */}
      <mesh>
        <boxGeometry args={[effect.size || 1, (effect.size || 1) * 0.3, (effect.size || 1) * 0.5]} />
        <meshStandardMaterial 
          color={"#AAAAAA"}
          metalness={0.8}
          roughness={0.2}
          emissive={effect.emissiveColor || "#FF5500"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Wings */}
      <mesh rotation={[0, 0, 0]} position={[0, 0, (effect.size || 1) * 0.3]}>
        <boxGeometry args={[(effect.size || 1) * 1.5, (effect.size || 1) * 0.1, (effect.size || 1) * 0.3]} />
        <meshStandardMaterial color={"#888888"} metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Engine glow */}
      <pointLight 
        ref={lightRef} 
        position={[0, 0, -(effect.size || 1) * 0.3]}
        color={effect.emissiveColor || "#FF5500"}
        intensity={effect.lightIntensity || 2}
        distance={10}
      />
      <mesh position={[0, 0, -(effect.size || 1) * 0.3]}>
        <sphereGeometry args={[(effect.size || 1) * 0.2, 8, 8]} />
        <meshBasicMaterial 
          color={effect.emissiveColor || "#FF5500"}
          opacity={0.7}
          transparent={true}
        />
      </mesh>
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
          console.log("Found planet:", planetName, object.position);
        }
      });
      if (Object.keys(newPositions).length > 0) {
        console.log("Collected planet positions:", newPositions);
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
