import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AnimatedRings = ({ size, innerRadius, outerRadius, color, opacity, animated = false }) => {
  const ringsRef = useRef();
  const particleSystemRef = useRef();
  
  // Create ring particles for the animated version
  const particles = useMemo(() => {
    if (!animated) return null;
    
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Parse the hex color to RGB components
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < particleCount; i++) {
      // Create a random point within the ring's radius
      const angle = Math.random() * Math.PI * 2;
      const r = innerRadius + Math.random() * (outerRadius - innerRadius);
      
      positions[i * 3] = Math.cos(angle) * r * size;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.1; // Slight thickness
      positions[i * 3 + 2] = Math.sin(angle) * r * size;
      
      // Set the color (with some variation)
      colors[i * 3] = colorObj.r * (0.8 + Math.random() * 0.4);
      colors[i * 3 + 1] = colorObj.g * (0.8 + Math.random() * 0.4);
      colors[i * 3 + 2] = colorObj.b * (0.8 + Math.random() * 0.4);
      
      // Set particle size (smaller particles are more common)
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, [size, innerRadius, outerRadius, color, animated]);
  
  // Animation for the particles
  useFrame(({ clock }) => {
    if (ringsRef.current) {
      // Rotate the rings slightly
      ringsRef.current.rotation.z += 0.0003;
    }
    
    if (animated && particleSystemRef.current) {
      const time = clock.getElapsedTime();
      const positions = particleSystemRef.current.geometry.attributes.position.array;
      
      // Animate particles to shimmer and have wave-like motion
      for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3;
        const x = positions[i];
        const z = positions[i + 2];
        
        // Calculate current angle and radius
        const angle = Math.atan2(z, x);
        const radius = Math.sqrt(x * x + z * z);
        
        // Add slight variation to radius based on time and position
        const radiusOffset = Math.sin(angle * 8 + time) * 0.02 * radius;
        
        // Update position with new radius
        const newRadius = radius + radiusOffset;
        positions[i] = Math.cos(angle) * newRadius;
        positions[i + 2] = Math.sin(angle) * newRadius;
        
        // Add slight vertical oscillation
        positions[i + 1] = Math.sin(angle * 20 + time * 3) * 0.02;
      }
      
      particleSystemRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <group ref={ringsRef} rotation={[Math.PI / 2, 0, 0]}>
      {/* Standard ring mesh for non-animated version or as a base */}
      <mesh>
        <ringGeometry args={[innerRadius * size, outerRadius * size, 64]} />
        <meshBasicMaterial 
          color={color}
          transparent={true}
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Particle system for animated version */}
      {animated && particles && (
        <points ref={particleSystemRef}>
          <primitive object={particles} attach="geometry" />
          <pointsMaterial 
            size={0.1} 
            vertexColors={true} 
            transparent={true}
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
};

export default AnimatedRings;
