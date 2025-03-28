import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const WormholeTunnel = ({ active = false, distortionIntensity = 1 }) => {
  const tunnelRef = useRef();
  const particlesRef = useRef();
  
  // Create tunnel geometry
  const tunnelGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(4, 6, 40, 32, 20, true);
  }, []);
  
  // Create a special material for the tunnel
  const tunnelMaterial = useMemo(() => {
    // Create a dynamic texture for the tunnel
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    // Create a gradient background
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#003366');
    gradient.addColorStop(0.3, '#0066CC');
    gradient.addColorStop(0.7, '#9933FF');
    gradient.addColorStop(1, '#0099FF');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    
    // Add some "energy" lines
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      context.beginPath();
      context.moveTo(0, i * 25);
      context.lineTo(512, i * 25 + Math.random() * 20);
      context.stroke();
    }
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
    
    // Return the material
    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
  }, []);
  
  // Create particles for the tunnel
  const particles = useMemo(() => {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Create spiral pattern along tunnel
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const z = -20 + Math.random() * 40;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = z;
      
      // Colors: multiple blues, purples and cyans for energy effect
      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        // Blue
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.5;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      } else if (colorChoice < 0.6) {
        // Purple
        colors[i * 3] = 0.5 + Math.random() * 0.5;
        colors[i * 3 + 1] = 0.0;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      } else {
        // Cyan
        colors[i * 3] = 0.0;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.3;
      }
      
      sizes[i] = 0.1 + Math.random() * 0.4;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geometry;
  }, []);
  
  // Animation
  useFrame(({ clock }) => {
    if (tunnelRef.current) {
      const time = clock.getElapsedTime();
      
      // Rotate tunnel
      tunnelRef.current.rotation.z = time * 0.1;
      
      // If active, animate tunnel material
      if (tunnelMaterial.map) {
        tunnelMaterial.map.offset.y = -time * 0.5;
      }
    }
    
    if (particlesRef.current && particles) {
      const time = clock.getElapsedTime();
      const positions = particlesRef.current.geometry.attributes.position.array;
      const sizes = particlesRef.current.geometry.attributes.size.array;
      
      // Animate particles
      for (let i = 0; i < positions.length; i += 3) {
        const idx = i / 3;
        
        // Spin and move particles
        const angle = time * (0.1 + idx * 0.0001) + idx;
        const radius = 3 + Math.sin(time * 0.2 + idx * 0.1) * 0.5;
        
        // For active wormhole, move particles forward
        if (active) {
          positions[i + 2] += 0.1 * distortionIntensity;
          
          // Reset particles that go too far
          if (positions[i + 2] > 20) {
            positions[i + 2] = -20;
            // Randomize position a bit 
            positions[i] = Math.cos(angle) * radius;
            positions[i + 1] = Math.sin(angle) * radius;
          }
          
          // Pulse size for active tunnel
          sizes[idx] = (0.1 + Math.sin(time * 5 + idx) * 0.05) * distortionIntensity;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });
  
  return (
    <group>
      {/* Tunnel mesh */}
      <mesh ref={tunnelRef} geometry={tunnelGeometry} material={tunnelMaterial} />
      
      {/* Particles */}
      <points ref={particlesRef}>
        <primitive object={particles} attach="geometry" />
        <pointsMaterial 
          size={1} 
          vertexColors={true} 
          transparent={true}
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
      
      {/* Additional light effects */}
      <pointLight color="#AADDFF" intensity={1} distance={10} decay={2} />
      
      {/* Energy streaks */}
      {active && (
        <>
          <mesh position={[0, 0, -15]}>
            <sphereGeometry args={[2, 32, 32]} />
            <meshBasicMaterial 
              color="#FFFFFF" 
              transparent={true}
              opacity={0.2}
            />
          </mesh>
          <mesh position={[0, 0, 15]}>
            <sphereGeometry args={[2, 32, 32]} />
            <meshBasicMaterial 
              color="#9933FF" 
              transparent={true}
              opacity={0.2}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

export default WormholeTunnel;
