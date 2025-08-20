import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAPIHealth } from "@/hooks/useAPIHealth";

interface ServiceStatusProps {
  showControls?: boolean;
  compact?: boolean;
}

export const ServiceStatus = ({ showControls = true, compact = false }: ServiceStatusProps) => {
  const { checkAllServices, healthChecking } = useAPIHealth();
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastCheck(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const serviceEndpoints = [
    { name: "Ollama", url: "http://localhost:11434", status: "unknown" },
    { name: "ComfyUI", url: "http://localhost:8188", status: "unknown" },
    { name: "Whisper", url: "http://localhost:9000", status: "unknown" },
    { name: "Open WebUI", url: "http://localhost:3000", status: "unknown" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-error" />;
      case "checking":
        return <Activity className="w-4 h-4 text-warning animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {healthChecking ? (
            <WifiOff className="w-4 h-4 text-warning animate-pulse" />
          ) : (
            <Wifi className="w-4 h-4 text-success" />
          )}
          <span className="text-xs text-muted-foreground">
            Services {healthChecking ? "checking..." : "monitored"}
          </span>
        </div>
        {showControls && (
          <Button
            variant="ghost"
            size="sm"
            onClick={checkAllServices}
            disabled={healthChecking}
            className="h-6 px-2"
          >
            <RefreshCw className={cn("w-3 h-3", healthChecking && "animate-spin")} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className="glass border-glass-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">Service Status</h3>
        {showControls && (
          <Button
            variant="outline"
            size="sm"
            onClick={checkAllServices}
            disabled={healthChecking}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", healthChecking && "animate-spin")} />
            {healthChecking ? "Checking..." : "Refresh"}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {serviceEndpoints.map((service) => (
          <div key={service.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {getStatusIcon(service.status)}
              <div>
                <span className="text-sm font-medium text-foreground">{service.name}</span>
                <p className="text-xs text-muted-foreground">{service.url}</p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                service.status === "healthy" && "border-success text-success",
                service.status === "error" && "border-error text-error",
                service.status === "checking" && "border-warning text-warning"
              )}
            >
              {service.status === "healthy" ? "Online" : 
               service.status === "error" ? "Offline" : 
               service.status === "checking" ? "Checking" : "Unknown"}
            </Badge>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-glass-border">
        <p className="text-xs text-muted-foreground">
          Last checked: {lastCheck.toLocaleTimeString()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Services are checked every 30 seconds automatically
        </p>
      </div>
    </Card>
  );
};