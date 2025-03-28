import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import SunGlow from './SunGlow';
import Atmosphere from './Atmosphere';
import PlanetaryRings from './PlanetaryRings';
import AnimatedRings from './AnimatedRings';
import Moon from './Moon';
import SciFiEffect from './SciFiEffect';
import AlienSpacecraft from './AlienSpacecraft';

// Enhanced Planet component
const Planet = ({ planet, speedFactor, isSciFiMode = false }) => {
  const ref = useRef();
  const planetRef = useRef();
  const { name, color, size, orbitRadius, orbitSpeed, tilt, rotationSpeed } = planet;
  
  // Use a consistent initial angle based on the planet's properties instead of random
  const initialAngleRef = useRef(
    // Use orbit speed to determine starting position - faster planets start further along
    (orbitSpeed || 0) * Math.PI * 2
  );
  
  // Handle texture loading with proper error handling
  const texture = useTexture(planet.textureMap, (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    texture.flipY = false;
  });

  // Apply initial tilt if specified
  useEffect(() => {
    if (tilt && planetRef.current) {
      planetRef.current.rotation.x = tilt * Math.PI;
    }
  }, [tilt]);
  
  // Create material with proper texture handling
  const material = React.useMemo(() => {
    if (texture) {
      return (
        <meshStandardMaterial 
          map={texture}
          emissive={planet.emissive ? (isSciFiMode && planet.pulsating ? color : planet.color || color) : undefined}
          emissiveIntensity={isSciFiMode && planet.emissive ? (planet.emissiveIntensity || 0) * 1.5 : planet.emissiveIntensity || 0}
          roughness={planet.emissive ? 0.2 : 0.7}
          metalness={planet.emissive ? 0.8 : 0.2}
        />
      );
    } else {
      return (
        <meshStandardMaterial 
          color={color}
          emissive={planet.emissive ? (isSciFiMode && planet.pulsating ? color : planet.color || color) : undefined}
          emissiveIntensity={isSciFiMode && planet.emissive ? (planet.emissiveIntensity || 0) * 1.5 : planet.emissiveIntensity || 0}
          roughness={planet.emissive ? 0.2 : 0.7}
          metalness={planet.emissive ? 0.8 : 0.2}
        />
      );
    }
  }, [texture, color, planet.emissive, planet.emissiveIntensity, isSciFiMode, planet.pulsating, planet.color]);
  
  // Update position and rotation
  useFrame(({ clock }) => {
    if (ref.current && planetRef.current) {
      if (orbitRadius) {
        const time = clock.getElapsedTime() * speedFactor;
        // Add the initial angle to make planets start from random positions
        // Multiply orbitSpeed by 2.5 to make planets move faster
        const angle = time * (orbitSpeed * 2.5) + initialAngleRef.current;
        const x = Math.sin(angle) * orbitRadius;
        const z = Math.cos(angle) * orbitRadius;
        ref.current.position.set(x, 0, z);
      }
      
      // Apply rotation - also increase rotation speed by 1.5x
      if (rotationSpeed) {
        planetRef.current.rotation.y += rotationSpeed * speedFactor * 0.015;
      }
      
      // Apply pulsating effect in sci-fi mode
      if (isSciFiMode && planet.pulsating && planetRef.current) {
        const time = clock.getElapsedTime();
        const pulse = Math.sin(time * 2) * 0.05 + 1;
        planetRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });
  
  return (
    <group 
      ref={ref} 
      position={[Math.sin(initialAngleRef.current) * orbitRadius, 0, Math.cos(initialAngleRef.current) * orbitRadius]}
      name={`planet-${name.toLowerCase()}`}
    >
      {/* Planet sphere */}
      <group ref={planetRef}>
        <mesh>
          <sphereGeometry args={[size, 32, 16]} />
          {material}
        </mesh>
        
        {/* Sci-Fi Effect layer */}
        {isSciFiMode && (
          <SciFiEffect 
            size={size} 
            pulsating={planet.pulsating} 
            color={color}
          />
        )}
        
        {/* Rings for gas giants */}
        {planet.hasRings && (
          isSciFiMode && planet.rings.animated ? (
            <AnimatedRings 
              size={size}
              innerRadius={planet.rings.innerRadius}
              outerRadius={planet.rings.outerRadius}
              color={planet.rings.color}
              opacity={planet.rings.opacity}
              animated={true}
            />
          ) : (
            <PlanetaryRings 
              size={size}
              innerRadius={planet.rings.innerRadius}
              outerRadius={planet.rings.outerRadius}
              color={planet.rings.color}
              opacity={planet.rings.opacity}
            />
          )
        )}
      </group>
      
      {/* Atmosphere */}
      {planet.atmosphere && (
        <Atmosphere 
          size={size * planet.atmosphere.size}
          color={planet.atmosphere.color}
          opacity={isSciFiMode ? planet.atmosphere.opacity * 1.5 : planet.atmosphere.opacity}
        />
      )}
      
      {/* Glow effect for sun */}
      {planet.glowIntensity && (
        <SunGlow 
          size={size}
          intensity={isSciFiMode ? planet.glowIntensity * 1.5 : planet.glowIntensity}
          color={isSciFiMode && planet.flares ? "#00FFFF" : color}  // Special color in sci-fi mode
        />
      )}
      
      {/* Alien structures orbiting the planet in sci-fi mode */}
      {isSciFiMode && planet.alienStructure && (
        <AlienSpacecraft 
          position={[0, 0, 0]}
          orbitRadius={size * 2}
          orbitSpeed={0.1}
          size={size * 0.3}
          color={planet.rings ? planet.rings.color : "#00FFFF"}
        />
      )}
      
      {/* Moons */}
      {planet.moons && planet.moons.map((moon, index) => (
        <Moon 
          key={`moon-${name}-${index}`}
          moon={moon}
          parentSize={size}
          speedFactor={speedFactor}
          isSciFiMode={isSciFiMode}
        />
      ))}
    </group>
  );
};

export default Planet;
