import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useTexture, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced planet data
const planets = [
  { 
    name: 'Sun', 
    color: '#FDB813', 
    size: 2.5, 
    position: [0, 0, 0],
    emissive: true,
    emissiveIntensity: 1.2,
    textureMap: '/textures/sun.jpg',
    glowIntensity: 0.6,
    glowSize: 1.2,
    rotationSpeed: 0.001
  },
  { 
    name: 'Mercury', 
    color: '#B7B8B9', 
    size: 0.4, 
    orbitRadius: 5, 
    orbitSpeed: 0.01,
    textureMap: '/textures/mercury.jpg',
    rotationSpeed: 0.004,
    tilt: 0.03
  },
  { 
    name: 'Venus', 
    color: '#E6E6FA', 
    size: 0.6, 
    orbitRadius: 7, 
    orbitSpeed: 0.007,
    textureMap: '/textures/venus.jpg',
    rotationSpeed: -0.002, // Retrograde rotation
    tilt: 3.1,
    atmosphere: {
      color: '#FFFACD',
      opacity: 0.3,
      size: 1.05
    }
  },
  { 
    name: 'Earth', 
    color: '#2E86C1', 
    size: 0.7, 
    orbitRadius: 10, 
    orbitSpeed: 0.005,
    textureMap: '/textures/earth.jpg',
    rotationSpeed: 0.01,
    tilt: 0.41,
    atmosphere: {
      color: '#ADD8E6',
      opacity: 0.2,
      size: 1.05
    },
    moons: [
      {
        name: 'Moon',
        size: 0.2,
        orbitRadius: 1.2,
        orbitSpeed: 0.03,
        textureMap: '/textures/moon.jpg',
        rotationSpeed: 0.01
      }
    ]
  },
  { 
    name: 'Mars', 
    color: '#C1440E', 
    size: 0.5, 
    orbitRadius: 13, 
    orbitSpeed: 0.004,
    textureMap: '/textures/mars.jpg',
    rotationSpeed: 0.009,
    tilt: 0.44,
    atmosphere: {
      color: '#FFD700',
      opacity: 0.1,
      size: 1.05
    }
  },
  { 
    name: 'Jupiter', 
    color: '#E0A951', 
    size: 1.2, 
    orbitRadius: 18, 
    orbitSpeed: 0.002,
    textureMap: '/textures/jupiter.jpg',
    rotationSpeed: 0.02,
    tilt: 0.05,
    hasRings: true,
    rings: {
      innerRadius: 1.3,
      outerRadius: 1.8,
      color: '#D2B48C',
      opacity: 0.6
    }
  },
  { 
    name: 'Saturn', 
    color: '#EAD6B8', 
    size: 1.0, 
    orbitRadius: 23, 
    orbitSpeed: 0.0015,
    textureMap: '/textures/saturn.jpg',
    rotationSpeed: 0.018,
    tilt: 0.47,
    hasRings: true,
    rings: {
      innerRadius: 1.2,
      outerRadius: 2.2,
      color: '#F5DEB3',
      opacity: 0.8
    }
  },
  { 
    name: 'Uranus', 
    color: '#D1E7E7', 
    size: 0.8, 
    orbitRadius: 28, 
    orbitSpeed: 0.001,
    textureMap: '/textures/uranus.jpg',
    rotationSpeed: 0.012,
    tilt: 1.71, // Extreme axial tilt
    hasRings: true,
    rings: {
      innerRadius: 1.2,
      outerRadius: 1.6,
      color: '#B0C4DE',
      opacity: 0.5
    }
  },
  { 
    name: 'Neptune', 
    color: '#5B5DDF', 
    size: 0.8, 
    orbitRadius: 32, 
    orbitSpeed: 0.0008,
    textureMap: '/textures/neptune.jpg',
    rotationSpeed: 0.014,
    tilt: 0.49,
    hasRings: true,
    rings: {
      innerRadius: 1.2,
      outerRadius: 1.5,
      color: '#4682B4',
      opacity: 0.4
    }
  },
];

