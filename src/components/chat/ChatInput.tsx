import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, Mic, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageAttachment } from "@/types/chat";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string, attachments: MessageAttachment[]) => void;
  onImageSelect?: (files: File[]) => void;
  onAudioRecord?: () => void;
  isLoading?: boolean;
  attachments?: MessageAttachment[];
  onRemoveAttachment?: (index: number) => void;
  placeholder?: string;
  showAttachments?: boolean;
}

export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  onImageSelect,
  onAudioRecord,
  isLoading = false,
  attachments = [],
  onRemoveAttachment,
  placeholder = "Type your message...",
  showAttachments = true
}: ChatInputProps) => {
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleSubmit = () => {
    if ((!value.trim() && attachments.length === 0) || isLoading) return;
    onSubmit(value, attachments);
    onChange("");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onImageSelect) {
      onImageSelect(Array.from(files));
      setFileInputKey(prev => prev + 1); // Reset input
    }
  };

  return (
    <div className="space-y-3">
      {/* Attachments Preview */}
      {showAttachments && attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative">
              {attachment.type === "image" ? (
                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">{attachment.name}</span>
                </div>
              )}
              {onRemoveAttachment && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-5 h-5 p-0"
                  onClick={() => onRemoveAttachment(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex gap-2">
        {showAttachments && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-10 w-10 p-0"
              onClick={() => document.getElementById(`file-input-${fileInputKey}`)?.click()}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            
            {onAudioRecord && (
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={onAudioRecord}
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[40px] max-h-32 resize-none flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!value.trim() && attachments.length === 0)}
          className="h-10 w-10 p-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>

        {showAttachments && (
          <input
            key={fileInputKey}
            id={`file-input-${fileInputKey}`}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
};