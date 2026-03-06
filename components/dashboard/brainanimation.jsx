import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function BrainParticles({ count }) {
  const pointsRef = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const x = (1 + Math.random()) * factor * Math.cos(t);
      const y = (1 + Math.random()) * factor * Math.sin(t);
      const z = (Math.random() - 0.5) * 100;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += delta / 20;
    }
  });

  return (
    <Points ref={pointsRef} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#0d9488"
        size={0.5}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function BrainAnimation() {
  return (
    <div className="absolute inset-0 z-0 opacity-30">
      <Canvas camera={{ position: [0, 0, 200] }}>
        <BrainParticles count={5000} />
      </Canvas>
    </div>
  );
}