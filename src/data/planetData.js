// Enhanced planet data
export const planets = [
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
