export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface ServiceStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'error';
  lastChecked: Date;
  responseTime?: number;
}

export interface GenerationSettings {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  seed?: number;
  steps?: number;
  cfgScale?: number;
  width?: number;
  height?: number;
  sampler?: string;
}

export interface AudioTranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
  duration?: number;
}