import { useState } from "react";
import { ServiceDashboard } from "@/components/ServiceDashboard";
import { AIChat } from "@/components/AIChat";
import { ImageGenerator } from "@/components/ImageGenerator";
import { MediaCapture } from "@/components/MediaCapture";
import { QuickActions } from "@/components/QuickActions";
import { StatusBar } from "@/components/StatusBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Image, MessageSquare, Layers } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-background font-inter">
      <div className="flex h-screen">
        {/* Sidebar - Service Management */}
        <div className="w-80 glass border-r border-glass-border p-6 overflow-y-auto animate-slide-up">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AI Setup Manager</h1>
                <p className="text-sm text-muted-foreground">Professional AI Workbench</p>
              </div>
            </div>
          </div>
          
          <ServiceDashboard />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Quick Actions Bar */}
          <QuickActions />

          {/* Main Interface */}
          <div className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="glass mb-6">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="generate" className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Media
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="h-[calc(100%-4rem)]">
                <AIChat />
              </TabsContent>

              <TabsContent value="generate" className="h-[calc(100%-4rem)]">
                <ImageGenerator />
              </TabsContent>

              <TabsContent value="media" className="h-[calc(100%-4rem)]">
                <MediaCapture />
              </TabsContent>
            </Tabs>
          </div>

          {/* Status Bar */}
          <StatusBar />
        </div>
      </div>
    </div>
  );
};

export default Index;