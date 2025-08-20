import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Image as ImageIcon, 
  Mic, 
  X, 
  Bot, 
  User,
  Loader2,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ollamaClient, whisperClient } from "@/lib/apiClients";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecording } from "@/hooks/useAudioRecording";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[];
  audio?: string;
}

export const MultimodalChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModel, setCurrentModel] = useState("llava");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { 
    isRecording, 
    recordingTime, 
    audioBlob, 
    startRecording, 
    stopRecording,
    resetRecording 
  } = useAudioRecording();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      );
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAudioTranscribe = async () => {
    if (!audioBlob) return "";
    
    try {
      const transcription = await whisperClient.transcribeAudio(audioBlob);
      resetRecording();
      return transcription;
    } catch (error) {
      console.error('Transcription failed:', error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio",
        variant: "destructive",
      });
      return "";
    }
  };

  const handleSubmit = async () => {
    if ((!input.trim() && selectedImages.length === 0 && !audioBlob) || isProcessing) return;

    setIsProcessing(true);
    
    try {
      let finalPrompt = input.trim();
      
      // Handle audio transcription first
      if (audioBlob) {
        const transcription = await handleAudioTranscribe();
        if (transcription) {
          finalPrompt = finalPrompt ? `${finalPrompt}\n\nAudio transcription: ${transcription}` : transcription;
        }
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "user",
        content: finalPrompt,
        timestamp: new Date(),
        images: selectedImages.length > 0 ? selectedImages.map(f => f.name) : undefined,
        audio: audioBlob ? "Audio recorded" : undefined,
      };

      setMessages(prev => [...prev, userMessage]);

      // Generate AI response
      let response: string;
      
      if (selectedImages.length > 0) {
        // Use multimodal model for images
        response = await ollamaClient.generateWithImage(
          currentModel, 
          finalPrompt, 
          selectedImages[0] // For now, use first image
        );
      } else {
        // Regular text generation
        response = await ollamaClient.generateText(currentModel, finalPrompt);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: "Success",
        description: "Response generated successfully",
      });

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to generate response. Check if Ollama is running with a vision model.",
        variant: "destructive",
      });
    } finally {
      setInput("");
      setSelectedImages([]);
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass border-glass-border h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Multimodal Chat</h2>
          <Badge className="bg-primary text-white">
            {currentModel} • Vision + Audio
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Send text, images, and audio to AI models
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                message.type === "user" 
                  ? "bg-primary text-white" 
                  : "gradient-primary"
              )}>
                {message.type === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div className={cn(
                "glass border border-glass-border p-3 rounded-lg max-w-[80%]",
                message.type === "user" ? "bg-primary/5" : ""
              )}>
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {message.content}
                </div>
                
                {message.images && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    📷 {message.images.join(", ")}
                  </div>
                )}
                
                {message.audio && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    🎤 {message.audio}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-glass-border space-y-3">
        {/* Attachments Preview */}
        {(selectedImages.length > 0 || audioBlob || isRecording) && (
          <div className="space-y-2">
            {/* Images */}
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-5 h-5 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Audio Recording */}
            {(audioBlob || isRecording) && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  isRecording ? "bg-error animate-pulse" : "bg-success"
                )} />
                <span className="text-sm text-foreground">
                  {isRecording ? `Recording: ${formatTime(recordingTime)}` : "Audio recorded"}
                </span>
                {!isRecording && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetRecording}
                    className="ml-auto h-6 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Input Row */}
        <div className="flex gap-2">
          {/* Attachment Buttons */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={isRecording ? stopRecording : startRecording}
            >
              <Mic className={cn("w-4 h-4", isRecording && "text-error")} />
            </Button>
          </div>

          {/* Text Input */}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about images, transcribe audio, or just chat..."
            className="min-h-[40px] resize-none flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />

          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || (!input.trim() && selectedImages.length === 0 && !audioBlob)}
            className="h-10 w-10 p-0"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </Card>
  );
};