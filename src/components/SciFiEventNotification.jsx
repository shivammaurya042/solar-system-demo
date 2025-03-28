import React, { useState, useEffect, createContext, useContext } from 'react';

// Create context to share event data with other components
export const SciFiEventContext = createContext({
  activeEvent: null,
  triggerEvent: () => {}
});

// Event notifications that can appear during sci-fi mode
const SciFiEventNotification = ({ isSciFiMode, children }) => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  
  // List of possible event notifications with detailed implementations
  const possibleEvents = [
    // { 
    //   id: 'europa_signal',
    //   text: "Alien signal detected from Europa", 
    //   duration: 10000,
    //   planetTarget: "Europa",
    //   effect: {
    //     type: 'signal',
    //     color: '#00FFFF',
    //     pulseRate: 0.8,
    //     signalStrength: 2.5,
    //     particleCount: 200
    //   },
    //   cameraFocus: true
    // },
    // { 
    //   id: 'saturn_wormhole',
    //   text: "Wormhole opened near Saturn", 
    //   duration: 15000,
    //   planetTarget: "Saturn",
    //   effect: {
    //     type: 'wormhole',
    //     size: 2.5,
    //     color: '#9932CC',
    //     particleCount: 300,
    //     distanceFromPlanet: 8
    //   },
    //   cameraFocus: true
    // },
    // { 
    //   id: 'jupiter_fluctuations',
    //   text: "Quantum fluctuations detected in Jupiter's atmosphere", 
    //   duration: 12000,
    //   planetTarget: "Jupiter",
    //   effect: {
    //     type: 'quantum',
    //     particleCount: 500,
    //     color: '#AAFFFF',
    //     speed: 1.2,
    //     spread: 3.5
    //   },
    //   cameraFocus: true
    // },
    // { 
    //   id: 'mars_spacecraft',
    //   text: "Unknown spacecraft approaching Mars", 
    //   duration: 18000,
    //   planetTarget: "Mars",
    //   effect: {
    //     type: 'spacecraft',
    //     size: 1.2,
    //     speed: 0.5,
    //     emissiveColor: '#FF5500',
    //     lightIntensity: 2,
    //     orbitPath: true
    //   },
    //   cameraFocus: true
    // },
    { 
      id: 'mars_curiosity_mission',
      text: "Curiosity rover mission launching from Earth to Mars", 
      duration: 30000, // Longer duration to see the full mission
      planetTarget: "Mars",
      effect: {
        type: 'marsMission',
        size: 0.9, // Size of the spacecraft
        missionDuration: 30, // Duration in seconds for a complete mission cycle
        emissiveColor: '#FF6600', // Thruster color
        showTrajectory: true
      },
      description: "Simulating the 2011 Mars Science Laboratory mission that sent the Curiosity rover to Mars using a Hohmann transfer orbit",
      cameraFocus: false // Don't focus the camera automatically, since we want to see the whole trajectory
    },
    { 
      id: 'mercury_anomaly',
      text: "Temporal anomaly detected near Mercury", 
      duration: 14000,
      planetTarget: "Mercury",
      effect: {
        type: 'temporal',
        radius: 3,
        distortion: 0.8,
        timeReversal: true,
        colorShift: '#FF00FF',
        particleCount: 150
      },
      cameraFocus: true
    },
    // { 
    //   id: 'venus_surge',
    //   text: "Energy surge detected on Venus", 
    //   duration: 11000,
    //   planetTarget: "Venus",
    //   effect: {
    //     type: 'energySurge',
    //     intensity: 3,
    //     pulseFrequency: 1.5,
    //     expansionRate: 0.6,
    //     color: '#FFAA00',
    //     lightningCount: 8
    //   },
    //   cameraFocus: true
    // },
    // { 
    //   id: 'neptune_darkmatter',
    //   text: "Dark matter concentration forming near Neptune", 
    //   duration: 16000,
    //   planetTarget: "Neptune",
    //   effect: {
    //     type: 'darkMatter',
    //     radius: 5,
    //     density: 0.7,
    //     gravitationalEffect: true,
    //     color: '#330066',
    //     distortionStrength: 2
    //   },
    //   cameraFocus: true
    // },
    // { 
    //   id: 'pluto_binary',
    //   text: "Binary star system detected beyond Pluto", 
    //   duration: 20000,
    //   planetTarget: "Pluto",
    //   effect: {
    //     type: 'binaryStar',
    //     starSize: [1.5, 1.2],
    //     distance: 25,
    //     colors: ['#FFBB22', '#22AAFF'],
    //     pulseRate: [0.5, 0.7],
    //     orbitSpeed: 0.2
    //   },
    //   cameraFocus: true
    // },
    // { 
    //   id: 'earth_transmission',
    //   text: "Subspace transmission intercepted near Earth", 
    //   duration: 13000,
    //   planetTarget: "Earth",
    //   effect: {
    //     type: 'transmission',
    //     color: '#00FF00',
    //     beamWidth: 0.5,
    //     beamLength: 15,
    //     pulseFrequency: 1.2,
    //     messageParticles: true
    //   },
    //   cameraFocus: true
    // },
    // { 
    //   id: 'unknown_gravity',
    //   text: "Gravitational waves detected from unknown source", 
    //   duration: 17000,
    //   planetTarget: null,
    //   effect: {
    //     type: 'gravitationalWaves',
    //     intensity: 2,
    //     waveCount: 5,
    //     radius: 40,
    //     speed: 0.8,
    //     distortionEffect: true,
    //     color: '#AAAAFF'
    //   },
    //   cameraFocus: false
    // }
  ];
  
  // Randomly trigger events when in sci-fi mode
  useEffect(() => {
    let eventInterval;
    
    if (isSciFiMode) {
      // Trigger first event after a short delay when entering sci-fi mode
      const initialDelay = setTimeout(() => {
        // Prioritize the Mars mission as the first event when entering sci-fi mode
        const marsEvent = possibleEvents.find(event => event.id === 'mars_curiosity_mission');
        if (marsEvent) {
          triggerEvent(marsEvent);
        } else {
          triggerRandomEvent();
        }
      }, 3000);
      
      // Then set up recurring random events
      eventInterval = setInterval(() => {
        // Only 30% chance of triggering on each interval
        // if (Math.random() < 0.3) {
        //   triggerRandomEvent();
        // }
        triggerRandomEvent();
      }, 30000); // Check every 30 seconds
      
      return () => {
        clearTimeout(initialDelay);
        clearInterval(eventInterval);
      };
    }
    
    // Clear any active notification when exiting sci-fi mode
    setNotification(null);
    setVisible(false);
    setActiveEvent(null);
    
    return () => {
      if (eventInterval) clearInterval(eventInterval);
    };
  }, [isSciFiMode]);
  
  // Handle notification lifecycle
  useEffect(() => {
    let timeout;
    
    if (notification) {
      setVisible(true);
      setActiveEvent(notification);
      
      // Auto-hide notification after its duration
      timeout = setTimeout(() => {
        setVisible(false);
        
        // Clear notification after fade-out animation
        setTimeout(() => {
          setNotification(null);
        }, 500);
        
        // Keep the active effect for a bit longer after the notification disappears
        setTimeout(() => {
          setActiveEvent(null);
        }, 3000);
      }, notification.duration);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [notification]);
  
  // Trigger a random event notification
  const triggerRandomEvent = () => {
    // Don't trigger new event if one is already active
    if (activeEvent) return;
    
    // Prioritize mars_curiosity_mission with 80% chance, otherwise choose random event
    const marsMission = possibleEvents.find(e => e.id === 'mars_curiosity_mission');
    
    // Use the Mars mission with 80% probability, or a random event with 20% probability
    const randomEvent = Math.random() < 0.8 && marsMission ? 
      marsMission : 
      possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      
    console.log("Triggering sci-fi event:", randomEvent);
    setNotification(randomEvent);
  };
  
  // Trigger a specific event by ID
  const triggerSpecificEvent = (eventId) => {
    // Don't trigger new event if one is already active
    if (activeEvent) return;
    
    const event = possibleEvents.find(e => e.id === eventId);
    if (event) {
      setNotification(event);
    }
  };
  
  // Notification style with animation
  const notificationStyle = {
    position: 'absolute',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(10, 10, 40, 0.8)',
    color: '#00FFFF',
    padding: '15px 25px',
    borderRadius: '5px',
    boxShadow: '0 0 15px #00FFFF',
    zIndex: 1000,
    fontFamily: 'monospace',
    fontSize: '18px',
    letterSpacing: '1px',
    border: '1px solid #00FFFF',
    transition: 'opacity 0.5s, transform 0.5s',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-20px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    maxWidth: '80%'
  };
  
  // "NEW" indicator blink animation
  const indicatorStyle = {
    display: 'inline-block',
    color: '#FF00FF',
    marginRight: '10px',
    animation: 'blink 1s infinite',
    fontWeight: 'bold'
  };
  
  // Provide the context value for other components to consume
  const contextValue = {
    activeEvent,
    triggerEvent: triggerSpecificEvent
  };
  
  return (
    <SciFiEventContext.Provider value={contextValue}>
      {notification && (
        <div style={notificationStyle}>
          <span style={indicatorStyle}>[NEW]</span> {notification.text}
          <style>{`
            @keyframes blink {
              0% { opacity: 0.2; }
              50% { opacity: 1; }
              100% { opacity: 0.2; }
            }
          `}</style>
        </div>
      )}
      {children}
    </SciFiEventContext.Provider>
  );
};

export default SciFiEventNotification;
