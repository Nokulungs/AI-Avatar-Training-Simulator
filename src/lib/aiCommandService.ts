import { supabase } from "@/integrations/supabase/client";
import type { CommandResult } from "./commandParser";
import { parseCommand, SUGGESTIONS } from "./commandParser";

export async function interpretCommand(command: string): Promise<CommandResult> {
  try {
    const { data, error } = await supabase.functions.invoke("interpret-command", {
      body: { command },
    });

    if (error) {
      console.error("AI interpretation error:", error);
      // Fallback to local parser
      return parseCommand(command);
    }

    if (data?.error) {
      console.error("AI service error:", data.error);
      return parseCommand(command);
    }

    return data as CommandResult;
  } catch (e) {
    console.error("Failed to call AI service:", e);
    // Fallback to local keyword parser
    return parseCommand(command);
  }
}
