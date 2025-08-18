import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { 
  Server, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Wifi, 
  Clock, 
  Activity,
  Circle
} from "lucide-react";
import { useSystemStats } from "@/hooks/useSystemStats";
import { useServices } from "@/hooks/useServices";

export const StatusBar = () => {
  const { stats } = useSystemStats();
  const { services } = useServices();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number, warning: number, danger: number) => {
    if (value >= danger) return "text-error";
    if (value >= warning) return "text-warning";
    return "";
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get running services count
  const runningServices = services.filter(s => s.status === "running").length;

  return (
    <div className="glass border-t border-glass-border p-3">
      <div className="flex items-center justify-between text-xs">
        {/* Left Section - System Stats */}
        <div className="flex items-center space-x-6">
          <Badge variant="secondary" className="text-xs">
            <Cpu className="w-3 h-3 mr-1" />
            CPU: {stats.cpu_usage.toFixed(1)}%
          </Badge>
          
          <Badge 
            variant="secondary" 
            className={`text-xs ${getStatusColor(stats.memory_usage, 70, 85)}`}
          >
            <MemoryStick className="w-3 h-3 mr-1" />
            RAM: {stats.memory_usage.toFixed(1)}%
          </Badge>

          <Badge variant="secondary" className="text-xs">
            <Server className="w-3 h-3 mr-1" />
            Services: {runningServices}/{services.length}
          </Badge>

          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {formatUptime(stats.uptime_seconds)}
          </Badge>
        </div>

        {/* Service Status */}
        <div className="flex items-center space-x-3">
          {services.slice(0, 3).map(service => (
            <div key={service.id} className="flex items-center space-x-1">
              <Circle className={`w-2 h-2 fill-current ${
                service.status === "running" ? "text-success" : 
                service.status === "error" ? "text-error" : "text-muted-foreground"
              }`} />
              <span className="text-xs text-muted-foreground">
                {service.name.length > 8 ? service.name.substring(0, 8) + '...' : service.name}
              </span>
            </div>
          ))}
        </div>

        {/* Right Section - Performance & Time */}
        <div className="flex items-center space-x-6">
          <Badge variant="secondary" className="text-xs">
            <Wifi className="w-3 h-3 mr-1" />
            {stats.active_connections} conn
          </Badge>

          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>

          <Badge variant="secondary" className="text-xs">
            <Server className="w-3 h-3 mr-1 text-success" />
            Online
          </Badge>

          <span className="text-xs text-muted-foreground font-mono">
            {currentTime.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};