import { useState } from "react";
import { ServiceCard } from "./ServiceCard";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";

interface Service {
  id: string;
  name: string;
  status: "running" | "stopped" | "starting" | "error";
  port: number;
  description: string;
  autoStart: boolean;
  processId?: number;
}

export const ServiceDashboard = () => {
  const [services, setServices] = useState<Service[]>([
    {
      id: "ollama",
      name: "Ollama",
      status: "running",
      port: 11434,
      description: "Local LLM inference server",
      autoStart: true,
      processId: 1234,
    },
    {
      id: "comfyui",
      name: "ComfyUI",
      status: "stopped",
      port: 8188,
      description: "Advanced image generation",
      autoStart: false,
    },
    {
      id: "whisper",
      name: "Whisper",
      status: "running",
      port: 8889,
      description: "Speech-to-text transcription",
      autoStart: true,
      processId: 5678,
    },
    {
      id: "openwebui",
      name: "Open WebUI",
      status: "error",
      port: 3000,
      description: "Web interface for AI models",
      autoStart: false,
    },
  ]);

  const handleServiceAction = (serviceId: string, action: "start" | "stop" | "restart") => {
    setServices(prev => prev.map(service => {
      if (service.id === serviceId) {
        if (action === "start") {
          return { ...service, status: "starting" as const };
        } else if (action === "stop") {
          return { ...service, status: "stopped" as const, processId: undefined };
        } else if (action === "restart") {
          return { ...service, status: "starting" as const };
        }
      }
      return service;
    }));

    // Simulate API call delay
    setTimeout(() => {
      setServices(prev => prev.map(service => {
        if (service.id === serviceId) {
          if (action === "start" || action === "restart") {
            return { 
              ...service, 
              status: "running" as const, 
              processId: Math.floor(Math.random() * 10000) 
            };
          }
        }
        return service;
      }));
    }, 2000);
  };

  const handleStartAll = () => {
    services.forEach(service => {
      if (service.status === "stopped") {
        handleServiceAction(service.id, "start");
      }
    });
  };

  const handleStopAll = () => {
    services.forEach(service => {
      if (service.status === "running") {
        handleServiceAction(service.id, "stop");
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Global Controls */}
      <div className="glass p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-foreground mb-4">Service Control</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleStartAll}
            variant="default"
            size="sm"
            className="flex-1 bg-success hover:bg-success-glow"
          >
            <Play className="w-4 h-4 mr-1" />
            Start All
          </Button>
          <Button
            onClick={handleStopAll}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-1" />
            Stop All
          </Button>
        </div>
      </div>

      {/* Service Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">AI Services</h2>
        {services.map((service, index) => (
          <div
            key={service.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ServiceCard
              service={service}
              onAction={(action) => handleServiceAction(service.id, action)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};