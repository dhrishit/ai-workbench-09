import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCcw, Settings, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  status: "running" | "stopped" | "error" | "starting" | "stopping";
  port?: number;
  description?: string;
  auto_start: boolean;
  process_id?: string;
}

interface ServiceCardProps {
  service: Service;
  onAction: (serviceId: string, action: "start" | "stop" | "restart") => void;
  onAutoStartChange: (autoStart: boolean) => void;
}

export const ServiceCard = ({ service, onAction, onAutoStartChange }: ServiceCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "running":
        return {
          color: "bg-success text-white",
          glow: "status-active",
          icon: Activity,
          text: "Running"
        };
      case "starting":
        return {
          color: "bg-warning text-white",
          glow: "",
          icon: Activity,
          text: "Starting"
        };
      case "stopping":
        return {
          color: "bg-warning text-white",
          glow: "",
          icon: Square,
          text: "Stopping"
        };
      case "stopped":
        return {
          color: "bg-muted text-muted-foreground",
          glow: "",
          icon: Square,
          text: "Stopped"
        };
      case "error":
        return {
          color: "bg-error text-white",
          glow: "status-error",
          icon: Square,
          text: "Error"
        };
      default:
        return {
          color: "bg-muted text-muted-foreground",
          glow: "",
          icon: Square,
          text: "Unknown"
        };
    }
  };

  const statusConfig = getStatusConfig(service.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      "glass p-4 rounded-lg transition-smooth glass-hover",
      statusConfig.glow
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            statusConfig.color
          )}>
            <StatusIcon className={cn(
              "w-4 h-4",
              (service.status === "starting" || service.status === "stopping") && "animate-pulse-glow"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{service.name}</h3>
            <p className="text-xs text-muted-foreground">{service.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4">
        <Badge className={statusConfig.color}>
          {statusConfig.text}
        </Badge>
        {service.port && (
          <span className="text-xs text-muted-foreground">
            Port: {service.port}
          </span>
        )}
        {service.process_id && (
          <span className="text-xs text-muted-foreground">
            PID: {service.process_id}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {service.status === "stopped" || service.status === "error" ? (
            <Button
              onClick={() => onAction(service.id, "start")}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
          ) : service.status === "running" ? (
            <>
              <Button
                onClick={() => onAction(service.id, "stop")}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Square className="w-3 h-3 mr-1" />
                Stop
              </Button>
              <Button
                onClick={() => onAction(service.id, "restart")}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled
            >
              <Activity className="w-3 h-3 mr-1 animate-spin-slow" />
              {service.status === "starting" ? "Starting..." : "Stopping..."}
            </Button>
          )}
        </div>

        {/* Auto-start Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Auto</span>
          <Switch
            checked={service.auto_start}
            onCheckedChange={onAutoStartChange}
          />
        </div>
      </div>
    </div>
  );
};