// Glow effect for the sun
function SunGlow({ size, intensity, color }) {
  return (
    <mesh>
      <sphereGeometry args={[size * 1.2, 32, 16]} />
      <meshBasicMaterial 
        color={color} 
        transparent={true} 
        opacity={intensity}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Atmosphere effect
function Atmosphere({ size, color, opacity }) {
  return (
    <mesh>
      <sphereGeometry args={[size, 32, 16]} />
      <meshBasicMaterial 
        color={color} 
        transparent={true} 
        opacity={opacity}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Rings component
function PlanetaryRings({ size, innerRadius, outerRadius, color, opacity }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[size * innerRadius, size * outerRadius, 64]} />
      <meshStandardMaterial 
        color={color} 
        transparent={true} 
        opacity={opacity} 
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Moon component
function Moon({ moon, parentSize, speedFactor }) {
  const ref = useRef();
  const moonRef = useRef();
  const texture = useTexture(moon.textureMap);
  
  // Create a fallback material
  const material = useMemo(() => {
    if (texture) {
      return <meshStandardMaterial map={texture} />;
    } else {
      return <meshStandardMaterial color="#D0D0D0" />;
    }
  }, [texture]);
  
  useFrame(({ clock }) => {
    if (ref.current && moonRef.current) {
      const time = clock.getElapsedTime() * speedFactor;
      
      // Orbit around parent planet
      const angle = time * moon.orbitSpeed;
      const x = Math.sin(angle) * moon.orbitRadius * parentSize;
      const z = Math.cos(angle) * moon.orbitRadius * parentSize;
      ref.current.position.set(x, 0, z);
      
      // Self rotation
      if (moon.rotationSpeed) {
        moonRef.current.rotation.y += moon.rotationSpeed * speedFactor * 0.01;
      }
    }
  });
  
  return (
    <group ref={ref}>
      <mesh ref={moonRef}>
        <sphereGeometry args={[moon.size, 32, 16]} />
        {material}
      </mesh>
    </group>
  );
}

// Enhanced Planet component
function Planet({ planet, speedFactor }) {
  const ref = useRef();
  const planetRef = useRef();
  const { name, color, size, orbitRadius, orbitSpeed, tilt, rotationSpeed } = planet;
  const texture = useTexture(planet.textureMap);
  
  // Apply initial tilt if specified
  useMemo(() => {
    if (tilt && planetRef.current) {
      planetRef.current.rotation.x = tilt * Math.PI;
    }
  }, [tilt]);
  
  // Create a fallback material
  const material = useMemo(() => {
    if (texture) {
      return (
        <meshStandardMaterial 
          map={texture}
          emissive={planet.emissive ? color : undefined}
          emissiveIntensity={planet.emissiveIntensity || 0}
        />
      );
    } else {
      return (
        <meshStandardMaterial 
          color={color}
          emissive={planet.emissive ? color : undefined}
          emissiveIntensity={planet.emissiveIntensity || 0}
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
}

// Orbit path component
function OrbitPath({ radius }) {
  const points = [];
  const segments = 128;
  
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = radius * Math.sin(angle);
    const z = radius * Math.cos(angle);
    points.push(new THREE.Vector3(x, 0, z));
  }
  
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="white" transparent opacity={0.2} />
    </line>
  );
}

// Main App component
export default function App() {
  const [speedFactor, setSpeedFactor] = useState(1);
  
  // Handle speed change with debounce to prevent excessive re-renders
  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeedFactor(newSpeed);
  };
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 20, 40], fov: 60 }} style={{ background: 'black' }}>
        <ambientLight intensity={0.3} />
        
        {/* Point light at sun position */}
        <pointLight position={[0, 0, 0]} intensity={1.5} distance={100} color="#FDB813" />
        
        {/* Stars background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
        
        {/* Orbit paths */}
        {planets.filter(planet => planet.orbitRadius).map((planet, index) => (
          <OrbitPath key={`orbit-${index}`} radius={planet.orbitRadius} />
        ))}
        
        {/* Planets */}
        {planets.map((planet, index) => (
          <Planet key={`planet-${planet.name}`} planet={planet} speedFactor={speedFactor} />
        ))}
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      {/* Speed control slider */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Orbital Speed: {speedFactor.toFixed(1)}x</h3>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={speedFactor}
          onChange={handleSpeedChange}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '5px' }}>
          <span>0.1x</span>
          <span>10x</span>
        </div>
      </div>
      
      {/* Info panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '300px',
      }}>
      </div>
    </div>
  );
}