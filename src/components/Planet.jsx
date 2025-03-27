import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import SunGlow from './SunGlow';
import Atmosphere from './Atmosphere';
import PlanetaryRings from './PlanetaryRings';
import Moon from './Moon';

// Enhanced Planet component
const Planet = ({ planet, speedFactor }) => {
  const ref = useRef();
  const planetRef = useRef();
  const { name, color, size, orbitRadius, orbitSpeed, tilt, rotationSpeed } = planet;
  
  // Load texture at the top level
  let texture;
  try {
    texture = useTexture(planet.textureMap);
  } catch (error) {
    console.warn(`Failed to load texture for planet: ${name}`, error);
    texture = null;
  }
  
  // Apply initial tilt if specified
  useEffect(() => {
    if (tilt && planetRef.current) {
      planetRef.current.rotation.x = tilt * Math.PI;
    }
  }, [tilt]);
  
  // Create material with proper texture handling
  const material = useMemo(() => {
    if (texture) {
      return (
        <meshStandardMaterial 
          map={texture}
          emissive={planet.emissive ? color : undefined}
          emissiveIntensity={planet.emissiveIntensity || 0}
          roughness={planet.emissive ? 0.2 : 0.7}
          metalness={planet.emissive ? 0.8 : 0.2}
        />
      );
    } else {
      return (
        <meshStandardMaterial 
          color={color}
          emissive={planet.emissive ? color : undefined}
          emissiveIntensity={planet.emissiveIntensity || 0}
          roughness={planet.emissive ? 0.2 : 0.7}
          metalness={planet.emissive ? 0.8 : 0.2}
        />
      );
    }
  }, [texture, color, planet.emissive, planet.emissiveIntensity]);
  
  // Update position and rotation
  useFrame(({ clock }) => {
    if (ref.current && planetRef.current) {
      if (orbitRadius) {
        const time = clock.getElapsedTime() * speedFactor;
        const x = Math.sin(time * orbitSpeed) * orbitRadius;
        const z = Math.cos(time * orbitSpeed) * orbitRadius;
        ref.current.position.set(x, 0, z);
      }
      
      // Apply rotation
      if (rotationSpeed) {
        planetRef.current.rotation.y += rotationSpeed * speedFactor * 0.01;
      }
    }
  });
  
  return (
    <group ref={ref} position={planet.position || [0, 0, 0]}>
      {/* Planet sphere */}
      <group ref={planetRef}>
        <mesh>
          <sphereGeometry args={[size, 32, 16]} />
          {material}
        </mesh>
        
        {/* Rings for gas giants */}
        {planet.hasRings && (
          <PlanetaryRings 
            size={size}
            innerRadius={planet.rings.innerRadius}
            outerRadius={planet.rings.outerRadius}
            color={planet.rings.color}
            opacity={planet.rings.opacity}
          />
        )}
      </group>
      
      {/* Atmosphere */}
      {planet.atmosphere && (
        <Atmosphere 
          size={size * planet.atmosphere.size}
          color={planet.atmosphere.color}
          opacity={planet.atmosphere.opacity}
        />
      )}
      
      {/* Glow effect for sun */}
      {planet.glowIntensity && (
        <SunGlow 
          size={size}
          intensity={planet.glowIntensity}
          color={color}
        />
      )}
      
      {/* Moons */}
      {planet.moons && planet.moons.map((moon, index) => (
        <Moon 
          key={`moon-${name}-${index}`}
          moon={moon}
          parentSize={size}
          speedFactor={speedFactor}
        />
      ))}
    </group>
  );
};

export default Planet;
