import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  console.log('=== OpenAI Test Function ===');
  console.log('API Key exists:', !!openAIApiKey);
  console.log('API Key preview:', openAIApiKey ? openAIApiKey.substring(0, 10) + '...' : 'null');
  
  return new Response(JSON.stringify({
    success: true,
    hasApiKey: !!openAIApiKey,
    keyPreview: openAIApiKey ? openAIApiKey.substring(0, 10) + '...' : null,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});