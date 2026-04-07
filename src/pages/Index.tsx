import { useState, useCallback, useRef, useEffect } from "react";
import { RotateCcw, Maximize2, Box } from "lucide-react";
import Scene3D from "@/components/Scene3D";
import CommandPanel from "@/components/CommandPanel";
import type { CommandResult, AnimationAction } from "@/lib/commandParser";

export default function Index() {
  const [currentAction, setCurrentAction] = useState<AnimationAction | null>(null);
  const [actionIndex, setActionIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
  };

  const handleCommand = useCallback((result: CommandResult) => {
    clearTimeouts();

    if (!result.recognized || result.actions.length === 0) {
      setExplanation(result.explanation);
      setCurrentAction(null);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setExplanation(result.explanation);

    let delay = 0;
    result.actions.forEach((action, i) => {
      const t = setTimeout(() => {
        setCurrentAction(action);
        setActionIndex(i);
        setExplanation(action.description);
      }, delay);
      timeoutRef.current.push(t);
      delay += action.duration;
    });

    const endT = setTimeout(() => {
      setCurrentAction({ animation: "idle", duration: 0, description: "Standing idle" });
      setIsAnimating(false);
      setExplanation("Ready for next command.");
    }, delay);
    timeoutRef.current.push(endT);
  }, []);

  useEffect(() => () => clearTimeouts(), []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="h-12 border-b border-border flex items-center px-4 gap-3 shrink-0 glass">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Box className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-sm font-semibold text-gradient">AI Avatar Training Simulator</h1>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          {isAnimating && (
            <span className="text-xs text-primary flex items-center gap-1.5 mr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Animating
            </span>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex min-h-0">
        {/* 3D Scene */}
        <div className="flex-1 relative min-w-0">
          <Scene3D currentAction={currentAction} actionIndex={actionIndex} />
          {/* Scene controls overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <div className="glass rounded-lg px-3 py-1.5 text-xs text-muted-foreground">
              Drag to rotate • Scroll to zoom
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[380px] border-l border-border bg-card/50 backdrop-blur-sm flex flex-col shrink-0">
          <CommandPanel
            onCommand={handleCommand}
            currentExplanation={explanation}
            isAnimating={isAnimating}
          />
        </div>
      </div>
    </div>
  );
}
