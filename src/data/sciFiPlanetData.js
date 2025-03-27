// Enhanced sci-fi version of planet data
export const sciFiPlanets = [
  { 
    name: 'Sun', 
    color: '#00FFFF', // Neon blue sun
    size: 2.5, 
    position: [0, 0, 0],
    emissive: true,
    emissiveIntensity: 1.8,
    textureMap: './textures/sun.jpg', // We'll apply a shader effect instead of changing texture
    glowIntensity: 1.2,
    glowSize: 1.5,
    rotationSpeed: 0.003,
    pulsating: true, // New sci-fi property
    flares: true // New sci-fi property
  },
  { 
    name: 'Mercury', 
    color: '#FF00FF', // Magenta Mercury
    size: 0.4, 
    orbitRadius: 5, 
    orbitSpeed: 0.01,
    textureMap: './textures/mercury.jpg', // Will be modified by shader
    rotationSpeed: 0.004,
    tilt: 0.03,
    atmosphere: {  // Added atmosphere for sci-fi effect
      color: '#FF00FF',
      opacity: 0.2,
      size: 1.1
    }
  },
  { 
    name: 'Venus', 
    color: '#00FF00', // Greenish Venus
    size: 0.6, 
    orbitRadius: 7, 
    orbitSpeed: 0.007,
    textureMap: './textures/venus.jpg',
    rotationSpeed: -0.002,
    tilt: 3.1,
    atmosphere: {
      color: '#7FFF00', // Enhanced atmosphere
      opacity: 0.6,
      size: 1.2
    },
    hasRings: true, // Added rings for sci-fi effect
    rings: {
      innerRadius: 1.2,
      outerRadius: 1.8,
      color: '#ADFF2F',
      opacity: 0.5
    }
  },
  { 
    name: 'Earth', 
    color: '#00FFFF', 
    size: 0.7, 
    orbitRadius: 10, 
    orbitSpeed: 0.005,
    textureMap: './textures/earth.jpg',
    rotationSpeed: 0.01,
    tilt: 0.41,
    atmosphere: {
      color: '#00FFFF', // Brighter blue atmosphere
      opacity: 0.4,
      size: 1.15
    },
    moons: [
      {
        name: 'Moon',
        size: 0.2,
        orbitRadius: 1.2,
        orbitSpeed: 0.03,
        textureMap: './textures/moon.jpg',
        rotationSpeed: 0.01,
        emissive: true, // Glowing moon
        emissiveIntensity: 0.5,
        color: '#FFFFFF'
      },
      {
        // Added a second moon for Earth in sci-fi mode
        name: 'Phobos',
        size: 0.15,
        orbitRadius: 1.6,
        orbitSpeed: 0.04,
        textureMap: './textures/moon.jpg',
        rotationSpeed: 0.015,
        emissive: true,
        emissiveIntensity: 0.3,
        color: '#FF9900'
      }
    ],
    hasRings: true, // Added rings for sci-fi Earth
    rings: {
      innerRadius: 1.3,
      outerRadius: 1.7,
      color: '#87CEFA',
      opacity: 0.4
    }
  },
  { 
    name: 'Mars', 
    color: '#FF0000', // Intense red
    size: 0.5, 
    orbitRadius: 13, 
    orbitSpeed: 0.004,
    textureMap: './textures/mars.jpg',
    rotationSpeed: 0.009,
    tilt: 0.44,
    atmosphere: {
      color: '#FF4500', // Orange-red atmosphere
      opacity: 0.3,
      size: 1.1
    },
    pulsating: true // Pulsating Mars
  },
  { 
    name: 'Jupiter', 
    color: '#E0A951', 
    size: 1.2, 
    orbitRadius: 18, 
    orbitSpeed: 0.002,
    textureMap: './textures/jupiter.jpg',
    rotationSpeed: 0.02,
    tilt: 0.05,
    hasRings: true,
    rings: {
      innerRadius: 1.3,
      outerRadius: 2.2, // Extended ring
      color: '#FF6347', // Red-tinted rings
      opacity: 0.7,
      animated: true // Animated rings
    },
    atmosphere: {
      color: '#FFA500', // Orange atmosphere
      opacity: 0.5,
      size: 1.08
    },
    alienStructure: true // Has orbiting alien structure
  },
  { 
    name: 'Saturn', 
    color: '#EAD6B8', 
    size: 1.0, 
    orbitRadius: 23, 
    orbitSpeed: 0.0015,
    textureMap: './textures/saturn.jpg',
    rotationSpeed: 0.018,
    tilt: 0.47,
    hasRings: true,
    rings: {
      innerRadius: 1.2,
      outerRadius: 2.8, // Bigger rings
      color: '#9932CC', // Purple rings
      opacity: 0.9,
      animated: true // Animated rings
    },
    alienStructure: true // Has orbiting alien structure
  },
  { 
    name: 'Uranus', 
    color: '#00FFBF', // Teal instead of pale blue
    size: 0.8, 
    orbitRadius: 28, 
    orbitSpeed: 0.001,
    textureMap: './textures/uranus.jpg',
    rotationSpeed: 0.012,
    tilt: 1.71,
    hasRings: true,
    rings: {
      innerRadius: 1.2,
      outerRadius: 2.0,
      color: '#00FA9A', // Glowing mint rings
      opacity: 0.7,
      animated: true // Animated rings
    },
    atmosphere: {
      color: '#48D1CC', // Turquoise atmosphere
      opacity: 0.4,
      size: 1.12
    }
  },
  { 
    name: 'Neptune', 
    color: '#0000FF', // Vibrant blue
    size: 0.8, 
    orbitRadius: 32, 
    orbitSpeed: 0.0008,
    textureMap: './textures/neptune.jpg',
    rotationSpeed: 0.014,
    tilt: 0.49,
    hasRings: true,
    rings: {
      innerRadius: 1.2,
      outerRadius: 1.9,
      color: '#1E90FF', // Dodger blue rings
      opacity: 0.6,
      animated: true // Animated rings
    },
    atmosphere: {
      color: '#0000CD', // Medium blue atmosphere
      opacity: 0.5,
      size: 1.15
    }
  },
];
