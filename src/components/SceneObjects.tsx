import * as THREE from "three";
import { useMemo } from "react";

export default function SceneObjects() {
  const tableMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#5c4033", roughness: 0.6 }), []);
  const metalMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#888", roughness: 0.3, metalness: 0.7 }), []);
  const redMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#dc2626", roughness: 0.4 }), []);
  const screenMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.2, metalness: 0.5 }), []);
  const screenGlow = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3b82f6", emissive: "#3b82f6", emissiveIntensity: 0.5, roughness: 0.1 }), []);

  return (
    <group>
      {/* Table */}
      <group position={[3, 0, 0]}>
        <mesh position={[0, 0.4, 0]} material={tableMat} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.06, 0.7]} />
        </mesh>
        {[[-0.5, 0, -0.28], [0.5, 0, -0.28], [-0.5, 0, 0.28], [0.5, 0, 0.28]].map((pos, i) => (
          <mesh key={i} position={[pos[0], 0.2, pos[2]]} material={metalMat}>
            <cylinderGeometry args={[0.025, 0.025, 0.38, 8]} />
          </mesh>
        ))}
      </group>

      {/* Fire extinguisher */}
      <group position={[4, 0, -2]}>
        <mesh position={[0, 0.35, 0]} material={redMat} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6, 12]} />
        </mesh>
        <mesh position={[0, 0.68, 0]} material={metalMat}>
          <cylinderGeometry args={[0.04, 0.08, 0.08, 8]} />
        </mesh>
        <mesh position={[0.06, 0.72, 0]} material={metalMat}>
          <boxGeometry args={[0.1, 0.03, 0.03]} />
        </mesh>
      </group>

      {/* Screen / monitor */}
      <group position={[-3, 0, -2]}>
        {/* Stand */}
        <mesh position={[0, 0.5, 0]} material={metalMat}>
          <cylinderGeometry args={[0.03, 0.04, 1, 8]} />
        </mesh>
        <mesh position={[0, 0.02, 0]} material={metalMat}>
          <cylinderGeometry args={[0.2, 0.2, 0.03, 16]} />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 1.2, 0]} material={screenMat} castShadow>
          <boxGeometry args={[1.2, 0.7, 0.05]} />
        </mesh>
        <mesh position={[0, 1.2, 0.03]} material={screenGlow}>
          <planeGeometry args={[1.1, 0.6]} />
        </mesh>
      </group>
    </group>
  );
}
