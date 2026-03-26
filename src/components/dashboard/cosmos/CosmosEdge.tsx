import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Connection } from '@/types';

interface CosmosEdgeProps {
  connection: Connection;
  startPos: [number, number, number];
  endPos: [number, number, number];
  isActive: boolean;
  isFaded: boolean;
}

// Renk haritası (Dostluk, Düşmanlık, Nötr)
const RELATION_COLORS = {
  friend: '#4db89c',
  enemy: '#e85050',
  neutral: '#8888bb',
};

export function CosmosEdge({ connection, startPos, endPos, isActive, isFaded }: CosmosEdgeProps) {
  // Line için noktaları oluştur (düz çizgi)
  const points = useMemo(() => {
    return [
      new THREE.Vector3(...startPos),
      new THREE.Vector3(...endPos),
    ];
  }, [startPos, endPos]);

  // Eğri yapmak isterseniz QuadraticBezierLine kullanılabilir, ancak düz line Cosmos map'in orjinal hissine uyuyor.

  const color = RELATION_COLORS[connection.relation] || '#8888bb';
  const baseOpacity = isFaded ? 0.05 : 0.25;
  const highlightOpacity = 0.7;

  return (
    <group>
      <Line
        points={points}
        color={isActive ? '#E8D48B' : color}
        lineWidth={isActive ? 2 : 1}
        transparent
        opacity={isActive ? highlightOpacity : baseOpacity}
      />
    </group>
  );
}
