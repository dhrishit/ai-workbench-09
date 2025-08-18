import { ServiceCard } from "./ServiceCard";
import { Button } from "./ui/button";
import { Play, Square, RotateCcw } from "lucide-react";
import { useServices } from "@/hooks/useServices";
import { useToast } from "@/hooks/use-toast";

export const ServiceDashboard = () => {
  const { services, loading, updateServiceStatus, updateServiceAutoStart } = useServices();
  const { toast } = useToast();

  const handleServiceAction = async (serviceId: string, action: "start" | "stop" | "restart") => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    let newStatus: typeof service.status;
    let processId: string | undefined;

    // Set intermediate status
    if (action === "start") {
      newStatus = "starting";
    } else if (action === "stop") {
      newStatus = "stopping";
    } else {
      newStatus = "starting"; // restart goes through starting
    }

    // Update status immediately for UI feedback
    await updateServiceStatus(serviceId, newStatus);

    // Simulate service management delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Set final status
    if (action === "start" || action === "restart") {
      newStatus = "running";
      processId = Math.random().toString(36).substring(7);
    } else {
      newStatus = "stopped";
      processId = undefined;
    }

    const result = await updateServiceStatus(serviceId, newStatus, processId);
    
    if (result.success) {
      toast({
        title: "Success",
        description: `${service.name} ${action === "start" ? "started" : action === "stop" ? "stopped" : "restarted"} successfully`,
      });
    }
  };

  const handleStartAll = async () => {
    const stoppedServices = services.filter(s => s.status === "stopped");
    
    for (const service of stoppedServices) {
      await handleServiceAction(service.id, "start");
      // Small delay between starting services
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleStopAll = async () => {
    const runningServices = services.filter(s => s.status === "running");
    
    for (const service of runningServices) {
      await handleServiceAction(service.id, "stop");
      // Small delay between stopping services
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-glass animate-pulse rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-glass animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

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
            className="flex-1 bg-success hover:bg-success/90"
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
              key={service.id}
              service={service}
              onAction={handleServiceAction}
              onAutoStartChange={(autoStart) => updateServiceAutoStart(service.id, autoStart)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};