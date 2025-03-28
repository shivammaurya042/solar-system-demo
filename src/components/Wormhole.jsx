import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Wormhole = ({ position, size = 1.5, onJump }) => {
  const groupRef = useRef();
  const portalRef = useRef();
  const particlesRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [activated, setActivated] = useState(false);
  
  // Create particle system for the wormhole
  const particles = useMemo(() => {
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleSize = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Create spiral pattern
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * size;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * size * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Colors: purples, blues, and cyans for sci-fi effect
      colors[i * 3] = 0.5 + Math.random() * 0.5; // R
      colors[i * 3 + 1] = Math.random() * 0.5; // G
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
      
      particleSize[i] = Math.random() * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(particleSize, 1));
    
    return geometry;
  }, [size]);
  
  // Animation effect
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Rotate the entire wormhole
      groupRef.current.rotation.z = time * 0.2;
      
      // Rotate the inner portal differently
      if (portalRef.current) {
        portalRef.current.rotation.z = -time * 0.4;
        portalRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
        
        // Pulse effect
        const pulse = Math.sin(time * 2) * 0.1 + 1;
        portalRef.current.scale.set(pulse, pulse, pulse);
      }
      
      // Animate particles
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          const angle = time * 0.5 + idx * 0.01;
          const radius = Math.sin(time * 0.1 + idx * 0.05) * size * 0.3 + size * 0.7;
          
          positions[i] += Math.sin(angle) * 0.01;
          positions[i + 2] += Math.cos(angle) * 0.01;
          
          // Pull particles toward center if activated
          if (activated) {
            const dx = positions[i];
            const dy = positions[i + 1];
            const dz = positions[i + 2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            positions[i] -= (dx / dist) * 0.05;
            positions[i + 1] -= (dy / dist) * 0.05;
            positions[i + 2] -= (dz / dist) * 0.05;
          }
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  });
  
  // Handle portal click - activate spacecraft mode
  const handleClick = () => {
    if (!activated) {
      setActivated(true);
      
      // Call the jump callback after a brief animation delay (0.5 seconds)
      setTimeout(() => {
        if (onJump) onJump({x: position[0], y: position[1], z: position[2]});
        setActivated(false);
      }, 500);
    }
  };
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Inner glowing portal */}
      <mesh ref={portalRef}>
        <torusGeometry args={[size * 0.8, size * 0.2, 16, 50]} />
        <meshStandardMaterial 
          color={hovered ? "#FF00FF" : "#9932CC"} 
          emissive={hovered ? "#FF00FF" : "#9932CC"}
          emissiveIntensity={hovered ? 2 : 1}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      
      {/* Particle system */}
      <points ref={particlesRef}>
        <primitive object={particles} attach="geometry" />
        <pointsMaterial 
          size={hovered ? 2 : 1.5} 
          vertexColors={true} 
          transparent={true}
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[size * 1.2, 16, 16]} />
        <meshBasicMaterial 
          color="#9932CC"
          transparent={true}
          opacity={0.15}
        />
      </mesh>
    </group>
  );
};

export default Wormhole;
