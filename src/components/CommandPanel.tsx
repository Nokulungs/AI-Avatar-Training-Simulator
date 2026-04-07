import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Lightbulb, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { SUGGESTIONS, type CommandResult } from "@/lib/commandParser";
import { interpretCommand } from "@/lib/aiCommandService";

interface CommandPanelProps {
  onCommand: (result: CommandResult) => void;
  currentExplanation: string;
  isAnimating: boolean;
}

interface HistoryEntry {
  input: string;
  result: CommandResult | null;
  timestamp: Date;
  loading?: boolean;
}

export default function CommandPanel({
  onCommand,
  currentExplanation,
  isAnimating,
}: CommandPanelProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = async (text?: string) => {
    const cmd = text || input;
    if (!cmd.trim() || isProcessing) return;
    setInput("");
    setIsProcessing(true);

    // Add user message with loading state
    const entryIndex = history.length;
    setHistory((prev) => [
      ...prev,
      { input: cmd, result: null, timestamp: new Date(), loading: true },
    ]);

    try {
      const result = await interpretCommand(cmd);
      setHistory((prev) =>
        prev.map((entry, i) =>
          i === entryIndex ? { ...entry, result, loading: false } : entry
        )
      );
      onCommand(result);
    } catch (e) {
      console.error("Command failed:", e);
      setHistory((prev) =>
        prev.map((entry, i) =>
          i === entryIndex
            ? {
                ...entry,
                result: {
                  parsed: { intent: "error", target: null, parameters: {}, raw: cmd },
                  actions: [],
                  explanation: "Something went wrong. Please try again.",
                  recognized: false,
                  suggestions: SUGGESTIONS.slice(0, 4),
                },
                loading: false,
              }
            : entry
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Avatar Controller</h2>
            <p className="text-xs text-muted-foreground">AI-powered command interpretation</p>
          </div>
        </div>
      </div>

      {/* Status bar */}
      {currentExplanation && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-primary leading-relaxed">{currentExplanation}</p>
          </div>
        </div>
      )}

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {history.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Start by typing a command below
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground/70 flex items-center justify-center gap-1">
                <Lightbulb className="w-3 h-3" /> Try these commands:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {SUGGESTIONS.slice(0, 6).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSubmit(s)}
                    disabled={isProcessing}
                    className="text-xs px-2.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {history.map((entry, i) => (
          <div key={i} className="space-y-2">
            {/* User message */}
            <div className="flex justify-end">
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="px-3 py-2 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground text-sm">
                  {entry.input}
                </div>
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-primary" />
                </div>
              </div>
            </div>

            {/* AI response */}
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-accent" />
                </div>
                <div className="space-y-1.5">
                  {entry.loading ? (
                    <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-card border border-border text-sm flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      <span className="text-muted-foreground">Interpreting command...</span>
                    </div>
                  ) : entry.result ? (
                    <>
                      <div className={`px-3 py-2 rounded-2xl rounded-tl-sm text-sm ${
                        entry.result.recognized
                          ? "bg-card border border-border text-foreground"
                          : "bg-destructive/10 border border-destructive/20 text-foreground"
                      }`}>
                        {entry.result.explanation}
                        {!entry.result.recognized && entry.result.parsed.intent !== "none" && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                            <AlertCircle className="w-3 h-3" />
                            Command not recognized
                          </div>
                        )}
                      </div>

                      {entry.result.recognized && entry.result.actions.length > 0 && (
                        <div className="px-3 py-2 rounded-lg bg-muted space-y-1.5">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Action breakdown ({entry.result.actions.length} step{entry.result.actions.length > 1 ? "s" : ""}):
                          </p>
                          {entry.result.actions.map((action, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="font-mono font-medium text-foreground/80">{action.animation}</span>
                                {action.target && (
                                  <span className="text-muted-foreground"> → target</span>
                                )}
                                <span className="text-muted-foreground"> · {action.duration}ms</span>
                                {action.description && (
                                  <p className="text-muted-foreground/80 mt-0.5">{action.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {entry.result.suggestions && (
                        <div className="flex flex-wrap gap-1">
                          {entry.result.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSubmit(s)}
                              disabled={isProcessing}
                              className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors disabled:opacity-50"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={historyEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isProcessing ? "Interpreting..." : isAnimating ? "Avatar is performing..." : "Type a command..."}
            disabled={isProcessing}
            className="flex-1 bg-input border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isProcessing}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all glow-primary"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
