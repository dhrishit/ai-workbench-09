-- Create services table for managing AI services
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'llm', 'image_generator', 'interface'
  status TEXT NOT NULL DEFAULT 'stopped', -- 'running', 'stopped', 'error', 'starting', 'stopping'
  port INTEGER,
  description TEXT,
  auto_start BOOLEAN DEFAULT false,
  process_id TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a local AI setup)
CREATE POLICY "Services are publicly readable" 
ON public.services 
FOR SELECT 
USING (true);

CREATE POLICY "Services are publicly writable" 
ON public.services 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default AI services
INSERT INTO public.services (name, type, status, port, description, auto_start) VALUES
('Ollama', 'llm', 'stopped', 11434, 'Local LLM inference server for running language models', true),
('ComfyUI', 'image_generator', 'stopped', 8188, 'Node-based interface for Stable Diffusion workflows', false),
('Open WebUI', 'interface', 'stopped', 3000, 'Web interface for interacting with local LLMs', false);

-- Create system_stats table for real-time monitoring
CREATE TABLE public.system_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cpu_usage DECIMAL(5,2) DEFAULT 0,
  memory_usage DECIMAL(5,2) DEFAULT 0,
  disk_usage DECIMAL(5,2) DEFAULT 0,
  active_connections INTEGER DEFAULT 0,
  uptime_seconds INTEGER DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for system_stats
ALTER TABLE public.system_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for system_stats
CREATE POLICY "System stats are publicly readable" 
ON public.system_stats 
FOR SELECT 
USING (true);

CREATE POLICY "System stats are publicly writable" 
ON public.system_stats 
FOR ALL 
USING (true);

-- Insert initial system stats
INSERT INTO public.system_stats (cpu_usage, memory_usage, disk_usage, active_connections, uptime_seconds) 
VALUES (15.2, 68.4, 42.1, 12, 3600);