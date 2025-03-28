import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WormholeSpacecraft = ({ position = [0, 0, 0], rotation = [0, 0, 0], active = false, scale = 1 }) => {
  const craftRef = useRef();
  const glowRef = useRef();
  const engineGlowRef = useRef();
  const thrusterRef = useRef();
  
  // Create detailed spacecraft geometry
  const spacecraftGeometry = useMemo(() => {
    // Main body shape
    const craftShape = new THREE.Shape();
    
    // Create a more complex ship shape
    craftShape.moveTo(0, 0);
    craftShape.lineTo(2, 0.8);
    craftShape.lineTo(2, -0.8);
    craftShape.lineTo(0, 0);
    
    // Create extruded geometry for the craft body
    const extrudeSettings = {
      steps: 1,
      depth: 1.2,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.2,
      bevelSegments: 5
    };
    
    return new THREE.ExtrudeGeometry(craftShape, extrudeSettings);
  }, []);
  
  // Create wing geometry
  const wingGeometry = useMemo(() => {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(1.5, 1.5);
    wingShape.lineTo(0.5, 1.5);
    wingShape.lineTo(-0.5, 0);
    wingShape.lineTo(0, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3
    };
    
    return new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
  }, []);
  
  // Animation
  useFrame(({ clock }) => {
    if (craftRef.current && glowRef.current && engineGlowRef.current && thrusterRef.current) {
      const time = clock.getElapsedTime();
      
      // Pulse engine glow
      const pulse = Math.sin(time * 10) * 0.3 + 1.0;
      engineGlowRef.current.scale.set(pulse, pulse, pulse);
      
      // Thruster flare animation
      if (active) {
        thrusterRef.current.scale.set(
          0.8 + Math.random() * 0.4,
          0.8 + Math.random() * 0.4,
          1.5 + Math.random() * 0.5
        );
      } else {
        thrusterRef.current.scale.set(0.5, 0.5, 0.5);
      }
      
      // Slight vibration when active
      if (active) {
        craftRef.current.position.y = Math.sin(time * 50) * 0.01;
        craftRef.current.position.x = Math.cos(time * 45) * 0.01;
      }
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main spacecraft body */}
      <group ref={craftRef}>
        <mesh geometry={spacecraftGeometry}>
          <meshStandardMaterial 
            color="#5A86AD" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#203040"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Wings */}
        <group position={[-0.5, 0, 0.6]}>
          <mesh geometry={wingGeometry}>
            <meshStandardMaterial 
              color="#4B7EAD" 
              metalness={0.8} 
              roughness={0.2}
            />
          </mesh>
        </group>
        
        <group position={[-0.5, 0, -0.6]} rotation={[0, 0, Math.PI]}>
          <mesh geometry={wingGeometry}>
            <meshStandardMaterial 
              color="#4B7EAD" 
              metalness={0.8} 
              roughness={0.2}
            />
          </mesh>
        </group>
        
        {/* Cockpit */}
        <mesh position={[0.6, 0, 0]}>
          <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 0.7]} />
          <meshStandardMaterial 
            color="#88CCFF" 
            metalness={0.2} 
            roughness={0.1}
            emissive="#AADDFF"
            emissiveIntensity={0.5}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        
        {/* Antenna */}
        <mesh position={[-0.8, 0.5, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.01, 0.01, 0.8, 6]} />
          <meshStandardMaterial color="#AAAAAA" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Antenna dish */}
        <mesh position={[-1.1, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 8]} />
          <meshStandardMaterial 
            color="#CCCCCC" 
            metalness={0.9} 
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Engine */}
        <mesh position={[-1.5, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.5, 12]} />
          <meshStandardMaterial 
            color="#334455" 
            metalness={0.9} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Details - top panel */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.6]} />
          <meshStandardMaterial 
            color="#223344" 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Lights */}
        <mesh position={[0.8, 0.2, 0.3]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="#FF0000" 
            emissive="#FF0000"
            emissiveIntensity={2}
          />
        </mesh>
        
        <mesh position={[0.8, 0.2, -0.3]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial 
            color="#00FF00" 
            emissive="#00FF00"
            emissiveIntensity={2}
          />
        </mesh>
      </group>
      
      {/* Ship glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshBasicMaterial 
          color="#4477AA"
          transparent={true}
          opacity={0.15}
        />
      </mesh>
      
      {/* Engine glow */}
      <mesh ref={engineGlowRef} position={[-1.8, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial 
          color="#00AAFF"
          transparent={true}
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Thruster flare */}
      <mesh ref={thrusterRef} position={[-1.8, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.3, 2, 12, 1, true]} />
        <meshBasicMaterial 
          color="#88DDFF"
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default WormholeSpacecraft;
