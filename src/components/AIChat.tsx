import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Copy, Download, Image, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { ollamaClient } from "@/lib/apiClients";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  model?: string;
  attachments?: Array<{ type: "image" | "audio"; url: string; name: string }>;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm your AI assistant. I can help you with text analysis, code generation, and more. What would you like to work on today?",
      timestamp: new Date(),
      model: "llama3:8b"
    }
  ]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama3:8b");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const models = [
    { id: "llama3:8b", name: "Llama 3 8B", type: "text" },
    { id: "llama3:70b", name: "Llama 3 70B", type: "text" },
    { id: "llava:7b", name: "LLaVA 7B", type: "vision" },
    { id: "codellama:7b", name: "Code Llama 7B", type: "code" },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      let response = "";
      
      // Use Ollama for LLM models
      if (selectedModel.includes("llama") || selectedModel.includes("mistral") || selectedModel.includes("codellama")) {
        response = await ollamaClient.generateText(selectedModel, userInput);
      } else {
        // Fallback response for other models
        response = `I understand you're asking about: "${userInput}". This response is from the ${selectedModel} model. For full functionality, please ensure the corresponding AI service is running.`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response,
        timestamp: new Date(),
        model: selectedModel,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check if Ollama is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getModelBadgeColor = (type: string) => {
    switch (type) {
      case "vision": return "bg-primary-purple text-white";
      case "code": return "bg-success text-white";
      default: return "bg-primary text-white";
    }
  };

  return (
    <div className="glass rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">AI Chat Interface</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const chatHistory = messages.map(m => 
                  `${m.type === 'user' ? 'User' : 'Assistant'} (${m.timestamp.toLocaleTimeString()}): ${m.content}`
                ).join('\n\n');
                
                const blob = new Blob([chatHistory], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `chat_export_${new Date().getTime()}.txt`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Model Selection */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Model:</span>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48 glass border-glass-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-glass-border">
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <span>{model.name}</span>
                    <Badge className={cn("text-xs", getModelBadgeColor(model.type))}>
                      {model.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                message.type === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                message.type === "user" 
                  ? "bg-primary text-white" 
                  : "gradient-primary"
              )}>
                {message.type === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Content */}
              <div className={cn(
                "max-w-[70%] space-y-2",
                message.type === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-3 rounded-lg transition-smooth",
                  message.type === "user"
                    ? "bg-primary text-white ml-auto"
                    : "glass border border-glass-border"
                )}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                
                {/* Message Meta */}
                <div className={cn(
                  "flex items-center gap-2 text-xs text-muted-foreground",
                  message.type === "user" ? "justify-end" : "justify-start"
                )}>
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.model && (
                    <Badge variant="outline" className="text-xs">
                      {message.model}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Message */}
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-white animate-pulse-glow" />
              </div>
              <div className="glass border border-glass-border p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" style={{ animationDelay: "0.4s" }}></div>
                  <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-glass-border">
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-10 w-10 p-0">
              <Image className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-10 w-10 p-0">
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="min-h-[40px] max-h-32 pr-12 glass border-glass-border resize-none"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 h-6 w-6 p-0 gradient-primary"
            >
              <Send className="w-3 h-3 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};