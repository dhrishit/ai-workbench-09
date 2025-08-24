import { Bot } from "lucide-react";

interface LoadingMessageProps {
  model?: string;
}

export const LoadingMessage = ({ model }: LoadingMessageProps) => {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
        <Bot className="w-4 h-4 text-white animate-pulse-glow" />
      </div>
      <div className="glass border border-glass-border p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" style={{ animationDelay: "0.4s" }}></div>
          <span className="text-sm text-muted-foreground ml-2">
            {model ? `${model} is thinking...` : "Thinking..."}
          </span>
        </div>
      </div>
    </div>
  );
};