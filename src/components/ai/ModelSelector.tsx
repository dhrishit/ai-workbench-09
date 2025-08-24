import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AIModel } from "@/types/chat";

interface ModelSelectorProps {
  models: AIModel[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  className?: string;
}

export const ModelSelector = ({ 
  models, 
  selectedModel, 
  onModelChange, 
  className 
}: ModelSelectorProps) => {
  const getModelBadgeColor = (type: string) => {
    switch (type) {
      case "vision": return "bg-primary-purple text-white";
      case "code": return "bg-success text-white";
      case "multimodal": return "bg-gradient-to-r from-primary to-secondary text-white";
      default: return "bg-primary text-white";
    }
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="text-sm text-muted-foreground">Model:</span>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-48 glass border-glass-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="glass border-glass-border">
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center gap-2">
                <span>{model.name}</span>
                <Badge className={cn("text-xs", getModelBadgeColor(model.type))}>
                  {model.type}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};