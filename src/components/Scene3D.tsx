import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid, ContactShadows } from "@react-three/drei";
import Avatar3D from "./Avatar3D";
import SceneObjects from "./SceneObjects";
import type { AnimationAction } from "@/lib/commandParser";

interface Scene3DProps {
  currentAction: AnimationAction | null;
  actionIndex: number;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-3, 4, -2]} intensity={0.5} color="#60a5fa" />
      <pointLight position={[3, 3, 2]} intensity={0.3} color="#a78bfa" />
    </>
  );
}

export default function Scene3D({ currentAction, actionIndex }: Scene3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [3, 2.5, 4], fov: 45 }}
        className="rounded-lg"
      >
        <color attach="background" args={["#0c1222"]} />
        <fog attach="fog" args={["#0c1222", 8, 20]} />

        <Lights />

        <Avatar3D currentAction={currentAction} actionIndex={actionIndex} />
        <SceneObjects />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.5}
          scale={10}
          blur={2}
          far={4}
        />

        <Grid
          position={[0, -0.01, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#1e3a5f"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#2563eb"
          fadeDistance={12}
          fadeStrength={1}
          followCamera={false}
        />

        <OrbitControls
          makeDefault
          minDistance={2}
          maxDistance={10}
          maxPolarAngle={Math.PI / 2.1}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
