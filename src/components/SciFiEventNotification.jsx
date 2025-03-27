import React, { useState, useEffect } from 'react';

// Event notifications that can appear during sci-fi mode
const SciFiEventNotification = ({ isSciFiMode }) => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  
  // List of possible event notifications
  const possibleEvents = [
    { text: "Alien signal detected from Europa", duration: 5000 },
    { text: "Wormhole opened near Saturn", duration: 5000 },
    { text: "Quantum fluctuations detected in Jupiter's atmosphere", duration: 5000 },
    { text: "Unknown spacecraft approaching Mars", duration: 5000 },
    { text: "Temporal anomaly detected near Mercury", duration: 5000 },
    { text: "Energy surge detected on Venus", duration: 5000 },
    { text: "Dark matter concentration forming near Neptune", duration: 5000 },
    { text: "Binary star system detected beyond Pluto", duration: 5000 },
    { text: "Subspace transmission intercepted near Earth", duration: 5000 },
    { text: "Gravitational waves detected from unknown source", duration: 5000 }
  ];
  
  // Randomly trigger events when in sci-fi mode
  useEffect(() => {
    let eventInterval;
    
    if (isSciFiMode) {
      // Trigger first event after a short delay when entering sci-fi mode
      const initialDelay = setTimeout(() => {
        triggerRandomEvent();
      }, 3000);
      
      // Then set up recurring random events
      eventInterval = setInterval(() => {
        // Only 30% chance of triggering on each interval
        if (Math.random() < 0.3) {
          triggerRandomEvent();
        }
      }, 15000); // Check every 15 seconds
      
      return () => {
        clearTimeout(initialDelay);
        clearInterval(eventInterval);
      };
    }
    
    // Clear any active notification when exiting sci-fi mode
    setNotification(null);
    setVisible(false);
    
    return () => {
      if (eventInterval) clearInterval(eventInterval);
    };
  }, [isSciFiMode]);
  
  // Handle notification lifecycle
  useEffect(() => {
    let timeout;
    
    if (notification) {
      setVisible(true);
      
      // Auto-hide notification after its duration
      timeout = setTimeout(() => {
        setVisible(false);
        
        // Clear notification after fade-out animation
        setTimeout(() => {
          setNotification(null);
        }, 500);
      }, notification.duration);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [notification]);
  
  // Trigger a random event notification
  const triggerRandomEvent = () => {
    const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    setNotification(randomEvent);
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
  
  // Only render if there's an active notification
  if (!notification) return null;
  
  return (
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
  );
};

export default SciFiEventNotification;
