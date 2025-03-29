import React from 'react';

// AboutUs component with SciFi styling
const AboutUs = ({ isOpen, onClose, isSciFiMode }) => {
  if (!isOpen) return null;

  // Common SciFi UI styling
  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9999,
  };

  const contentStyle = {
    backgroundColor: 'rgba(0, 20, 40, 0.95)',
    color: '#00FFFF',
    fontFamily: 'monospace',
    borderRadius: '10px',
    padding: '25px',
    maxWidth: '500px',
    width: '80%',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '1px solid #00FFFF',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
    position: 'relative'
  };

  const titleStyle = {
    color: '#FF00FF',
    marginTop: 0,
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
    textShadow: '0 0 8px rgba(255, 0, 255, 0.6)',
    fontSize: '1.5rem'
  };

  const sectionTitleStyle = {
    color: '#00FFFF',
    marginTop: '20px',
    marginBottom: '10px',
    fontWeight: 'bold',
    textShadow: '0 0 5px rgba(0, 255, 255, 0.4)',
    fontSize: '1.2rem'
  };

  const paragraphStyle = {
    marginBottom: '15px',
    lineHeight: '1.5',
    color: '#FFFFFF',
    fontSize: '0.9rem'
  };

  const highlightStyle = {
    color: '#FF00FF',
    fontWeight: 'bold'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    color: '#FF00FF',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '5px',
    outline: 'none'
  };

  const techIconStyle = {
    display: 'inline-block',
    padding: '5px 10px',
    margin: '5px',
    backgroundColor: 'rgba(0, 40, 80, 0.6)',
    borderRadius: '15px',
    border: '1px solid #00FFFF',
    fontSize: '0.8rem',
    color: '#FFFFFF'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>×</button>
        <h2 style={titleStyle}>GALACTIC EXPLORER</h2>
        
        <p style={paragraphStyle}>
          Welcome to <span style={highlightStyle}>Solar System Explorer</span> project! 
          <br/>
          <br/>
          This aim of this project is to demonstrate the capabilities of AI coding assistance.
          Everything you see here was built by instructing an LLM.
          <br/>
          <br/>
          I used Windsurf IDE for coding along with Claude 3.7 to complete the project.
          <br/>
          <br/>
          It took around 10 hours from start to finish. The result? An immersive 3D experience right in your browser.
        </p>

        <h3 style={sectionTitleStyle}>TECH STACK</h3>
        <p style={paragraphStyle}>
          This project is built using:
        </p>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={techIconStyle}>React</span>
          <span style={techIconStyle}>Three.js</span>
          <span style={techIconStyle}>React Three Fiber</span>
          <span style={techIconStyle}>React Three Drei</span>
        </div>

        <h3 style={sectionTitleStyle}>FEATURES</h3>
        <p style={paragraphStyle}>
          • Scientific mode with accurate planetary orbits<br/>
          • Sci-Fi mode with wormholes and spacecraft travel<br/>
          • Adjustable simulation speed<br/>
          • Realistic planet textures and atmospheres<br/>
          • Mars mission simulation with Hohmann transfer orbit<br/>
          • Interesting space event in sci-fi mode<br/>
          
        </p>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          borderTop: '1px solid rgba(0, 255, 255, 0.3)',
          paddingTop: '15px',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          &copy; 2025 | Solar System Explorer<br />
          Created by <span style={{ color: '#FF00FF', fontWeight: 'bold' }}>Shivam Maurya</span><br />
          <a href="mailto:shivammaurya042@gmail.com" style={{ color: '#00FFFF', textDecoration: 'none', transition: 'color 0.2s ease' }}>
            shivammaurya042@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
