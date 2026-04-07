import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AVAILABLE_ANIMATIONS = [
  "walk", "wave", "point", "jump", "dance", "bow", "clap", "think",
  "safety", "sit", "stand", "turn", "idle",
];

const AVAILABLE_TARGETS = [
  "table", "chair", "door", "screen", "extinguisher", "learner",
  "left", "right", "forward", "backward", "center",
];

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command } = await req.json();
    if (!command || typeof command !== "string" || command.length > 500) {
      return new Response(
        JSON.stringify({ error: "Invalid command" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI avatar command interpreter for a 3D training simulation. Parse the user's natural language command into structured animation actions.

Available animations: ${AVAILABLE_ANIMATIONS.join(", ")}
Available targets: ${AVAILABLE_TARGETS.join(", ")}

Respond using the "interpret_command" tool. Rules:
- Map the user's intent to one or more sequential animation actions
- Each action needs an animation name, duration in ms, an optional target, and a short description
- For movement commands, include a target. Use "forward" as default if no target specified.
- For compound commands like "walk to the table then wave", create multiple actions in sequence
- Set recognized=false only if the command is truly nonsensical
- The explanation should be a natural sentence describing what the avatar will do
- Keep durations realistic: walk 2000ms, wave 2500ms, point 2000ms, jump 1200ms, dance 4000ms, bow 2000ms, clap 2000ms, think 3000ms, safety 3000ms, sit 1500ms, stand 1000ms, turn 1000ms, idle 1000ms`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: command },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "interpret_command",
              description: "Interpret a natural language command into avatar animation actions",
              parameters: {
                type: "object",
                properties: {
                  recognized: { type: "boolean", description: "Whether the command was understood" },
                  intent: { type: "string", description: "Primary intent (e.g. walk, wave, point)" },
                  explanation: { type: "string", description: "Human-readable explanation of what the avatar will do" },
                  actions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        animation: { type: "string", enum: AVAILABLE_ANIMATIONS },
                        duration: { type: "number" },
                        target: { type: "string", enum: AVAILABLE_TARGETS },
                        description: { type: "string" },
                      },
                      required: ["animation", "duration", "description"],
                    },
                  },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Suggested commands if not recognized (2-4 suggestions)",
                  },
                },
                required: ["recognized", "intent", "explanation", "actions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "interpret_command" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    // Resolve target positions
    const actions = (parsed.actions || []).map((a: any) => ({
      animation: a.animation,
      duration: a.duration,
      description: a.description,
      ...(a.target && TARGET_POSITIONS[a.target] ? { target: TARGET_POSITIONS[a.target] } : {}),
    }));

    const result = {
      parsed: {
        intent: parsed.intent,
        target: parsed.actions?.[0]?.target || null,
        parameters: {},
        raw: command,
      },
      actions,
      explanation: parsed.explanation,
      recognized: parsed.recognized,
      suggestions: parsed.suggestions,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interpret-command error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
