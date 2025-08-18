import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  port?: number;
  description?: string;
  auto_start: boolean;
  process_id?: string;
  config?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      const typedData: Service[] = (data || []).map(item => ({
        ...item,
        status: item.status as Service['status'],
        config: item.config as Record<string, any> || {},
        auto_start: item.auto_start || false,
        port: item.port || undefined,
        process_id: item.process_id || undefined,
        description: item.description || undefined
      }));
      setServices(typedData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateServiceStatus = async (serviceId: string, status: Service['status'], processId?: string) => {
    try {
      const updateData: any = { status };
      if (processId) updateData.process_id = processId;

      const { error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, status, process_id: processId || service.process_id }
          : service
      ));

      return { success: true };
    } catch (error) {
      console.error('Error updating service status:', error);
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateServiceAutoStart = async (serviceId: string, autoStart: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ auto_start: autoStart })
        .eq('id', serviceId);

      if (error) throw error;

      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, auto_start: autoStart }
          : service
      ));

      return { success: true };
    } catch (error) {
      console.error('Error updating auto-start:', error);
      toast({
        title: "Error",
        description: "Failed to update auto-start setting",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchServices();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('services-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'services'
        },
        (payload) => {
          console.log('Service changed:', payload);
          fetchServices(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    services,
    loading,
    updateServiceStatus,
    updateServiceAutoStart,
    refetch: fetchServices
  };
};