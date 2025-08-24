import { BaseApiClient } from './base';
import { ApiResponse } from './types';

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

export class OllamaApiClient extends BaseApiClient {
  constructor(baseUrl = 'http://localhost:11434') {
    super(baseUrl);
  }

  protected async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/api/tags');
  }

  async listModels(): Promise<ApiResponse<OllamaModel[]>> {
    const response = await this.makeRequest<{ models: OllamaModel[] }>('/api/tags');
    if (response.success && response.data) {
      return { ...response, data: response.data.models || [] };
    }
    return { ...response, data: [] };
  }

  async generateText(
    model: string, 
    prompt: string, 
    images?: string[]
  ): Promise<ApiResponse<string>> {
    const requestBody: any = {
      model,
      prompt,
      stream: false
    };

    if (images && images.length > 0) {
      requestBody.images = images;
    }

    const response = await this.makeRequest<OllamaResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    if (response.success && response.data) {
      return { success: true, data: response.data.response };
    }

    return { success: false, error: response.error || 'Failed to generate text' };
  }

  async generateWithImage(
    model: string, 
    prompt: string, 
    imageFile: File
  ): Promise<ApiResponse<string>> {
    try {
      const base64Image = await this.fileToBase64(imageFile);
      return this.generateText(model, prompt, [base64Image]);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process image'
      };
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}