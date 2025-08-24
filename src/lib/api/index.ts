// Simplified wrapper to maintain backward compatibility
import { OllamaApiClient } from './ollama';

export class OllamaClient {
  private client: OllamaApiClient;

  constructor(baseUrl = 'http://localhost:11434') {
    this.client = new OllamaApiClient(baseUrl);
  }

  async listModels() {
    const response = await this.client.listModels();
    return response.data || [];
  }

  async generateText(model: string, prompt: string, images?: string[]): Promise<string> {
    const response = await this.client.generateText(model, prompt, images);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Generation failed');
  }

  async generateWithImage(model: string, prompt: string, imageFile: File): Promise<string> {
    const response = await this.client.generateWithImage(model, prompt, imageFile);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Generation failed');
  }

  async checkStatus(): Promise<boolean> {
    const status = await this.client.checkHealth();
    return status.status === 'online';
  }
}