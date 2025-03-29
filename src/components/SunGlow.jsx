import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Simplified glow effect for the sun with just 2 layers
const SunGlow = ({ size, intensity, color }) => {
  const innerGlowRef = useRef();
  const outerGlowRef = useRef();
  
  // Animate the glow layers
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Subtle pulsing effect
    const pulseFactor = Math.sin(time * 0.5) * 0.03 + 1; // Reduced pulse amplitude
    
    if (innerGlowRef.current) {
      innerGlowRef.current.scale.set(pulseFactor, pulseFactor, pulseFactor);
    }
    
    if (outerGlowRef.current) {
      // Slightly different pulse rate for outer layer
      const outerPulse = Math.sin(time * 0.3) * 0.04 + 1;
      outerGlowRef.current.scale.set(outerPulse, outerPulse, outerPulse);
      // Very slow rotation for subtle movement
      outerGlowRef.current.rotation.z += 0.0002;
    }
  });
  
  return (
    <>
      {/* Inner glow layer */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[size * 1.1, 32, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true} 
          opacity={intensity * 0.4} // Reduced from 0.9
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Outer glow layer */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[size * 1.5, 32, 16]} />
        <meshBasicMaterial 
          color={new THREE.Color(color).offsetHSL(0.05, 0, 0.1).getStyle()} 
          transparent={true} 
          opacity={intensity * 0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
};

export default SunGlow;
