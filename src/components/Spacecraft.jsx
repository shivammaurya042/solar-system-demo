import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Spacecraft = ({ position, setActive, onEnd }) => {
  const spacecraftRef = useRef();
  const targetVelocityRef = useRef(new THREE.Vector3(0, 0, 0)); // Target velocity starts at zero
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0)); // Current velocity (starts at 0)
  const targetRotationRef = useRef(new THREE.Quaternion()); // Target rotation
  const steeringForceRef = useRef(new THREE.Vector3(0, 0, 0)); // Steering force vector
  const headingRef = useRef(new THREE.Vector3(0, 0, 1)); // Forward direction
  const { camera } = useThree();
  const [initComplete, setInitComplete] = useState(false);
  const [atBoundary, setAtBoundary] = useState(false);
  const [flameIntensity, setFlameIntensity] = useState(1);
  const [lightningVisible, setLightningVisible] = useState(false);
  
  // Touch control refs
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchActiveRef = useRef(false);
  const lastTouchMoveRef = useRef({ x: 0, y: 0 });
  const isMobileRef = useRef(false);

  // Overall spacecraft scale (reduced to make it smaller relative to planets)
  const SPACECRAFT_SCALE = 0.35; // Reduced from implicit 1.0

  // Solar system boundary - distance from center
  const SOLAR_SYSTEM_BOUNDARY = 100;
  // Maximum velocity cap to prevent runaway acceleration
  const MAX_VELOCITY = 0.06; // Reduced from 0.1 for slower movement
  // Steering responsiveness factor (higher = more responsive)
  const STEERING_RESPONSIVENESS = 0.25; // Increased from 0.25 for more instant response
  // Rotation responsiveness for spacecraft turning
  const ROTATION_RESPONSIVENESS = 0.35; // Increased from 0.15 for instant visual feedback

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      isMobileRef.current = isMobile;
    };
    
    checkMobile();
  }, []);

  // Initialize position when component mounts
  useEffect(() => {
    if (spacecraftRef.current) {
      // Set initial position
      spacecraftRef.current.position.set(position[0], position[1], position[2]);
      
      // Apply scale to make spacecraft smaller
      spacecraftRef.current.scale.set(SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE);

      // Position camera behind spacecraft initially with slightly offset
      // Adjusted camera positioning for better viewing distance
      const initialCameraPos = new THREE.Vector3(
        position[0],
        position[1] + 1.5, // Increased height for better viewing angle
        position[2] - 6    // Moved further back for wider view
      );
      camera.position.copy(initialCameraPos);
      camera.lookAt(position[0], position[1], position[2]);

      // Gradually move camera to the proper position
      setTimeout(() => {
        setInitComplete(true);
      }, 100);
      
      // Setup random lightning effects for rock vibes
      const lightningInterval = setInterval(() => {
        setLightningVisible(true);
        setTimeout(() => setLightningVisible(false), 150);
      }, 2000 + Math.random() * 3000);
      
      return () => clearInterval(lightningInterval);
    }
  }, [position, camera]);

  // Create a timer to end spacecraft mode after 40 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onEnd) onEnd();
    }, 40000);

    // Set up keyboard controls (reversed direction)
    const handleKeyDown = (e) => {
      const speed = 0.005; // Reduced from 0.01 for slower acceleration
      // Calculate steering intensity based on current velocity
      // More steering power at higher speeds for better responsiveness
      const forwardSpeed = Math.abs(velocityRef.current.z);
      const steeringIntensity = 0.05 + (forwardSpeed * 1.2); // Increased base steering and scaling factor

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          targetVelocityRef.current.y += speed;
          // Boost flames when accelerating up
          setFlameIntensity(prev => Math.min(prev + 0.5, 3));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          targetVelocityRef.current.y -= speed;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          // Apply immediate steering force - no ramp-up
          steeringForceRef.current.x = steeringIntensity; // Reversed: left generates positive X steering
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          // Apply immediate steering force - no ramp-up
          steeringForceRef.current.x = -steeringIntensity; // Reversed: right generates negative X steering
          break;
        case ' ': // Space to slow down
          targetVelocityRef.current.multiplyScalar(0.8);
          // Reduce flames when braking
          setFlameIntensity(prev => Math.max(prev - 0.5, 1));
          break;
      }
    };

    // Clear steering force when key is released
    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'ArrowRight':
        case 'd':
        case 'D':
          // Immediately zero out steering force - no decay
          steeringForceRef.current.x = 0;
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          // Gradually reduce flame effect
          setTimeout(() => setFlameIntensity(prev => Math.max(prev - 0.5, 1)), 300);
          break;
      }
    };

    // Touch controls for mobile
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        lastTouchMoveRef.current = { x: touch.clientX, y: touch.clientY };
        touchActiveRef.current = true;
        
        // Start with a small forward velocity
        if (targetVelocityRef.current.z < 0.05) {
          targetVelocityRef.current.z = 0.05;
        }
      }
    };
    
    const handleTouchMove = (e) => {
      if (touchActiveRef.current && e.touches.length === 1) {
        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        
        // Calculate the swipe distance
        const deltaX = currentX - lastTouchMoveRef.current.x;
        const deltaY = currentY - lastTouchMoveRef.current.y;
        
        // Update the last touch position
        lastTouchMoveRef.current = { x: currentX, y: currentY };
        
        const forwardSpeed = Math.abs(velocityRef.current.z);
        const steeringIntensity = 0.15 + (forwardSpeed * 1.5);
        
        // Horizontal swipe controls steering - more sensitive
        if (Math.abs(deltaX) > 1) {
          const normalizedDeltaX = deltaX / window.innerWidth * 15;
          steeringForceRef.current.x = -normalizedDeltaX * steeringIntensity;
        }
        
        // Vertical swipe controls up/down movement - more sensitive
        if (Math.abs(deltaY) > 1) {
          const verticalSpeed = 0.015;
          targetVelocityRef.current.y = -deltaY * verticalSpeed;
          
          if (deltaY < -3) { 
            setFlameIntensity(prev => Math.min(prev + 0.3, 3)); 
          } else if (deltaY > 3) { 
            setFlameIntensity(prev => Math.max(prev - 0.2, 1)); 
          }
        } else {
          targetVelocityRef.current.y *= 0.85; 
        }
        
        targetVelocityRef.current.z = 0.1; 
      }
    };
    
    const handleTouchEnd = () => {
      touchActiveRef.current = false;
      steeringForceRef.current.x = 0;
      targetVelocityRef.current.y = 0;
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // Add a small initial forward velocity after a short delay for better control
    const forwardTimer = setTimeout(() => {
      targetVelocityRef.current.z = 0.08; 
    }, 1000);

    // Clean up on unmount
    return () => {
      clearTimeout(timer);
      clearTimeout(forwardTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onEnd]);

  // Update spacecraft position and camera on each frame
  useFrame((state, delta) => {
    if (spacecraftRef.current) {
      // Pulsing flame effect based on time
      const flamePulse = 0.8 + Math.sin(state.clock.elapsedTime * 12) * 0.2;
      
      // Check distance from center of solar system
      const distanceFromCenter = new THREE.Vector3(
        spacecraftRef.current.position.x,
        spacecraftRef.current.position.y,
        spacecraftRef.current.position.z
      ).length();

      // Determine if approaching boundary
      const boundaryProximity = distanceFromCenter / SOLAR_SYSTEM_BOUNDARY;
      const isNearBoundary = boundaryProximity > 0.8;

      // Update boundary state for visual indicator
      setAtBoundary(isNearBoundary);

      // Apply increasing resistance as spacecraft approaches boundary
      let boundaryFactor = 1;
      if (isNearBoundary) {
        boundaryFactor = Math.max(0.2, 1 - (boundaryProximity - 0.8) * 5);

        // Apply forced velocity toward center if at extreme boundary
        if (boundaryProximity > 0.95) {
          const toCenter = new THREE.Vector3(0, 0, 0).sub(
            new THREE.Vector3(
              spacecraftRef.current.position.x,
              spacecraftRef.current.position.y,
              spacecraftRef.current.position.z
            )
          ).normalize().multiplyScalar(0.02 * (boundaryProximity - 0.95) * 20);

          velocityRef.current.add(toCenter);
        }
      }

      // Apply steering to heading direction
      const forwardSpeed = Math.abs(velocityRef.current.z);
      const steeringStrength = STEERING_RESPONSIVENESS + (forwardSpeed * 1.5); 
      
      const steeringMatrix = new THREE.Matrix4().makeRotationY(steeringForceRef.current.x * steeringStrength);
      
      headingRef.current.applyMatrix4(steeringMatrix);
      headingRef.current.normalize(); // Keep as unit vector
      
      const acceleration = 0.04 * boundaryFactor; 
      
      const targetForwardVelocity = headingRef.current.clone().multiplyScalar(targetVelocityRef.current.z);
      
      const targetVerticalVelocity = new THREE.Vector3(0, targetVelocityRef.current.y, 0);
      
      const combinedTargetVelocity = targetForwardVelocity.add(targetVerticalVelocity);
      
      velocityRef.current.lerp(combinedTargetVelocity, acceleration);

      if (velocityRef.current.length() > MAX_VELOCITY) {
        velocityRef.current.normalize().multiplyScalar(MAX_VELOCITY);
      }

      spacecraftRef.current.position.x += velocityRef.current.x;
      spacecraftRef.current.position.y += velocityRef.current.y;
      spacecraftRef.current.position.z += velocityRef.current.z;

      if (velocityRef.current.lengthSq() > 0.00001) {
        const lookAt = new THREE.Vector3(
          spacecraftRef.current.position.x + headingRef.current.x,
          spacecraftRef.current.position.y + headingRef.current.y,
          spacecraftRef.current.position.z + headingRef.current.z
        );

        const tempObj = new THREE.Object3D();
        tempObj.position.copy(spacecraftRef.current.position);
        tempObj.lookAt(lookAt);
        tempObj.updateMatrix();

        targetRotationRef.current.setFromRotationMatrix(tempObj.matrix);

        spacecraftRef.current.quaternion.copy(targetRotationRef.current);
      }

      const targetCameraOffset = new THREE.Vector3(0, 3.5 * SPACECRAFT_SCALE, -12 * SPACECRAFT_SCALE);
      const rotatedOffset = targetCameraOffset.clone().applyQuaternion(spacecraftRef.current.quaternion);

      const targetCameraPos = new THREE.Vector3(
        spacecraftRef.current.position.x + rotatedOffset.x,
        spacecraftRef.current.position.y + rotatedOffset.y,
        spacecraftRef.current.position.z + rotatedOffset.z
      );

      const cameraLerp = initComplete ? 0.05 : 0.02; 
      camera.position.lerp(targetCameraPos, cameraLerp);

      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);

      const targetLookAt = new THREE.Vector3()
        .subVectors(spacecraftRef.current.position, camera.position)
        .normalize();

      const lookAtLerp = 0.1;
      targetLookAt.lerp(currentLookAt, 1 - lookAtLerp);
      targetLookAt.normalize();

      camera.lookAt(
        camera.position.x + targetLookAt.x,
        camera.position.y + targetLookAt.y,
        camera.position.z + targetLookAt.z
      );

      if (initComplete) {
        spacecraftRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.003;
        spacecraftRef.current.rotation.z += Math.sin(state.clock.elapsedTime * 3) * 0.002;
      }
    }
  });
  
  return (
    <group ref={spacecraftRef}>
      {/* Main body - Hot rod style */}
      <mesh position={[0, 0, 0]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <capsuleGeometry args={[0.8, 2.5, 8, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* V8 Engine block on top */}
      <mesh position={[0, 0.5, 0.2]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <boxGeometry args={[1.4, 0.4, 1.2]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
      </mesh>
      
      {/* Exhaust pipes - left side */}
      <mesh position={[-0.6, 0.1, -0.5]} rotation={[0, 0, Math.PI / 10]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <cylinderGeometry args={[0.1, 0.15, 1.2, 8]} />
        <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Exhaust pipes - right side */}
      <mesh position={[0.6, 0.1, -0.5]} rotation={[0, 0, -Math.PI / 10]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <cylinderGeometry args={[0.1, 0.15, 1.2, 8]} />
        <meshStandardMaterial color="#555555" metalness={0.9} roughness={0.3} />
      </mesh>
      
      {/* Flames from left exhaust (pulsing) */}
      <mesh position={[-0.6, 0.1, -1.2]} rotation={[0, 0, Math.PI / 10]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <coneGeometry args={[0.2, 1 * flameIntensity, 8]} />
        <meshBasicMaterial color="#FF4500" transparent opacity={0.8} />
      </mesh>
      
      {/* Flames from right exhaust (pulsing) */}
      <mesh position={[0.6, 0.1, -1.2]} rotation={[0, 0, -Math.PI / 10]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <coneGeometry args={[0.2, 1 * flameIntensity, 8]} />
        <meshBasicMaterial color="#FF4500" transparent opacity={0.8} />
      </mesh>
      
      {/* Additional flame effect */}
      <pointLight position={[-0.6, 0.1, -1.2]} color="#FF4500" intensity={2 * flameIntensity} distance={3} />
      <pointLight position={[0.6, 0.1, -1.2]} color="#FF4500" intensity={2 * flameIntensity} distance={3} />
      
      {/* Cockpit windshield */}
      <mesh position={[0, 0.4, 1]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <sphereGeometry args={[0.7, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4FC3F7" emissive="#4FC3F7" emissiveIntensity={atBoundary ? 1.5 : 0.5} transparent opacity={0.9} />
      </mesh>
      
      {/* Guitar-shaped wings */}
      <mesh position={[0, 0, -0.2]} rotation={[0, 0, Math.PI / 2]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <boxGeometry args={[0.15, 4, 0.8]} />
        <meshStandardMaterial color="#B71C1C" metalness={0.5} roughness={0.4} />
      </mesh>
      
      {/* Lightning bolt decorations (left) */}
      <mesh position={[-0.7, 0, 0.5]} rotation={[0, Math.PI/3, 0]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 3, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={lightningVisible ? 2 : 0.5} />
      </mesh>
      
      {/* Lightning bolt decorations (right) */}
      <mesh position={[0.7, 0, 0.5]} rotation={[0, -Math.PI/3, 0]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 3, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={lightningVisible ? 2 : 0.5} />
      </mesh>
      
      {/* Smoke particles from exhausts */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            (i % 2 === 0 ? -0.6 : 0.6) + Math.sin(i * 0.5) * 0.2,
            0.1 + Math.sin(i * 0.3) * 0.1,
            -1.2 - i * 0.2
          ]}
          scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}
        >
          <sphereGeometry args={[0.08 + Math.random() * 0.05, 8, 8]} />
          <meshBasicMaterial color="#444" transparent opacity={0.3 - (i * 0.05)} />
        </mesh>
      ))}
      
      {/* Engine glow */}
      <pointLight position={[0, 0, -1.5]} color="#ff3700" intensity={3 * flameIntensity} distance={6} />
      
      {/* Stage lights effect (left) */}
      <pointLight position={[-1.5, 1, 0]} color="#ff00ff" intensity={1.5} distance={4} />
      
      {/* Stage lights effect (right) */}
      <pointLight position={[1.5, 1, 0]} color="#00ffff" intensity={1.5} distance={4} />
      
      {/* Boundary warning indicator */}
      {atBoundary && (
        <group>
          <pointLight position={[0, 0, 0]} color="red" intensity={5} distance={3} />
          <mesh>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="red" transparent opacity={0.7} />
          </mesh>
        </group>
      )}
      
      {/* ACDC logo on the hood */}
      <mesh position={[0, 0.5, 0.8]} rotation={[Math.PI/2.5, 0, 0]} scale={[SPACECRAFT_SCALE, SPACECRAFT_SCALE, SPACECRAFT_SCALE]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

export default Spacecraft;
