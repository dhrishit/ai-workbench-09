import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  onCopy?: (content: string) => void;
}

export const MessageBubble = ({ message, onCopy }: MessageBubbleProps) => {
  const isUser = message.type === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        isUser ? "bg-primary text-white" : "gradient-primary"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("max-w-[70%] space-y-2", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "p-3 rounded-lg transition-smooth",
          isUser
            ? "bg-primary text-white ml-auto"
            : "glass border border-glass-border"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="text-xs opacity-80">
                  {attachment.type === "image" ? "📷" : "🎤"} {attachment.name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Message Meta */}
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          isUser ? "justify-end" : "justify-start"
        )}>
          <span>{message.timestamp.toLocaleTimeString()}</span>
          {message.model && (
            <Badge variant="outline" className="text-xs">
              {message.model}
            </Badge>
          )}
          {onCopy && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onCopy(message.content)}
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};