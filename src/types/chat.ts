export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: "image" | "audio";
  url: string;
  name: string;
  file?: File;
}

export interface AIModel {
  id: string;
  name: string;
  type: "text" | "vision" | "code" | "multimodal";
  provider: "ollama" | "openai" | "comfyui";
}

export interface ChatSettings {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}