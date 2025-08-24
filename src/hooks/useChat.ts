import { useState, useCallback } from "react";
import { ChatMessage, MessageAttachment } from "@/types/chat";
import { ollamaClient } from "@/lib/apiClients";
import { useToast } from "@/hooks/use-toast";

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  defaultModel?: string;
  onError?: (error: Error) => void;
}

export const useChat = (options: UseChatOptions = {}) => {
  const { initialMessages = [], defaultModel = "llama3:8b", onError } = options;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addMessage = useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (
    content: string, 
    attachments: MessageAttachment[] = [], 
    model: string = defaultModel
  ) => {
    if ((!content.trim() && attachments.length === 0) || isLoading) return;

    // Add user message
    const userMessage = addMessage({
      type: "user",
      content: content.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setIsLoading(true);

    try {
      let response: string;
      
      // Handle image attachments for vision models
      const imageAttachments = attachments.filter(a => a.type === "image" && a.file);
      if (imageAttachments.length > 0 && imageAttachments[0].file) {
        response = await ollamaClient.generateWithImage(
          model,
          content,
          imageAttachments[0].file
        );
      } else {
        response = await ollamaClient.generateText(model, content);
      }

      // Add AI response
      addMessage({
        type: "assistant",
        content: response,
        model,
      });

      toast({
        title: "Success",
        description: "Response generated successfully",
      });

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      addMessage({
        type: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}. Please make sure Ollama is running and the model is available.`,
        model,
      });

      toast({
        title: "Error",
        description: "Failed to generate response",
        variant: "destructive",
      });

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, defaultModel, addMessage, toast, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const exportChat = useCallback(() => {
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
  }, [messages]);

  return {
    messages,
    isLoading,
    sendMessage,
    addMessage,
    clearMessages,
    exportChat,
  };
};