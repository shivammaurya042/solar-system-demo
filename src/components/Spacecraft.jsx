import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const Spacecraft = ({ position, setActive, onEnd }) => {
  const spacecraftRef = useRef();
  const targetVelocityRef = useRef(new THREE.Vector3(0, 0, 0.1)); // Target velocity
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0)); // Current velocity (starts at 0)
  const targetRotationRef = useRef(new THREE.Quaternion()); // Target rotation
  const { camera } = useThree();
  const [initComplete, setInitComplete] = useState(false);
  
  // Initialize position when component mounts
  useEffect(() => {
    if (spacecraftRef.current) {
      // Set initial position
      spacecraftRef.current.position.set(position[0], position[1], position[2]);
      
      // Position camera behind spacecraft initially with slightly offset
      const initialCameraPos = new THREE.Vector3(
        position[0], 
        position[1] + 1, // Slight upward offset for better initial view
        position[2] - 5  // Start closer to the spacecraft for smoother transition
      );
      camera.position.copy(initialCameraPos);
      camera.lookAt(position[0], position[1], position[2]);
      
      // Gradually move camera to the proper position
      setTimeout(() => {
        setInitComplete(true);
      }, 100);
    }
  }, [position, camera]);
  
  // Create a timer to end spacecraft mode after 20 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onEnd) onEnd();
    }, 20000);
    
    // Set up keyboard controls (reversed direction)
    const handleKeyDown = (e) => {
      const speed = 0.01; // Reduced for smoother acceleration
      
      switch (e.key) {
        case 'ArrowUp':
          targetVelocityRef.current.y += speed;
          break;
        case 'ArrowDown':
          targetVelocityRef.current.y -= speed;
          break;
        case 'ArrowLeft':
          targetVelocityRef.current.x += speed;
          break;
        case 'ArrowRight':
          targetVelocityRef.current.x -= speed;
          break;
        case ' ': // Space to slow down
          targetVelocityRef.current.multiplyScalar(0.8);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up on unmount
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEnd]);
  
  // Update spacecraft position and camera on each frame
  useFrame((state, delta) => {
    if (spacecraftRef.current) {
      // Smooth velocity changes (acceleration/deceleration)
      const acceleration = 0.05;
      velocityRef.current.x += (targetVelocityRef.current.x - velocityRef.current.x) * acceleration;
      velocityRef.current.y += (targetVelocityRef.current.y - velocityRef.current.y) * acceleration;
      velocityRef.current.z += (targetVelocityRef.current.z - velocityRef.current.z) * acceleration;
      
      // Apply velocity to update position
      spacecraftRef.current.position.x += velocityRef.current.x;
      spacecraftRef.current.position.y += velocityRef.current.y;
      spacecraftRef.current.position.z += velocityRef.current.z;
      
      // Smoothly rotate spacecraft to face direction of travel
      if (velocityRef.current.lengthSq() > 0.00001) {
        const direction = velocityRef.current.clone().normalize();
        const lookAt = new THREE.Vector3(
          spacecraftRef.current.position.x + direction.x,
          spacecraftRef.current.position.y + direction.y,
          spacecraftRef.current.position.z + direction.z
        );
        
        // Create a temporary object to calculate the target rotation
        const tempObj = new THREE.Object3D();
        tempObj.position.copy(spacecraftRef.current.position);
        tempObj.lookAt(lookAt);
        tempObj.updateMatrix();
        
        targetRotationRef.current.setFromRotationMatrix(tempObj.matrix);
        
        // Slerp (spherical linear interpolation) between current and target rotations
        spacecraftRef.current.quaternion.slerp(targetRotationRef.current, 0.05);
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
        <meshStandardMaterial color="#4FC3F7" emissive="#4FC3F7" emissiveIntensity={0.5} transparent opacity={0.9} />
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
    </group>
  );
};

export default Spacecraft;
