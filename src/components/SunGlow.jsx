import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Enhanced glow effect for the sun
const SunGlow = ({ size, intensity, color }) => {
  const innerGlowRef = useRef();
  const middleGlowRef = useRef();
  const outerGlowRef = useRef();
  
  // Animate the glow layers
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Subtle pulsing effect
    const pulseFactor = Math.sin(time * 0.5) * 0.05 + 1;
    
    if (innerGlowRef.current) {
      innerGlowRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
    
    if (middleGlowRef.current) {
      // Slightly different pulse rate for middle layer
      const middlePulse = Math.sin(time * 0.3) * 0.07 + 1;
      middleGlowRef.current.scale.set(middlePulse, middlePulse, middlePulse);
    }
    
    if (outerGlowRef.current) {
      // Rotate the outer glow slightly for dynamic effect
      outerGlowRef.current.rotation.z += 0.0005;
    }
  });
  
  // Create a derived color for the outer glow (slightly different hue)
  const outerColor = new THREE.Color(color).offsetHSL(0.05, 0, 0).getStyle();
  
  return (
    <>
      {/* Inner glow layer */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[size * 1.1, 32, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={intensity * 0.9}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Middle glow layer */}
      <mesh ref={middleGlowRef}>
        <sphereGeometry args={[size * 1.3, 32, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={intensity * 0.6}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer glow layer */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[size * 1.8, 32, 16]} />
        <meshBasicMaterial 
          color={outerColor} 
          transparent={true} 
          opacity={intensity * 0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Corona effect */}
      <mesh>
        <sphereGeometry args={[size * 2.5, 32, 16]} />
        <meshBasicMaterial 
          color={new THREE.Color(color).offsetHSL(0.1, -0.1, 0.1).getStyle()} 
          transparent={true} 
          opacity={intensity * 0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
};

export default SunGlow;
