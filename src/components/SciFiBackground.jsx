import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SciFiBackground = ({ isActive = false }) => {
  const nebulaeRef = useRef();
  const galaxyRef = useRef();
  
  // Create nebulae particle system
  const nebulaeParticles = useMemo(() => {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Generate particles in a spherical distribution
    for (let i = 0; i < particleCount; i++) {
      // Distribute on a sphere with some randomness
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      const radius = 50 + Math.random() * 50; // Between 50-100 units
      
      // Convert to Cartesian coordinates
      positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(theta);
      
      // Create purple/blue nebula colors with randomness
      const hue = Math.random() * 0.1 + 0.7; // 0.7-0.8 hue range (purple/blue)
      const sat = Math.random() * 0.3 + 0.7; // 0.7-1.0 saturation
      const lightness = Math.random() * 0.3 + 0.3; // 0.3-0.6 lightness
      
      const color = new THREE.Color().setHSL(hue, sat, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Vary particle sizes
      sizes[i] = Math.random() * 2 + 1; // Between 1-3 units
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  // Create distant galaxies
  const galaxyParticles = useMemo(() => {
    const galaxyCount = 5;
    const particlesPerGalaxy = 500;
    const totalParticles = galaxyCount * particlesPerGalaxy;
    
    const positions = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    
    // Generate galaxy positions (distant points)
    const galaxyCenters = [];
    for (let i = 0; i < galaxyCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(Math.random() * 2 - 1);
      const radius = 80 + Math.random() * 20; // Between 80-100 units
      
      galaxyCenters.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        hue: Math.random(), // Random color for this galaxy
        size: 5 + Math.random() * 10, // Galaxy size
        rotation: Math.random() * Math.PI // Random rotation
      });
    }
    
    // Fill each galaxy with spiral particles
    let particleIndex = 0;
    galaxyCenters.forEach(galaxy => {
      for (let i = 0; i < particlesPerGalaxy; i++) {
        const idx = particleIndex * 3;
        
        // Spiral distribution
        const armAngle = Math.random() * Math.PI * 2;
        const distanceFromCenter = Math.random() * galaxy.size;
        const spiralOffset = distanceFromCenter * 0.3;
        
        // Position relative to galaxy center
        const x = distanceFromCenter * Math.cos(armAngle + spiralOffset);
        const y = (Math.random() - 0.5) * galaxy.size * 0.2; // Thickness
        const z = distanceFromCenter * Math.sin(armAngle + spiralOffset);
        
        // Rotate the galaxy
        const rotatedX = x * Math.cos(galaxy.rotation) - z * Math.sin(galaxy.rotation);
        const rotatedZ = x * Math.sin(galaxy.rotation) + z * Math.cos(galaxy.rotation);
        
        // Offset to galaxy position
        positions[idx] = galaxy.x + rotatedX;
        positions[idx + 1] = galaxy.y + y;
        positions[idx + 2] = galaxy.z + rotatedZ;
        
        // Color based on galaxy hue and position
        const color = new THREE.Color().setHSL(
          galaxy.hue, 
          0.7 + Math.random() * 0.3, 
          0.5 + (1 - distanceFromCenter / galaxy.size) * 0.5
        );
        
        colors[idx] = color.r;
        colors[idx + 1] = color.g;
        colors[idx + 2] = color.b;
        
        // Size based on distance from center (brighter in center)
        sizes[particleIndex] = 0.5 + (1 - distanceFromCenter / galaxy.size) * 2.5;
        
        particleIndex++;
      }
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  // Animation
  useFrame(({ clock }) => {
    if (nebulaeRef.current && galaxyRef.current) {
      const time = clock.getElapsedTime() * 0.05;
      
      // Slow rotation for nebulae
      nebulaeRef.current.rotation.y = time * 0.1;
      
      // Different rotation for galaxies
      galaxyRef.current.rotation.z = time * 0.05;
    }
  });
  
  // Only render when active
  if (!isActive) return null;
  
  return (
    <group>
      {/* Nebulae */}
      <points ref={nebulaeRef}>
        <primitive object={nebulaeParticles} attach="geometry" />
        <pointsMaterial 
          size={2.5} 
          vertexColors={true} 
          transparent={true}
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
      
      {/* Distant galaxies */}
      <points ref={galaxyRef}>
        <primitive object={galaxyParticles} attach="geometry" />
        <pointsMaterial 
          size={1.5} 
          vertexColors={true} 
          transparent={true}
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};

export default SciFiBackground;
