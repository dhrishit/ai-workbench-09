import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { LoadingMessage } from "./LoadingMessage";
import { ChatMessage } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface ChatContainerProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  currentModel?: string;
  className?: string;
}

export const ChatContainer = ({ 
  messages, 
  isLoading = false, 
  currentModel,
  className = "flex-1 p-4"
}: ChatContainerProps) => {
  const { toast } = useToast();

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  return (
    <ScrollArea className={className}>
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onCopy={handleCopyMessage}
          />
        ))}
        
        {isLoading && <LoadingMessage model={currentModel} />}
      </div>
    </ScrollArea>
  );
};