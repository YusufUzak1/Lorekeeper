import { useState, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

import { useUniverseStore } from '@/store/useUniverseStore';
import { CosmosBackground } from './CosmosBackground';
import { CosmosNode } from './CosmosNode';
import { CosmosEdge } from './CosmosEdge';
import { CosmosUI } from './CosmosUI';

export function CosmosCanvas() {
  const { entities, connections } = useUniverseStore();
  
  // UI State
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interaction State
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // OrbitControls Ref
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Pozisyonları Sabit Tutmak İçin (Her render'da değişmemesi için)
  const nodePositions = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};
    const total = entities.length;
    
    entities.forEach((entity, i) => {
      // Orijinal legacy HTML'deki yerleşim algoritmasının benzeri:
      const ang = (i / total) * Math.PI * 2;
      const rad = 25 + Math.sin(i * 1.3) * 15;
      
      // Seed kullanarak her render'da aynı random değeri almak en iyisi olurdu,
      // ama useMemo ile component unmount olana kadar stabil kalacak.
      const x = Math.cos(ang) * rad + (Math.sin(i * 3.1) - 0.5) * 20;
      const y = Math.sin(ang * 1.6) * 20 + (Math.cos(i * 2.5) - 0.5) * 15;
      const z = Math.cos(ang * 0.7) * 20 + (Math.sin(i * 1.8) - 0.5) * 15;
      
      positions[entity.id] = [x, y, z];
    });
    return positions;
  }, [entities]);

  // Filtreleme Kararları
  const isNodeVisible = (entity: any) => {
    if (activeFilter !== 'all' && entity.type !== activeFilter) return false;
    if (searchQuery.trim() !== '') {
      if (!entity.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    return true;
  };

  const isNodeFaded = (entity: any) => {
    if (hoveredNodeId === null) return false;
    if (hoveredNodeId === entity.id) return false;
    
    // Eğer node, hovered olan node ile bir bağlantıya sahipse, fade etme
    const hasConnection = connections.some(c => 
      (c.sourceId === hoveredNodeId && c.targetId === entity.id) ||
      (c.targetId === hoveredNodeId && c.sourceId === entity.id)
    );
    
    return !hasConnection;
  };

  const isEdgeFaded = (conn: any) => {
    if (hoveredNodeId === null) return false;
    return conn.sourceId !== hoveredNodeId && conn.targetId !== hoveredNodeId;
  };

  // Zoom Kontrolleri
  const handleZoom = (delta: number) => {
    if (controlsRef.current) {
      const currentCamera = controlsRef.current.object as THREE.PerspectiveCamera;
      const offset = currentCamera.position.clone().normalize().multiplyScalar(delta);
      const newPos = currentCamera.position.clone().add(offset);
      
      // Çok yakına veya uzağa gitmeyi önle
      if (newPos.length() > 20 && newPos.length() < 300) {
        currentCamera.position.copy(newPos);
        controlsRef.current.update();
      }
    }
  };

  return (
    <div className="w-full h-full relative bg-mythos-bg overflow-hidden flex flex-col">
      <CosmosUI 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onZoomIn={() => handleZoom(-20)}
        onZoomOut={() => handleZoom(20)}
        onResetZoom={() => {
          if (controlsRef.current) {
            controlsRef.current.reset();
            const cam = controlsRef.current.object as THREE.PerspectiveCamera;
            cam.position.set(0, 0, 120);
            cam.lookAt(0,0,0);
            controlsRef.current.update();
          }
        }}
      />
      
      <div className="flex-1 w-full relative">
        <Canvas camera={{ position: [0, 0, 120], fov: 55, near: 0.1, far: 2000 }}>
          <CosmosBackground />
          <OrbitControls 
            ref={controlsRef}
            enableDamping 
            dampingFactor={0.05} 
            maxDistance={250} 
            minDistance={40} 
          />

          {/* Bağlantılar (Edges) */}
          {connections.map((conn) => {
            const sourceVisible = isNodeVisible(entities.find(e => e.id === conn.sourceId));
            const targetVisible = isNodeVisible(entities.find(e => e.id === conn.targetId));
            
            // İki ucu da görünmüyorsa çizgiyi çizme
            if (!sourceVisible || !targetVisible) return null;

            return (
              <CosmosEdge 
                key={conn.id} 
                connection={conn}
                startPos={nodePositions[conn.sourceId]}
                endPos={nodePositions[conn.targetId]}
                isActive={hoveredNodeId === conn.sourceId || hoveredNodeId === conn.targetId}
                isFaded={isEdgeFaded(conn)}
              />
            );
          })}

          {/* Düğümler (Nodes) */}
          {entities.map((entity) => {
            if (!isNodeVisible(entity)) return null;

            return (
              <CosmosNode 
                key={entity.id} 
                entity={entity} 
                position={nodePositions[entity.id]}
                isActive={hoveredNodeId === entity.id}
                isFaded={isNodeFaded(entity)}
                onClick={() => console.log('Node clicked:', entity.id)}
                onHover={(isHovered) => setHoveredNodeId(isHovered ? entity.id : null)}
              />
            );
          })}
        </Canvas>
      </div>
    </div>
  );
}
