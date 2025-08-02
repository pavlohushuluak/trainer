
import { supabase } from "@/integrations/supabase/client";

export const testSupabaseConnection = async () => {
  try {
    // Simple connection test
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      message: 'Supabase connection working properly'
    };
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

export const debugSupabaseConnection = async () => {
  const result = await testSupabaseConnection();
  
  return result;
};
