import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Wand2, 
  Settings, 
  Download, 
  Eye, 
  ChevronDown, 
  Shuffle, 
  Clock,
  Image as ImageIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  timestamp: Date;
  settings: {
    model: string;
    steps: number;
    cfg: number;
    sampler: string;
    resolution: string;
    seed: number;
  };
  status: "generating" | "completed" | "error";
}

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [settings, setSettings] = useState({
    model: "sdxl-1.0",
    steps: 20,
    cfg: 7,
    sampler: "DPM++ 2M Karras",
    resolution: "1024x1024",
    seed: -1,
  });

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([
    {
      id: "1",
      prompt: "A futuristic AI interface with glowing neural networks",
      url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=512&h=512&fit=crop",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      settings: { ...settings },
      status: "completed"
    },
    {
      id: "2", 
      prompt: "Digital art of a cyberpunk city at night",
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=512&h=512&fit=crop",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      settings: { ...settings },
      status: "completed"
    }
  ]);

  const models = [
    { id: "sdxl-1.0", name: "SDXL 1.0", type: "base" },
    { id: "sd-1.5", name: "Stable Diffusion 1.5", type: "base" },
    { id: "dreamshaper", name: "DreamShaper", type: "custom" },
    { id: "realistic-vision", name: "Realistic Vision", type: "custom" },
  ];

  const samplers = [
    "Euler a",
    "Euler",
    "DPM++ 2M Karras",
    "DPM++ SDE Karras",
    "DDIM",
  ];

  const resolutions = [
    "512x512",
    "768x768", 
    "1024x1024",
    "512x768",
    "768x512",
    "1024x768",
    "768x1024",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      prompt,
      url: "",
      timestamp: new Date(),
      settings: { ...settings },
      status: "generating"
    };

    setGeneratedImages(prev => [newImage, ...prev]);

    // Simulate generation process
    setTimeout(() => {
      setGeneratedImages(prev => 
        prev.map(img => 
          img.id === newImage.id 
            ? { 
                ...img, 
                url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=512&h=512&fit=crop`,
                status: "completed" as const
              }
            : img
        )
      );
      setIsGenerating(false);
    }, 3000);
  };

  const handleRandomSeed = () => {
    setSettings(prev => ({ ...prev, seed: Math.floor(Math.random() * 1000000) }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Generation Controls */}
      <div className="glass rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Image Generation</h2>
          <Badge className="bg-primary text-white">ComfyUI</Badge>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="min-h-[100px] glass border-glass-border resize-none"
          />
        </div>

        {/* Quick Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Model</label>
            <Select value={settings.model} onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}>
              <SelectTrigger className="glass border-glass-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-glass-border">
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {model.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Resolution</label>
            <Select value={settings.resolution} onValueChange={(value) => setSettings(prev => ({ ...prev, resolution: value }))}>
              <SelectTrigger className="glass border-glass-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-glass-border">
                {resolutions.map((res) => (
                  <SelectItem key={res} value={res}>{res}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Settings */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between glass border-glass-border">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Settings
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                isAdvancedOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Steps: {settings.steps}</label>
                <Slider
                  value={[settings.steps]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, steps: value }))}
                  min={10}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">CFG Scale: {settings.cfg}</label>
                <Slider
                  value={[settings.cfg]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, cfg: value }))}
                  min={1}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Sampler</label>
              <Select value={settings.sampler} onValueChange={(value) => setSettings(prev => ({ ...prev, sampler: value }))}>
                <SelectTrigger className="glass border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-glass-border">
                  {samplers.map((sampler) => (
                    <SelectItem key={sampler} value={sampler}>{sampler}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">Seed</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={settings.seed}
                    onChange={(e) => setSettings(prev => ({ ...prev, seed: parseInt(e.target.value) || -1 }))}
                    className="flex-1 h-10 px-3 glass border border-glass-border rounded-md text-sm"
                    placeholder="Random"
                  />
                  <Button onClick={handleRandomSeed} variant="outline" size="sm">
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full gradient-primary text-white h-12 text-base font-medium"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Generate Image
            </div>
          )}
        </Button>
      </div>

      {/* Generated Images Gallery */}
      <div className="glass rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Generated Images</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {generatedImages.length} images
          </div>
        </div>

        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="space-y-4">
            {generatedImages.map((image, index) => (
              <div
                key={image.id}
                className="glass border border-glass-border rounded-lg p-4 transition-smooth hover:bg-glass-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-4">
                  {/* Image Thumbnail */}
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                    {image.status === "generating" ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : image.url ? (
                      <img 
                        src={image.url} 
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {image.status === "completed" && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Image Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <span>{image.timestamp.toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>{image.settings.resolution}</span>
                      <span>•</span>
                      <span>{image.settings.steps} steps</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {image.settings.model}
                      </Badge>
                      {image.status === "generating" && (
                        <Badge className="bg-warning text-white text-xs">
                          Generating...
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {generatedImages.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No images generated yet</p>
                <p className="text-sm text-muted-foreground">Enter a prompt to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};