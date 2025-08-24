import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, platform, tone, contentType } = await req.json();

    console.log('AI Content Generation Request:', { topic, platform, tone, contentType });

    const systemPrompt = `You are an expert social media content creator. Generate engaging content for ${platform} posts.
    
    Return your response as a JSON object with these fields:
    - "caption": A compelling caption/text for the post
    - "hashtags": An array of relevant hashtags (without # symbols)
    - "engagement_prediction": A score from 1-100 estimating potential engagement
    
    Guidelines:
    - Keep captions appropriate for ${platform}
    - Use ${tone} tone
    - Include 5-15 relevant hashtags
    - Make content engaging and shareable`;

    const userPrompt = `Create ${contentType} content about: ${topic}
    
    Platform: ${platform}
    Tone: ${tone}
    
    Focus on creating content that will resonate with the target audience and encourage engagement.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', response.status, errorData);
      throw new Error(`OpenAI API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI Response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const generatedContent = JSON.parse(data.choices[0].message.content);

    // Validate the response structure
    if (!generatedContent.caption || !generatedContent.hashtags || !generatedContent.engagement_prediction) {
      throw new Error('Generated content missing required fields');
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        caption: generatedContent.caption,
        hashtags: generatedContent.hashtags,
        engagementPrediction: generatedContent.engagement_prediction
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-ai-content function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to generate content' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});