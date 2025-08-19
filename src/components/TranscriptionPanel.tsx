import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileAudio, Upload, Loader2 } from "lucide-react";
import { whisperClient } from "@/lib/apiClients";
import { useToast } from "@/hooks/use-toast";

export const TranscriptionPanel = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setTranscription("");
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;
    
    setIsTranscribing(true);
    try {
      const result = await whisperClient.transcribeAudio(audioFile);
      setTranscription(result);
      
      toast({
        title: "Success",
        description: "Audio transcribed successfully!",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please check if Whisper is running.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Card className="glass border-glass-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="w-5 h-5" />
          Audio Transcription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Audio File</label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-white file:cursor-pointer"
            />
          </div>
          {audioFile && (
            <p className="text-xs text-muted-foreground">
              Selected: {audioFile.name}
            </p>
          )}
        </div>

        {/* Transcribe Button */}
        <Button
          onClick={handleTranscribe}
          disabled={!audioFile || isTranscribing}
          className="w-full"
        >
          {isTranscribing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Transcribing...
            </>
          ) : (
            <>
              <FileAudio className="w-4 h-4 mr-2" />
              Transcribe with Whisper
            </>
          )}
        </Button>

        {/* Transcription Result */}
        {transcription && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Transcription</label>
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              className="min-h-[100px] glass border-glass-border"
              placeholder="Transcription will appear here..."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};