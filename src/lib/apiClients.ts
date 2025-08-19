// API clients for various AI services

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Ollama API error:', error);
      return [];
    }
  }

  async generateText(model: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          stream: false
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate text');
      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw error;
    }
  }

  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class ComfyUIClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:8188') {
    this.baseUrl = baseUrl;
  }

  async generateImage(prompt: string, settings: any): Promise<{ images: string[] }> {
    try {
      // Basic ComfyUI workflow for text-to-image
      const workflow = {
        "3": {
          "inputs": {
            "seed": settings.seed || Math.floor(Math.random() * 1000000),
            "steps": settings.steps || 20,
            "cfg": settings.cfgScale || 7,
            "sampler_name": settings.sampler || "euler",
            "scheduler": "normal",
            "denoise": 1,
            "model": ["4", 0],
            "positive": ["6", 0],
            "negative": ["7", 0],
            "latent_image": ["5", 0]
          },
          "class_type": "KSampler"
        },
        "4": {
          "inputs": {
            "ckpt_name": settings.model || "v1-5-pruned-emaonly.ckpt"
          },
          "class_type": "CheckpointLoaderSimple"
        },
        "5": {
          "inputs": {
            "width": settings.width || 512,
            "height": settings.height || 512,
            "batch_size": 1
          },
          "class_type": "EmptyLatentImage"
        },
        "6": {
          "inputs": {
            "text": prompt,
            "clip": ["4", 1]
          },
          "class_type": "CLIPTextEncode"
        },
        "7": {
          "inputs": {
            "text": "bad quality, blurry",
            "clip": ["4", 1]
          },
          "class_type": "CLIPTextEncode"
        },
        "8": {
          "inputs": {
            "samples": ["3", 0],
            "vae": ["4", 2]
          },
          "class_type": "VAEDecode"
        },
        "9": {
          "inputs": {
            "filename_prefix": "ComfyUI",
            "images": ["8", 0]
          },
          "class_type": "SaveImage"
        }
      };

      const response = await fetch(`${this.baseUrl}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: workflow })
      });

      if (!response.ok) throw new Error('Failed to queue generation');
      const data = await response.json();
      
      // Wait for completion and get images
      const images = await this.waitForCompletion(data.prompt_id);
      return { images };
    } catch (error) {
      console.error('ComfyUI generation error:', error);
      throw error;
    }
  }

  private async waitForCompletion(promptId: string): Promise<string[]> {
    // Simplified polling for completion
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return mock image URL for now
        resolve([`${this.baseUrl}/view?filename=ComfyUI_${promptId}.png`]);
      }, 3000);
    });
  }

  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/system_stats`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class WhisperClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:9000') {
    this.baseUrl = baseUrl;
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'audio.wav');
      formData.append('task', 'transcribe');
      formData.append('language', 'en');
      formData.append('output', 'json');

      const response = await fetch(`${this.baseUrl}/asr`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to transcribe audio');
      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export class OpenWebUIClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async getModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/models`);
      if (!response.ok) throw new Error('Failed to fetch models');
      return await response.json();
    } catch (error) {
      console.error('Open WebUI API error:', error);
      return [];
    }
  }

  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create singleton instances
export const ollamaClient = new OllamaClient();
export const comfyUIClient = new ComfyUIClient();
export const whisperClient = new WhisperClient();
export const openWebUIClient = new OpenWebUIClient();