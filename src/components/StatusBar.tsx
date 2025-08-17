import { Badge } from "@/components/ui/badge";
import { 
  Cpu, 
  HardDrive, 
  Wifi, 
  Clock,
  Activity,
  Server,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";

interface SystemStats {
  cpu: number;
  memory: number;
  diskUsage: number;
  activeConnections: number;
  uptime: string;
  lastUpdate: Date;
}

export const StatusBar = () => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 23,
    memory: 67,
    diskUsage: 45,
    activeConnections: 4,
    uptime: "2h 34m",
    lastUpdate: new Date()
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate real-time stats updates
      setStats(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(50, Math.min(85, prev.memory + (Math.random() - 0.5) * 5)),
        lastUpdate: new Date()
      }));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return "bg-error text-white";
    if (value >= thresholds.warning) return "bg-warning text-white";
    return "bg-success text-white";
  };

  const connections = [
    { service: "Ollama", status: "connected", latency: "12ms" },
    { service: "ComfyUI", status: "disconnected", latency: "-" },
    { service: "Whisper", status: "connected", latency: "8ms" },
    { service: "WebUI", status: "error", latency: "timeout" }
  ];

  return (
    <div className="glass border-t border-glass-border p-3">
      <div className="flex items-center justify-between text-xs">
        {/* Left Section - System Stats */}
        <div className="flex items-center gap-4">
          {/* CPU Usage */}
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">CPU:</span>
            <Badge className={getStatusColor(stats.cpu, { warning: 70, danger: 85 })}>
              {stats.cpu.toFixed(0)}%
            </Badge>
          </div>

          {/* Memory Usage */}
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Memory:</span>
            <Badge className={getStatusColor(stats.memory, { warning: 75, danger: 90 })}>
              {stats.memory.toFixed(0)}%
            </Badge>
          </div>

          {/* Active Connections */}
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Services:</span>
            <Badge className="bg-primary text-white">
              {connections.filter(c => c.status === "connected").length}/{connections.length}
            </Badge>
          </div>

          {/* Uptime */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Uptime:</span>
            <span className="text-foreground font-mono">{stats.uptime}</span>
          </div>
        </div>

        {/* Center Section - Service Status */}
        <div className="flex items-center gap-3">
          {connections.map((connection) => (
            <div key={connection.service} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                connection.status === "connected" ? "bg-success animate-pulse-glow" :
                connection.status === "error" ? "bg-error" :
                "bg-muted"
              }`} />
              <span className="text-muted-foreground">{connection.service}</span>
              {connection.status === "connected" && (
                <span className="text-xs text-success">({connection.latency})</span>
              )}
            </div>
          ))}
        </div>

        {/* Right Section - Time & Performance */}
        <div className="flex items-center gap-4">
          {/* Performance Indicator */}
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-muted-foreground">Real-time</span>
          </div>

          {/* Server Status */}
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <Badge className="bg-success text-white">
              <Zap className="w-3 h-3 mr-1" />
              Online
            </Badge>
          </div>

          {/* Current Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-mono">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};