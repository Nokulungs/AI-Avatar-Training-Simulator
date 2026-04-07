export interface ParsedCommand {
  intent: string;
  target: string | null;
  parameters: Record<string, string>;
  raw: string;
}

export interface AnimationAction {
  animation: string;
  duration: number;
  target?: { x: number; y: number; z: number };
  description: string;
}

export interface CommandResult {
  parsed: ParsedCommand;
  actions: AnimationAction[];
  explanation: string;
  recognized: boolean;
  suggestions?: string[];
}

const INTENT_KEYWORDS: Record<string, string[]> = {
  walk: ["walk", "go", "move", "step", "approach", "head"],
  point: ["point", "indicate", "show", "gesture", "direct"],
  wave: ["wave", "greet", "hello", "hi", "hey"],
  sit: ["sit", "seat", "crouch", "squat"],
  stand: ["stand", "rise", "get up", "straighten"],
  jump: ["jump", "hop", "leap", "bounce"],
  dance: ["dance", "groove", "boogie", "celebrate"],
  bow: ["bow", "curtsy", "nod", "acknowledge"],
  clap: ["clap", "applaud"],
  think: ["think", "consider", "ponder", "contemplate"],
  demonstrate: ["demonstrate", "show", "display", "present", "perform"],
  safety: ["safety", "posture", "position", "stance", "brace"],
  look: ["look", "gaze", "turn", "face", "glance"],
  stop: ["stop", "halt", "freeze", "wait", "pause"],
  idle: ["idle", "rest", "relax"],
};

const TARGET_KEYWORDS: Record<string, string> = {
  table: "table",
  desk: "table",
  chair: "chair",
  door: "door",
  exit: "door",
  window: "window",
  screen: "screen",
  monitor: "screen",
  extinguisher: "extinguisher",
  "fire extinguisher": "extinguisher",
  learner: "learner",
  student: "learner",
  person: "learner",
  user: "learner",
  audience: "learner",
  left: "left",
  right: "right",
  forward: "forward",
  ahead: "forward",
  back: "backward",
  backward: "backward",
  center: "center",
  middle: "center",
};

const TARGET_POSITIONS: Record<string, { x: number; y: number; z: number }> = {
  table: { x: 3, y: 0, z: 0 },
  chair: { x: -2, y: 0, z: 1 },
  door: { x: 0, y: 0, z: -4 },
  screen: { x: -3, y: 1.5, z: -2 },
  extinguisher: { x: 4, y: 1, z: -2 },
  learner: { x: 0, y: 0, z: 3 },
  left: { x: -3, y: 0, z: 0 },
  right: { x: 3, y: 0, z: 0 },
  forward: { x: 0, y: 0, z: -3 },
  backward: { x: 0, y: 0, z: 3 },
  center: { x: 0, y: 0, z: 0 },
};

function detectIntent(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return intent;
    }
  }
  return null;
}

function detectTarget(text: string): string | null {
  const lower = text.toLowerCase();
  // Check multi-word targets first
  const sorted = Object.entries(TARGET_KEYWORDS).sort(
    ([a], [b]) => b.length - a.length
  );
  for (const [kw, target] of sorted) {
    if (lower.includes(kw)) return target;
  }
  return null;
}

function buildActions(intent: string, target: string | null): AnimationAction[] {
  const targetPos = target ? TARGET_POSITIONS[target] : undefined;

  switch (intent) {
    case "walk":
      return [
        {
          animation: "walk",
          duration: 2000,
          target: targetPos || TARGET_POSITIONS.forward,
          description: `Walking ${target ? `toward the ${target}` : "forward"}`,
        },
        {
          animation: "idle",
          duration: 500,
          description: "Stopping",
        },
      ];
    case "point":
      const pointActions: AnimationAction[] = [];
      if (target && targetPos) {
        pointActions.push({
          animation: "turn",
          duration: 800,
          target: targetPos,
          description: `Turning toward the ${target}`,
        });
      }
      pointActions.push({
        animation: "point",
        duration: 2000,
        target: targetPos,
        description: `Pointing ${target ? `at the ${target}` : "ahead"}`,
      });
      return pointActions;
    case "wave":
      return [
        {
          animation: "wave",
          duration: 2500,
          description: `Waving ${target ? `at the ${target}` : "hello"}`,
        },
      ];
    case "sit":
      return [
        { animation: "sit", duration: 1500, description: "Sitting down" },
      ];
    case "stand":
      return [
        { animation: "stand", duration: 1000, description: "Standing up" },
      ];
    case "jump":
      return [
        { animation: "jump", duration: 1200, description: "Jumping" },
      ];
    case "dance":
      return [
        { animation: "dance", duration: 4000, description: "Dancing" },
      ];
    case "bow":
      return [
        { animation: "bow", duration: 2000, description: "Bowing" },
      ];
    case "clap":
      return [
        { animation: "clap", duration: 2000, description: "Clapping" },
      ];
    case "think":
      return [
        { animation: "think", duration: 3000, description: "Thinking" },
      ];
    case "demonstrate":
    case "safety":
      return [
        {
          animation: "safety",
          duration: 3000,
          description: "Demonstrating the correct safety posture",
        },
      ];
    case "look":
      return [
        {
          animation: "turn",
          duration: 1000,
          target: targetPos,
          description: `Looking ${target ? `at the ${target}` : "around"}`,
        },
      ];
    case "stop":
    case "idle":
      return [
        { animation: "idle", duration: 1000, description: "Standing idle" },
      ];
    default:
      return [
        { animation: "idle", duration: 1000, description: "Standing idle" },
      ];
  }
}

function buildExplanation(intent: string, target: string | null, actions: AnimationAction[]): string {
  const actionDescs = actions.map((a) => a.description.toLowerCase()).join(", then ");
  return `The avatar is ${actionDescs}.`;
}

const SUGGESTIONS = [
  "Walk to the table",
  "Point at the fire extinguisher",
  "Wave hello to the learner",
  "Show the correct safety posture",
  "Jump up",
  "Dance",
  "Bow to the audience",
  "Think about the problem",
  "Clap your hands",
  "Look at the screen",
  "Sit down",
  "Stand up",
];

export function parseCommand(input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      parsed: { intent: "none", target: null, parameters: {}, raw: trimmed },
      actions: [],
      explanation: "",
      recognized: false,
      suggestions: SUGGESTIONS.slice(0, 4),
    };
  }

  const intent = detectIntent(trimmed);
  const target = detectTarget(trimmed);

  if (!intent) {
    return {
      parsed: { intent: "unknown", target, parameters: {}, raw: trimmed },
      actions: [],
      explanation: `I didn't understand "${trimmed}". Try a command like walking, pointing, or waving.`,
      recognized: false,
      suggestions: SUGGESTIONS.slice(0, 5),
    };
  }

  const actions = buildActions(intent, target);
  const explanation = buildExplanation(intent, target, actions);

  return {
    parsed: { intent, target, parameters: {}, raw: trimmed },
    actions,
    explanation,
    recognized: true,
  };
}

export { SUGGESTIONS };
