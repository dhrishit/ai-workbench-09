import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Mic, 
  Clipboard, 
  Zap,
  Monitor,
  MessageSquare,
  Settings,
  Search
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const QuickActions = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      id: "screenshot-ai",
      icon: Monitor,
      label: "Screenshot + AI",
      description: "Capture screen and analyze with AI",
      hotkey: "Ctrl+Shift+S",
      color: "bg-primary text-white"
    },
    {
      id: "voice-ai",
      icon: Mic,
      label: "Voice to AI", 
      description: "Record voice and send to AI",
      hotkey: "Ctrl+Shift+V",
      color: "bg-success text-white"
    },
    {
      id: "clipboard-ai",
      icon: Clipboard,
      label: "Clipboard AI",
      description: "Analyze clipboard content",
      hotkey: "Ctrl+Shift+C",
      color: "bg-warning text-white"
    },
    {
      id: "quick-chat",
      icon: MessageSquare,
      label: "Quick Chat",
      description: "Open quick AI chat",
      hotkey: "Ctrl+Space",
      color: "bg-primary-purple text-white"
    }
  ];

  const handleQuickAction = (actionId: string) => {
    console.log(`Executing quick action: ${actionId}`);
    // Here you would implement the actual quick action logic
  };

  return (
    <div className="glass border-b border-glass-border p-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Quick Actions</span>
          </div>
          
          <div className="h-4 w-px bg-glass-border mx-2" />
          
          <div className="flex items-center gap-1">
            {quickActions.slice(0, isExpanded ? quickActions.length : 3).map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-3 transition-all hover:scale-105",
                    "group relative overflow-hidden"
                  )}
                  title={`${action.description} (${action.hotkey})`}
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity",
                    action.color.replace('text-white', '')
                  )} />
                  <Icon className="w-4 h-4 mr-1" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              );
            })}
            
            {quickActions.length > 3 && (
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="h-8 px-2"
              >
                <span className="text-xs">
                  {isExpanded ? "Less" : `+${quickActions.length - 3}`}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Right Side - Global Controls */}
        <div className="flex items-center gap-2">
          {/* Global Search */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 px-3">
              <Search className="w-4 h-4 mr-1" />
              <span className="text-xs">Search</span>
            </Button>
          </div>
          
          {/* Settings */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">Connected</span>
          </div>
        </div>
      </div>

      {/* Hotkey Hints */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-glass-border animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleQuickAction(action.id)}
              >
                <div className={cn("w-6 h-6 rounded flex items-center justify-center", action.color)}>
                  <action.icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {action.hotkey}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};