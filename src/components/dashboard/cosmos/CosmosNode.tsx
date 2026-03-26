import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Entity } from '@/types';

interface CosmosNodeProps {
  entity: Entity;
  position: [number, number, number];
  isActive: boolean;
  isFaded: boolean;
  onClick: () => void;
  onHover: (isHovered: boolean) => void;
}

// Renk haritası (Karakter, Mekan, Olay)
const COLOR_MAP = {
  character: '#6699ee',
  place: '#44bbaa',
  event: '#dd9988',
};

// Radyus haritası
const RADIUS_MAP = {
  character: 1.1,
  place: 1.5,
  event: 0.9,
};

export function CosmosNode({ entity, position, isActive, isFaded, onClick, onHover }: CosmosNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animasyon state için
  const timeOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      // Yüzen yavaş animasyon
      const time = state.clock.getElapsedTime();
      groupRef.current.position.y = position[1] + Math.sin(time * 0.8 + timeOffset.current) * 1.5;
    }
    
    if (ringRef.current) {
      // Halka kameraya bakmalı
      ringRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  const baseColor = COLOR_MAP[entity.type] || '#ffffff';
  const radius = RADIUS_MAP[entity.type] || 1;
  const opacity = isFaded ? 0.2 : 0.85;
  const ringOpacity = isFaded ? 0.05 : 0.4;
  
  // Hover veya Active durumunda vurgu
  const highlight = isActive || hovered;

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); onHover(false); document.body.style.cursor = 'default'; }}
    >
      {/* Node Küresi */}
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial 
          color={highlight ? '#ffffff' : baseColor} 
          transparent 
          opacity={highlight ? 1 : opacity} 
        />
      </mesh>

      {/* Etrafındaki Halka */}
      <mesh ref={ringRef as any}>
        <ringGeometry args={[radius * 1.4, radius * 1.7, 32]} />
        <meshBasicMaterial 
          color={highlight ? '#E8D48B' : baseColor} 
          transparent 
          opacity={highlight ? 0.8 : ringOpacity} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Sabit Label */}
      {!isFaded && (
        <Html 
          center 
          distanceFactor={100} 
          position={[0, -radius * 2, 0]}
          zIndexRange={[100, 0]}
        >
          <div className="pointer-events-none select-none transition-all duration-300"
               style={{
                 fontFamily: '"Cinzel", serif',
                 fontSize: '12px',
                 letterSpacing: '0.15em',
                 color: highlight ? '#E8D48B' : 'rgba(200,200,220,0.5)',
                 textShadow: highlight ? '0 0 15px rgba(212,175,55,0.8)' : '0 0 10px rgba(0,0,0,0.8)',
                 whiteSpace: 'nowrap',
               }}>
            {entity.name}
          </div>
        </Html>
      )}
    </group>
  );
}
