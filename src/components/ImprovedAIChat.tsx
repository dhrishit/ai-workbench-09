import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ChatContainer } from "./chat/ChatContainer";
import { ChatInput } from "./chat/ChatInput";
import { ModelSelector } from "./ai/ModelSelector";
import { useChat } from "@/hooks/useChat";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { whisperClient } from "@/lib/apiClients";
import { useToast } from "@/hooks/use-toast";
import { AIModel, MessageAttachment } from "@/types/chat";

const defaultModels: AIModel[] = [
  { id: "llama3:8b", name: "Llama 3 8B", type: "text", provider: "ollama" },
  { id: "llama3:70b", name: "Llama 3 70B", type: "text", provider: "ollama" },
  { id: "llava:7b", name: "LLaVA 7B", type: "vision", provider: "ollama" },
  { id: "codellama:7b", name: "Code Llama 7B", type: "code", provider: "ollama" },
];

export const ImprovedAIChat = () => {
  const [selectedModel, setSelectedModel] = useState("llama3:8b");
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const { toast } = useToast();
  
  const { 
    isRecording, 
    audioBlob, 
    startRecording, 
    stopRecording,
    resetRecording 
  } = useAudioRecording();

  const { messages, isLoading, sendMessage, exportChat } = useChat({
    initialMessages: [{
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI assistant. I can help you with text analysis, code generation, and more. What would you like to work on today?",
      timestamp: new Date(),
      model: "llama3:8b"
    }],
    defaultModel: selectedModel
  });

  const handleImageSelect = (files: File[]) => {
    const newAttachments = files.map(file => ({
      type: "image" as const,
      url: URL.createObjectURL(file),
      name: file.name,
      file
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleAudioRecord = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        await startRecording();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start recording. Please allow microphone access.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (message: string, messageAttachments: MessageAttachment[]) => {
    let finalAttachments = [...messageAttachments];
    
    // Handle audio transcription
    if (audioBlob) {
      try {
        const transcription = await whisperClient.transcribeAudio(audioBlob);
        if (transcription) {
          const audioMessage = message ? `${message}\n\nAudio transcription: ${transcription}` : transcription;
          await sendMessage(audioMessage, finalAttachments, selectedModel);
          resetRecording();
          setAttachments([]);
          return;
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to transcribe audio",
          variant: "destructive",
        });
      }
    }
    
    await sendMessage(message, finalAttachments, selectedModel);
    setAttachments([]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const removed = prev[index];
      if (removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Add audio attachment when recording completes
  useEffect(() => {
    if (audioBlob && !isRecording) {
      const audioAttachment: MessageAttachment = {
        type: "audio",
        url: URL.createObjectURL(audioBlob),
        name: "Audio recording"
      };
      setAttachments(prev => [...prev, audioAttachment]);
    }
  }, [audioBlob, isRecording]);

  return (
    <div className="glass rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">AI Chat Interface</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportChat}
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
        
        <ModelSelector
          models={defaultModels}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      {/* Messages */}
      <ChatContainer 
        messages={messages}
        isLoading={isLoading}
        currentModel={selectedModel}
      />

      {/* Input Area */}
      <div className="p-4 border-t border-glass-border">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onImageSelect={handleImageSelect}
          onAudioRecord={handleAudioRecord}
          isLoading={isLoading}
          attachments={attachments}
          onRemoveAttachment={removeAttachment}
          placeholder="Type your message... (Shift+Enter for new line)"
        />
      </div>
    </div>
  );
};