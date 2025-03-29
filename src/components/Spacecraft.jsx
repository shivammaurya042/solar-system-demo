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

  // Solar system boundary - distance from center
  const SOLAR_SYSTEM_BOUNDARY = 100;
  // Maximum velocity cap to prevent runaway acceleration
  const MAX_VELOCITY = 0.1;
  // Steering responsiveness factor (higher = more responsive)
  const STEERING_RESPONSIVENESS = 0.25; // Increased from 0.1
  // Rotation responsiveness for spacecraft turning
  const ROTATION_RESPONSIVENESS = 0.15; // Increased from 0.05

  // Initialize position when component mounts
  useEffect(() => {
    if (spacecraftRef.current) {
      // Set initial position
      spacecraftRef.current.position.set(position[0], position[1], position[2]);

      // Position camera behind spacecraft initially with slightly offset
      const initialCameraPos = new THREE.Vector3(
        position[0],
        position[1] + 1, // Slight upward offset for better initial view
        position[2] - 5 // Start closer to the spacecraft for smoother transition
      );
      camera.position.copy(initialCameraPos);
      camera.lookAt(position[0], position[1], position[2]);

      // Gradually move camera to the proper position
      setTimeout(() => {
        setInitComplete(true);
      }, 100);
    }
  }, [position, camera]);

  // Create a timer to end spacecraft mode after 40 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onEnd) onEnd();
    }, 40000);

    // Set up keyboard controls (reversed direction)
    const handleKeyDown = (e) => {
      const speed = 0.01; // Reduced for smoother acceleration
      // Calculate steering intensity based on current velocity
      // More steering power at higher speeds for better responsiveness
      const forwardSpeed = Math.abs(velocityRef.current.z);
      const steeringIntensity = 0.02 + (forwardSpeed * 0.7); // Increased base steering and scaling factor

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          targetVelocityRef.current.y += speed;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          targetVelocityRef.current.y -= speed;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          // Apply steering force instead of direct velocity change
          steeringForceRef.current.x = steeringIntensity; // Reversed: left generates positive X steering
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          // Apply steering force instead of direct velocity change
          steeringForceRef.current.x = -steeringIntensity; // Reversed: right generates negative X steering
          break;
        case ' ': // Space to slow down
          targetVelocityRef.current.multiplyScalar(0.8);
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
          // Almost immediate return to neutral (minimal decay)
          steeringForceRef.current.x = 0;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Add a small initial forward velocity after a short delay for better control
    const forwardTimer = setTimeout(() => {
      targetVelocityRef.current.z = 0.15; // Start moving forward gently
    }, 1000);

    // Clean up on unmount
    return () => {
      clearTimeout(timer);
      clearTimeout(forwardTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onEnd]);

  // Update spacecraft position and camera on each frame
  useFrame((state, delta) => {
    if (spacecraftRef.current) {
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
        // Gradually increase resistance near edge
        boundaryFactor = Math.max(0.2, 1 - (boundaryProximity - 0.8) * 5);

        // Apply forced velocity toward center if at extreme boundary
        if (boundaryProximity > 0.95) {
          // Calculate direction vector toward center
          const toCenter = new THREE.Vector3(0, 0, 0).sub(
            new THREE.Vector3(
              spacecraftRef.current.position.x,
              spacecraftRef.current.position.y,
              spacecraftRef.current.position.z
            )
          ).normalize().multiplyScalar(0.02 * (boundaryProximity - 0.95) * 20);

          // Add center-directed velocity
          velocityRef.current.add(toCenter);
        }
      }

      // Apply steering to heading direction
      // Steering is more effective at higher speeds
      const forwardSpeed = Math.abs(velocityRef.current.z);
      const steeringStrength = STEERING_RESPONSIVENESS + (forwardSpeed * 0.9); // More steering effect at higher speeds
      
      // Create a rotation matrix based on steering input
      const steeringMatrix = new THREE.Matrix4().makeRotationY(steeringForceRef.current.x * steeringStrength);
      
      // Apply rotation to the heading vector
      headingRef.current.applyMatrix4(steeringMatrix);
      headingRef.current.normalize(); // Keep as unit vector
      
      // Minimal steering decay for more responsive controls
      steeringForceRef.current.multiplyScalar(0.5); // Reduced from 0.9 for less decay/more responsiveness

      // More responsive velocity changes with boundary factor
      const acceleration = 0.08 * boundaryFactor; // Increased from 0.03 for faster response
      
      // Apply forward thrust in the heading direction
      const targetForwardVelocity = headingRef.current.clone().multiplyScalar(targetVelocityRef.current.z);
      
      // Keep vertical control separate (up/down movement)
      const targetVerticalVelocity = new THREE.Vector3(0, targetVelocityRef.current.y, 0);
      
      // Calculate combined target velocity
      const combinedTargetVelocity = targetForwardVelocity.add(targetVerticalVelocity);
      
      // Smoothly transition current velocity toward target (faster lerp)
      velocityRef.current.lerp(combinedTargetVelocity, acceleration);

      // Apply maximum velocity cap
      if (velocityRef.current.length() > MAX_VELOCITY) {
        velocityRef.current.normalize().multiplyScalar(MAX_VELOCITY);
      }

      // Apply velocity to update position
      spacecraftRef.current.position.x += velocityRef.current.x;
      spacecraftRef.current.position.y += velocityRef.current.y;
      spacecraftRef.current.position.z += velocityRef.current.z;

      // Smoothly rotate spacecraft to face direction of travel
      if (velocityRef.current.lengthSq() > 0.00001) {
        // Use heading for rotation instead of velocity
        const lookAt = new THREE.Vector3(
          spacecraftRef.current.position.x + headingRef.current.x,
          spacecraftRef.current.position.y + headingRef.current.y,
          spacecraftRef.current.position.z + headingRef.current.z
        );

        // Create a temporary object to calculate the target rotation
        const tempObj = new THREE.Object3D();
        tempObj.position.copy(spacecraftRef.current.position);
        tempObj.lookAt(lookAt);
        tempObj.updateMatrix();

        targetRotationRef.current.setFromRotationMatrix(tempObj.matrix);

        // Faster rotation response for more immediate direction changes
        spacecraftRef.current.quaternion.slerp(targetRotationRef.current, ROTATION_RESPONSIVENESS);
      }

      // Position camera behind spacecraft (chase camera) with smooth transitions
      const targetCameraOffset = new THREE.Vector3(0, 5, -15);
      const rotatedOffset = targetCameraOffset.clone().applyQuaternion(spacecraftRef.current.quaternion);

      const targetCameraPos = new THREE.Vector3(
        spacecraftRef.current.position.x + rotatedOffset.x,
        spacecraftRef.current.position.y + rotatedOffset.y,
        spacecraftRef.current.position.z + rotatedOffset.z
      );

      // Smooth camera movement
      const cameraLerp = initComplete ? 0.05 : 0.02; // Slower at start, faster after init
      camera.position.lerp(targetCameraPos, cameraLerp);

      // Smoothly look at spacecraft
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

      // Add subtle oscillation for more natural feeling
      if (initComplete) {
        spacecraftRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.003;
        spacecraftRef.current.rotation.z += Math.sin(state.clock.elapsedTime * 1.5) * 0.001;
      }
    }
  });

  return (
    <group ref={spacecraftRef}>
      {/* Main body */}
      <mesh>
        <cylinderGeometry args={[0.5, 1, 3, 8]} />
        <meshStandardMaterial color="#8A9BA8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cockpit (now in front) */}
      <mesh position={[0, 0, 1.2]}>
        <sphereGeometry args={[0.6, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#4FC3F7"
          emissive="#4FC3F7"
          emissiveIntensity={atBoundary ? 1.5 : 0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Wings */}
      <mesh position={[0, 0, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.2, 4, 1]} />
        <meshStandardMaterial color="#455A64" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Engine glow (now at back) */}
      <pointLight position={[0, 0, -2]} color="#4FC3F7" intensity={2} distance={5} />
      <mesh position={[0, 0, -1.7]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#4FC3F7" transparent opacity={0.8} />
      </mesh>

      {/* Side engine glows (now at back) */}
      <pointLight position={[1, 0, -1]} color="#4FC3F7" intensity={1} distance={3} />
      <pointLight position={[-1, 0, -1]} color="#4FC3F7" intensity={1} distance={3} />
      <mesh position={[1, 0, -1]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#4FC3F7" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-1, 0, -1]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#4FC3F7" transparent opacity={0.6} />
      </mesh>

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
    </group>
  );
};

export default Spacecraft;
