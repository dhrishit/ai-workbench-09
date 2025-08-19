import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Mic, 
  Upload, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Square,
  Download,
  Trash2,
  Volume2,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { whisperClient } from "@/lib/apiClients";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "audio" | "video";
  url: string;
  size: number;
  timestamp: Date;
  status: "uploading" | "completed" | "processing" | "error";
}

export const MediaCapture = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: "1",
      name: "screenshot_2024.png",
      type: "image",
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      size: 245760,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: "completed"
    },
    {
      id: "2", 
      name: "voice_note.wav",
      type: "audio",
      url: "",
      size: 512000,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "completed"
    }
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newFile: MediaFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('audio/') ? 'audio' : 'video',
        url: URL.createObjectURL(file),
        size: file.size,
        timestamp: new Date(),
        status: "uploading"
      };

      setMediaFiles(prev => [newFile, ...prev]);

      // Simulate upload
      setTimeout(() => {
        setMediaFiles(prev => 
          prev.map(f => f.id === newFile.id ? { ...f, status: "completed" as const } : f)
        );
      }, 1500);
    });
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real implementation, you'd capture a frame from the stream
      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: `camera_${Date.now()}.jpg`,
        type: "image",
        url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
        size: 187392,
        timestamp: new Date(),
        status: "completed"
      };
      setMediaFiles(prev => [newFile, ...prev]);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const handleScreenCapture = async () => {
    try {
      // This would use the Screen Capture API in a real implementation
      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: `screenshot_${Date.now()}.png`,
        type: "image", 
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
        size: 325648,
        timestamp: new Date(),
        status: "completed"
      };
      setMediaFiles(prev => [newFile, ...prev]);
    } catch (error) {
      console.error('Screen capture failed:', error);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // Simulate recording for demo
    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);
      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: `recording_${Date.now()}.wav`,
        type: "audio",
        url: "",
        size: recordingTime * 16000, // Approximate size
        timestamp: new Date(),
        status: "completed"
      };
      setMediaFiles(prev => [newFile, ...prev]);
      setRecordingTime(0);
    }, 5000); // Auto-stop after 5 seconds for demo
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image": return ImageIcon;
      case "audio": return Volume2;
      default: return Upload;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success text-white";
      case "uploading": return "bg-warning text-white";
      case "processing": return "bg-primary text-white";
      case "error": return "bg-error text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Capture Controls */}
      <div className="glass rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Media Capture</h2>

        {/* Upload Section */}
        <Card className="glass border-glass-border p-4">
          <h3 className="font-medium text-foreground mb-4">File Upload</h3>
          <div className="space-y-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full justify-start glass border-glass-border"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,audio/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Supports images, audio, and video files
            </p>
          </div>
        </Card>

        {/* Camera Capture */}
        <Card className="glass border-glass-border p-4">
          <h3 className="font-medium text-foreground mb-4">Camera</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCameraCapture}
              variant="outline"
              className="glass border-glass-border"
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              onClick={handleScreenCapture}
              variant="outline"
              className="glass border-glass-border"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Screenshot
            </Button>
          </div>
        </Card>

        {/* Audio Recording */}
        <Card className="glass border-glass-border p-4">
          <h3 className="font-medium text-foreground mb-4">Audio Recording</h3>
          <div className="space-y-4">
            {isRecording && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-error rounded-full flex items-center justify-center animate-pulse-glow">
                  <div className="w-6 h-6 bg-white rounded-full" />
                </div>
                <p className="text-sm text-foreground font-mono">
                  {formatTime(recordingTime)}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  variant="outline"
                  className="flex-1 glass border-glass-border"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="outline"
                  className="flex-1 bg-error/20 border-error text-error hover:bg-error hover:text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Transcription */}
        <Card className="glass border-glass-border p-4">
          <h3 className="font-medium text-foreground mb-4">Audio Transcription</h3>
          <div className="space-y-4">
            <Button
              onClick={async () => {
                setIsTranscribing(true);
                try {
                  // Simulate transcription for now - in real app would use actual audio
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  setTranscription("This is a demo transcription. In a real implementation, Whisper would process the actual audio file.");
                  toast({
                    title: "Success",
                    description: "Audio transcribed successfully!",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to transcribe audio.",
                    variant: "destructive",
                  });
                } finally {
                  setIsTranscribing(false);
                }
              }}
              disabled={isTranscribing || mediaFiles.filter(f => f.type === 'audio').length === 0}
              className="w-full"
            >
              {isTranscribing ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Transcribe Latest Audio
                </>
              )}
            </Button>
            
            {transcription && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-foreground mb-2">Transcription:</h4>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {transcription}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Media Gallery */}
      <div className="glass rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Media Library</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="w-4 h-4" />
            {mediaFiles.length} files
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="space-y-3">
            {mediaFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.type);
              
              return (
                <div
                  key={file.id}
                  className="glass border border-glass-border rounded-lg p-4 transition-smooth hover:bg-glass-hover animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-4">
                    {/* File Preview */}
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {file.type === "image" && file.url ? (
                        <img 
                          src={file.url} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </h4>
                        <Badge className={cn("text-xs ml-2", getStatusColor(file.status))}>
                          {file.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.timestamp.toLocaleTimeString()}</span>
                      </div>

                      {/* File Actions */}
                      <div className="flex gap-1">
                        {file.type === "audio" && (
                          <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-error hover:text-error">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {mediaFiles.length === 0 && (
              <div className="text-center py-12">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No media files yet</p>
                <p className="text-sm text-muted-foreground">Upload or capture files to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};