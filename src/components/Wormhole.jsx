import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import WormholeSpacecraft from './WormholeSpacecraft';
import WormholeTunnel from './WormholeTunnel';

const Wormhole = ({ position, size = 1.5 }) => {
  const groupRef = useRef();
  const portalRef = useRef();
  const particlesRef = useRef();
  const cameraRef = useRef();
  const exitWormholeRef = useRef();
  
  const [hovered, setHovered] = useState(false);
  const [activated, setActivated] = useState(false);
  const [journeyActive, setJourneyActive] = useState(false);
  const [returnActive, setReturnActive] = useState(false);
  const [originalCameraPosition] = useState(new THREE.Vector3());
  const [originalCameraTarget] = useState(new THREE.Vector3());
  
  const { camera, scene } = useThree();
  
  // Create exit wormhole position (return destination)
  const exitPosition = useMemo(() => {
    // Create a position that's in a different part of the solar system
    // but not too far from original position
    const exitPos = new THREE.Vector3(
      position[0] + (Math.random() - 0.5) * 40,
      position[1] + (Math.random() - 0.5) * 10,
      position[2] + (Math.random() - 0.5) * 40
    );
    return exitPos;
  }, [position]);
  
  // Set up the exit wormhole when component mounts
  useEffect(() => {
    if (!exitWormholeRef.current) {
      // Create the exit wormhole as a simple object - we'll only show it briefly
      const exitPortal = new THREE.Mesh(
        new THREE.TorusGeometry(size * 0.8, size * 0.2, 16, 50),
        new THREE.MeshStandardMaterial({
          color: "#9932CC",
          emissive: "#9932CC",
          emissiveIntensity: 2,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0
        })
      );
      
      exitPortal.position.copy(exitPosition);
      exitWormholeRef.current = exitPortal;
      scene.add(exitPortal);
    }
    
    // Cleanup function
    return () => {
      if (exitWormholeRef.current) {
        scene.remove(exitWormholeRef.current);
      }
    };
  }, [scene, exitPosition, size]);
  
  // Create particle system for the wormhole
  const particles = useMemo(() => {
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleSize = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Create spiral pattern
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * size;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * size * 0.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Colors: purples, blues, and cyans for sci-fi effect
      colors[i * 3] = 0.5 + Math.random() * 0.5; // R
      colors[i * 3 + 1] = Math.random() * 0.5; // G
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2; // B
      
      particleSize[i] = Math.random() * 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(particleSize, 1));
    
    return geometry;
  }, [size]);
  
  // Animation effect
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.getElapsedTime();
      
      // Rotate the entire wormhole
      groupRef.current.rotation.z = time * 0.2;
      
      // Rotate the inner portal differently
      if (portalRef.current) {
        portalRef.current.rotation.z = -time * 0.4;
        portalRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
        
        // Pulse effect
        const pulse = Math.sin(time * 2) * 0.1 + 1;
        portalRef.current.scale.set(pulse, pulse, pulse);
      }
      
      // Animate particles
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
          const idx = i / 3;
          const angle = time * 0.5 + idx * 0.01;
          const radius = Math.sin(time * 0.1 + idx * 0.05) * size * 0.3 + size * 0.7;
          
          positions[i] += Math.sin(angle) * 0.01;
          positions[i + 2] += Math.cos(angle) * 0.01;
          
          // Pull particles toward center if activated
          if (activated) {
            const dx = positions[i];
            const dy = positions[i + 1];
            const dz = positions[i + 2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            positions[i] -= (dx / dist) * 0.05;
            positions[i + 1] -= (dy / dist) * 0.05;
            positions[i + 2] -= (dz / dist) * 0.05;
          }
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
      
      // Wormhole journey camera animation
      if (journeyActive && cameraRef.current) {
        // Move the camera and spacecraft through the tunnel
        cameraRef.current.position.z -= 0.1;
        
        // Add some subtle motion to make it feel dynamic
        cameraRef.current.position.x += Math.sin(time * 5) * 0.01;
        cameraRef.current.position.y += Math.cos(time * 7) * 0.01;
      }
      
      // Handle the exit wormhole animation
      if (returnActive && exitWormholeRef.current) {
        // Make the exit wormhole appear
        exitWormholeRef.current.material.opacity = Math.min(1, exitWormholeRef.current.material.opacity + 0.05);
        exitWormholeRef.current.rotation.z += 0.1;
      }
    }
  });
  
  // Handle portal click - trigger spacecraft journey
  const handleClick = () => {
    if (!activated) {
      setActivated(true);
      
      // Store original camera position and target
      originalCameraPosition.copy(camera.position);
      originalCameraTarget.set(0, 0, 0); // Assuming the center is the target
      
      // Start the wormhole journey after a short delay
      setTimeout(() => {
        setJourneyActive(true);
        
        // Create a new camera rig that will contain everything for the journey
        const cameraRig = new THREE.Group();
        
        // Position the camera rig at the wormhole entrance
        cameraRig.position.set(position[0], position[1], position[2]);
        
        // Create a camera target node (where the camera will look)
        const cameraTarget = new THREE.Object3D();
        cameraTarget.position.set(0, 0, -10); // Target point is ahead in the tunnel
        cameraRig.add(cameraTarget);
        
        // Move the main camera into our rig, positioned behind where spacecraft will be
        camera.position.set(0, 0.5, 3); // Position camera appropriately
        camera.lookAt(cameraTarget.position);
        cameraRig.add(camera);
        
        // Add the rig to the scene and store the reference
        scene.add(cameraRig);
        cameraRef.current = cameraRig;
        
        // Start the return journey after 10 seconds
        setTimeout(() => {
          setReturnActive(true);
          
          // Complete the journey after 1 second of seeing the exit wormhole
          setTimeout(() => {
            // Restore original camera position with animation
            const duration = 1000; // ms
            const startTime = Date.now();
            const startPos = camera.position.clone();
            
            // Remove camera from rig to animate it back
            cameraRig.remove(camera);
            scene.add(camera);
            
            // Add a smooth transition back
            const animateReturn = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // Use easing function for smooth animation
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              
              // Interpolate camera position
              camera.position.lerpVectors(
                startPos,
                originalCameraPosition,
                easeProgress
              );
              
              if (progress < 1) {
                requestAnimationFrame(animateReturn);
              } else {
                // Cleanup and reset
                if (cameraRef.current) {
                  scene.remove(cameraRef.current);
                }
                
                // Make exit wormhole disappear
                if (exitWormholeRef.current) {
                  exitWormholeRef.current.material.opacity = 0;
                }
                
                // Reset state
                setActivated(false);
                setJourneyActive(false);
                setReturnActive(false);
              }
            };
            
            animateReturn();
          }, 1000);
        }, 9000);
      }, 1000);
    }
  };
  
  return (
    <>
      <group 
        ref={groupRef} 
        position={position}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Inner glowing portal */}
        <mesh ref={portalRef}>
          <torusGeometry args={[size * 0.8, size * 0.2, 16, 50]} />
          <meshStandardMaterial 
            color={hovered ? "#FF00FF" : "#9932CC"} 
            emissive={hovered ? "#FF00FF" : "#9932CC"}
            emissiveIntensity={hovered ? 2 : 1}
            side={THREE.DoubleSide}
            transparent={true}
            opacity={0.8}
          />
        </mesh>
        
        {/* Particle system */}
        <points ref={particlesRef}>
          <primitive object={particles} attach="geometry" />
          <pointsMaterial 
            size={hovered ? 2 : 1.5} 
            vertexColors={true} 
            transparent={true}
            opacity={0.8}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        
        {/* Glow effect */}
        <mesh>
          <sphereGeometry args={[size * 1.2, 16, 16]} />
          <meshBasicMaterial 
            color="#9932CC"
            transparent={true}
            opacity={0.15}
          />
        </mesh>
      </group>
      
      {/* Wormhole journey elements - only visible during journey */}
      {journeyActive && cameraRef.current && (
        <>
          {/* Attach tunnel to the camera rig to ensure it stays around the camera */}
          <primitive object={cameraRef.current}>
            {/* Wormhole tunnel effect positioned to surround the camera */}
            <WormholeTunnel 
              active={journeyActive} 
              distortionIntensity={returnActive ? 2 : 1} 
            />
            
            {/* Spacecraft model - positioned in front of the camera */}
            <WormholeSpacecraft 
              position={[0, -0.3, -2]} // Positioned directly in front of camera
              rotation={[0, Math.PI, 0]} // Facing forward in the tunnel
              active={true}
              scale={0.3}
            />
          </primitive>
        </>
      )}
    </>
  );
};

export default Wormhole;
