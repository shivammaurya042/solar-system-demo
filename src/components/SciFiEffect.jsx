import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Sci-Fi shader effect for planets
const SciFiEffect = ({ size, pulsating = false, color }) => {
  const effectRef = useRef();
  
  // Create the shader material for sci-fi effects
  const shaderMaterial = useMemo(() => {
    const colorObj = new THREE.Color(color);
    
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
        intensity: { value: pulsating ? 1.0 : 0.5 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float intensity;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Create wave pattern based on position and time
          float wave = sin(vPosition.x * 10.0 + time) * 
                      sin(vPosition.y * 10.0 + time) * 
                      sin(vPosition.z * 10.0 + time);
          
          // Normalize the wave between 0 and 1
          wave = wave * 0.5 + 0.5;
          
          // Make waves move outward for pulsating effect
          float pulse = sin(length(vPosition) * 5.0 - time * 2.0) * 0.5 + 0.5;
          
          // Create grid-like pattern in the spherical coordinates
          float phi = atan(vPosition.y, vPosition.x);
          float theta = acos(vPosition.z / length(vPosition));
          
          float grid = abs(sin(phi * 20.0 + time)) * abs(sin(theta * 20.0 + time));
          grid = smoothstep(0.8, 1.0, grid);
          
          // Combine effects
          float effect = mix(wave, pulse, 0.5) + grid * 0.3;
          
          // Apply color with intensity
          vec3 glowColor = color * (effect * intensity);
          
          // Apply smooth edge fadeout
          float edge = 1.0 - smoothstep(0.8, 1.0, length(vPosition) / ${size.toFixed(2)});
          
          gl_FragColor = vec4(glowColor, edge * intensity * 0.5);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
  }, [color, pulsating, size]);
  
  // Update the shader time uniform
  useFrame(({ clock }) => {
    if (effectRef.current && effectRef.current.material.uniforms) {
      effectRef.current.material.uniforms.time.value = clock.getElapsedTime();
      
      // Adjust intensity based on pulsating property
      if (pulsating) {
        const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.25 + 0.75;
        effectRef.current.material.uniforms.intensity.value = pulse;
      }
    }
  });
  
  return (
    <mesh ref={effectRef}>
      <sphereGeometry args={[size * 1.05, 32, 32]} />
      <primitive attach="material" object={shaderMaterial} />
    </mesh>
  );
};

export default SciFiEffect;
