import { useState, useEffect } from 'react';
import { ollamaClient, comfyUIClient, whisperClient, openWebUIClient } from '@/lib/apiClients';
import { useServices } from './useServices';

export const useAPIHealth = () => {
  const { services, updateServiceStatus } = useServices();
  const [healthChecking, setHealthChecking] = useState(false);

  const checkServiceHealth = async (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    if (!service) return;

    try {
      let isHealthy = false;
      
      switch (serviceName) {
        case 'Ollama':
          isHealthy = await ollamaClient.checkStatus();
          break;
        case 'ComfyUI':
          isHealthy = await comfyUIClient.checkStatus();
          break;
        case 'Whisper':
          isHealthy = await whisperClient.checkStatus();
          break;
        case 'Open WebUI':
          isHealthy = await openWebUIClient.checkStatus();
          break;
      }

      const newStatus = isHealthy ? 'running' : 'error';
      if (service.status !== newStatus) {
        await updateServiceStatus(service.id, newStatus);
      }
    } catch (error) {
      console.error(`Health check failed for ${serviceName}:`, error);
      await updateServiceStatus(service.id, 'error');
    }
  };

  const checkAllServices = async () => {
    setHealthChecking(true);
    try {
      await Promise.all([
        checkServiceHealth('Ollama'),
        checkServiceHealth('ComfyUI'),
        checkServiceHealth('Whisper'),
        checkServiceHealth('Open WebUI')
      ]);
    } finally {
      setHealthChecking(false);
    }
  };

  // Check health every 30 seconds
  useEffect(() => {
    checkAllServices();
    const interval = setInterval(checkAllServices, 30000);
    return () => clearInterval(interval);
  }, [services]);

  return {
    checkAllServices,
    checkServiceHealth,
    healthChecking
  };
};