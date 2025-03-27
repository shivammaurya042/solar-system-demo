import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AlienSpacecraft = ({ position = [0, 0, 0], size = 0.3, orbitRadius = 2, orbitSpeed = 0.05, color = '#00FFFF' }) => {
  const craftRef = useRef();
  const glowRef = useRef();
  const engineGlowRef = useRef();

  // Create spacecraft geometry
  const spacecraftGeometry = useMemo(() => {
    // Create a simple spacecraft shape
    const craftShape = new THREE.Shape();
    
    // Main body
    craftShape.moveTo(0, 0);
    craftShape.lineTo(-0.5, -0.2);
    craftShape.lineTo(-0.5, 0.2);
    craftShape.lineTo(0, 0);
    
    // Create extruded geometry for the craft
    const extrudeSettings = {
      steps: 1,
      depth: 0.8,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3
    };
    
    return new THREE.ExtrudeGeometry(craftShape, extrudeSettings);
  }, []);

  // Animation
  useFrame(({ clock }) => {
    if (craftRef.current && glowRef.current && engineGlowRef.current) {
      const time = clock.getElapsedTime();
      
      // Orbital movement
      const x = Math.sin(time * orbitSpeed) * orbitRadius + position[0];
      const z = Math.cos(time * orbitSpeed) * orbitRadius + position[2];
      const y = Math.sin(time * 0.3) * 0.2 + position[1]; // Small vertical movement
      
      craftRef.current.position.set(x, y, z);
      
      // Always face the direction of movement
      craftRef.current.rotation.y = Math.atan2(-(x - craftRef.current.position.x), -(z - craftRef.current.position.z));
      
      // Add some gentle rolling/pitching
      craftRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
      craftRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      
      // Update glow positions
      glowRef.current.position.copy(craftRef.current.position);
      engineGlowRef.current.position.copy(craftRef.current.position);
      
      // Pulse engine glow
      const pulse = Math.sin(time * 5) * 0.2 + 0.8;
      engineGlowRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      {/* Main spacecraft */}
      <group ref={craftRef} scale={[size, size, size]}>
        <mesh geometry={spacecraftGeometry}>
          <meshStandardMaterial 
            color={color} 
            metalness={0.8} 
            roughness={0.2}
            emissive={color}
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Windows/lights */}
        <mesh position={[-0.2, 0, 0.3]}>
          <boxGeometry args={[0.2, 0.1, 0.2]} />
          <meshStandardMaterial 
            color="#FFFFFF" 
            emissive="#FFFFFF"
            emissiveIntensity={1}
          />
        </mesh>
      </group>
      
      {/* Ship glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.5, 16, 16]} />
        <meshBasicMaterial 
          color={color}
          transparent={true}
          opacity={0.15}
        />
      </mesh>
      
      {/* Engine glow */}
      <mesh ref={engineGlowRef} position={[craftRef.current?.position.x - 0.5 * size, 0, 0]}>
        <sphereGeometry args={[size * 0.5, 16, 16]} />
        <meshBasicMaterial 
          color="#FF00FF"
          transparent={true}
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default AlienSpacecraft;
