import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { AnimationAction } from "@/lib/commandParser";

interface Avatar3DProps {
  currentAction: AnimationAction | null;
  actionIndex: number;
}

const SKIN = "#e8beac";
const SHIRT = "#2563eb";
const PANTS = "#1e293b";
const SHOE = "#0f172a";
const HAIR = "#3b2712";

export default function Avatar3D({ currentAction, actionIndex }: Avatar3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const timeRef = useRef(0);
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));

  // Body part refs for animation
  const headRef = useRef<THREE.Group>(null!);
  const torsoRef = useRef<THREE.Group>(null!);
  const leftArmRef = useRef<THREE.Group>(null!);
  const rightArmRef = useRef<THREE.Group>(null!);
  const leftLegRef = useRef<THREE.Group>(null!);
  const rightLegRef = useRef<THREE.Group>(null!);

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6 }), []);
  const shirtMat = useMemo(() => new THREE.MeshStandardMaterial({ color: SHIRT, roughness: 0.5 }), []);
  const pantsMat = useMemo(() => new THREE.MeshStandardMaterial({ color: PANTS, roughness: 0.5 }), []);
  const shoeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: SHOE, roughness: 0.3 }), []);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: HAIR, roughness: 0.8 }), []);
  const eyeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1a2e", roughness: 0.2 }), []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    const anim = currentAction?.animation || "idle";

    if (!groupRef.current) return;

    // Movement toward target
    if (currentAction?.target) {
      targetRef.current.set(
        currentAction.target.x * 0.3,
        0,
        currentAction.target.z * 0.3
      );
    }

    if (anim === "walk") {
      posRef.current.lerp(targetRef.current, delta * 0.8);
      groupRef.current.position.copy(posRef.current);

      // Walking animation
      const walkCycle = Math.sin(t * 6);
      if (leftLegRef.current) leftLegRef.current.rotation.x = walkCycle * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -walkCycle * 0.5;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -walkCycle * 0.3;
      if (rightArmRef.current) rightArmRef.current.rotation.x = walkCycle * 0.3;
      // Slight bob
      groupRef.current.position.y = Math.abs(Math.sin(t * 6)) * 0.05;

      // Face direction
      if (currentAction?.target) {
        const dir = new THREE.Vector3(
          targetRef.current.x - posRef.current.x,
          0,
          targetRef.current.z - posRef.current.z
        );
        if (dir.length() > 0.05) {
          const angle = Math.atan2(dir.x, dir.z);
          groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            angle,
            delta * 3
          );
        }
      }
    } else if (anim === "wave") {
      // Reset legs
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5);
      // Wave right arm
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -2.5;
        rightArmRef.current.rotation.z = Math.sin(t * 8) * 0.3 - 0.3;
      }
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 5);
    } else if (anim === "point") {
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5);
      // Point with right arm
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -1.5, delta * 4);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.3, delta * 4);
      }
      // Turn toward target
      if (currentAction?.target) {
        const angle = Math.atan2(currentAction.target.x, currentAction.target.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle * 0.3, delta * 2);
      }
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 5);
    } else if (anim === "jump") {
      const jumpPhase = (t * 3) % (Math.PI * 2);
      groupRef.current.position.y = Math.max(0, Math.sin(jumpPhase) * 0.6);
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.max(0, Math.sin(jumpPhase)) * 1.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -Math.max(0, Math.sin(jumpPhase)) * 1.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(jumpPhase) * 0.3;
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(jumpPhase) * 0.3;
    } else if (anim === "dance") {
      const d = t * 4;
      groupRef.current.position.y = Math.abs(Math.sin(d)) * 0.15;
      groupRef.current.rotation.y += delta * 1.5;
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -1.5 + Math.sin(d) * 0.5;
        leftArmRef.current.rotation.z = Math.sin(d * 0.5) * 0.5;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.5 + Math.cos(d) * 0.5;
        rightArmRef.current.rotation.z = -Math.sin(d * 0.5) * 0.5;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(d) * 0.3;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(d) * 0.3;
    } else if (anim === "bow") {
      if (torsoRef.current) {
        torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, 0.7, delta * 2);
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.3, delta * 3);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.3, delta * 3);
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 5);
    } else if (anim === "clap") {
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -1.3;
        leftArmRef.current.rotation.z = Math.sin(t * 10) > 0 ? 0.3 : 0.8;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.3;
        rightArmRef.current.rotation.z = Math.sin(t * 10) > 0 ? -0.3 : -0.8;
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 5);
    } else if (anim === "think") {
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.2, delta * 3);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.3, delta * 3);
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 3);
      if (headRef.current) headRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 5);
    } else if (anim === "safety") {
      // Safety stance: feet apart, arms out
      if (leftLegRef.current) leftLegRef.current.rotation.z = THREE.MathUtils.lerp(leftLegRef.current.rotation.z || 0, 0.15, delta * 3);
      if (rightLegRef.current) rightLegRef.current.rotation.z = THREE.MathUtils.lerp(rightLegRef.current.rotation.z || 0, -0.15, delta * 3);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.8, delta * 3);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z || 0, 0.5, delta * 3);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.8, delta * 3);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z || 0, -0.5, delta * 3);
      }
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.1, delta * 3);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0.1, delta * 3);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.1, delta * 3);
    } else if (anim === "sit") {
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, -1.5, delta * 3);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -1.5, delta * 3);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.3, delta * 3);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.3, delta * 3);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.4, delta * 3);
    } else if (anim === "turn") {
      if (currentAction?.target) {
        const angle = Math.atan2(currentAction.target.x, currentAction.target.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, angle * 0.3, delta * 3);
      }
      // Reset pose
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 5);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 5);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, delta * 5);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, delta * 5);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, delta * 5);
    } else {
      // Idle - gentle breathing + sway
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, Math.sin(t * 1.5) * 0.02, delta * 3);
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, Math.sin(t * 1.2) * 0.03, delta * 3);
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z || 0, 0, delta * 3);
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, Math.sin(t * 1.2 + 0.5) * 0.03, delta * 3);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z || 0, 0, delta * 3);
      }
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, delta * 3);
        leftLegRef.current.rotation.z = THREE.MathUtils.lerp(leftLegRef.current.rotation.z || 0, 0, delta * 3);
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, delta * 3);
        rightLegRef.current.rotation.z = THREE.MathUtils.lerp(rightLegRef.current.rotation.z || 0, 0, delta * 3);
      }
      if (torsoRef.current) {
        torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, 0, delta * 3);
      }
      if (headRef.current) {
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z || 0, 0, delta * 3);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={torsoRef}>
        {/* Torso */}
        <mesh position={[0, 1.15, 0]} material={shirtMat} castShadow>
          <boxGeometry args={[0.55, 0.65, 0.3]} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.55, 0]} material={skinMat}>
          <cylinderGeometry args={[0.07, 0.08, 0.12, 12]} />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 1.78, 0]}>
          <mesh material={skinMat} castShadow>
            <sphereGeometry args={[0.2, 24, 24]} />
          </mesh>
          {/* Hair */}
          <mesh position={[0, 0.08, -0.02]} material={hairMat}>
            <sphereGeometry args={[0.21, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          </mesh>
          {/* Eyes */}
          <mesh position={[-0.07, 0.02, 0.17]} material={eyeMat}>
            <sphereGeometry args={[0.03, 12, 12]} />
          </mesh>
          <mesh position={[0.07, 0.02, 0.17]} material={eyeMat}>
            <sphereGeometry args={[0.03, 12, 12]} />
          </mesh>
          {/* Nose */}
          <mesh position={[0, -0.03, 0.19]} material={skinMat}>
            <sphereGeometry args={[0.025, 8, 8]} />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[0.38, 1.35, 0]}>
          {/* Upper arm */}
          <mesh position={[0, -0.17, 0]} material={shirtMat} castShadow>
            <boxGeometry args={[0.14, 0.35, 0.14]} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.47, 0]} material={skinMat} castShadow>
            <boxGeometry args={[0.12, 0.3, 0.12]} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.65, 0]} material={skinMat}>
            <sphereGeometry args={[0.06, 10, 10]} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[-0.38, 1.35, 0]}>
          <mesh position={[0, -0.17, 0]} material={shirtMat} castShadow>
            <boxGeometry args={[0.14, 0.35, 0.14]} />
          </mesh>
          <mesh position={[0, -0.47, 0]} material={skinMat} castShadow>
            <boxGeometry args={[0.12, 0.3, 0.12]} />
          </mesh>
          <mesh position={[0, -0.65, 0]} material={skinMat}>
            <sphereGeometry args={[0.06, 10, 10]} />
          </mesh>
        </group>
      </group>

      {/* Hips */}
      <mesh position={[0, 0.75, 0]} material={pantsMat} castShadow>
        <boxGeometry args={[0.5, 0.15, 0.28]} />
      </mesh>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[0.13, 0.65, 0]}>
        <mesh position={[0, -0.22, 0]} material={pantsMat} castShadow>
          <boxGeometry args={[0.16, 0.4, 0.16]} />
        </mesh>
        <mesh position={[0, -0.55, 0]} material={pantsMat} castShadow>
          <boxGeometry args={[0.14, 0.3, 0.14]} />
        </mesh>
        <mesh position={[0, -0.73, 0.03]} material={shoeMat} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.22]} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[-0.13, 0.65, 0]}>
        <mesh position={[0, -0.22, 0]} material={pantsMat} castShadow>
          <boxGeometry args={[0.16, 0.4, 0.16]} />
        </mesh>
        <mesh position={[0, -0.55, 0]} material={pantsMat} castShadow>
          <boxGeometry args={[0.14, 0.3, 0.14]} />
        </mesh>
        <mesh position={[0, -0.73, 0.03]} material={shoeMat} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.22]} />
        </mesh>
      </group>
    </group>
  );
}
