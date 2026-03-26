import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

export function CosmosBackground() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Yavaşça yıldızları döndür
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.05;
    }
  });

  return (
    <>
      <color attach="background" args={['#0A0A0B']} />
      <fogExp2 attach="fog" args={['#0A0A0B', 0.005]} />
      
      <group ref={groupRef}>
        <Stars 
          radius={50} 
          depth={50} 
          count={5000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        {/* Altın sarısı/Sıcak renkli Ambient Dust (ikinci katman) */}
        <Stars 
          radius={40} 
          depth={40} 
          count={1000} 
          factor={2} 
          saturation={1} 
          fade 
          speed={0.5} 
        />
      </group>
      
      {/* Hafif Ortam Işığı */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} color="#E8D48B" />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#8c9bd2" />
    </>
  );
}
