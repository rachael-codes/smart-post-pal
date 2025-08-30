import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
console.log('OpenAI API Key available:', openAIApiKey ? 'Yes' : 'No');

if (!openAIApiKey) {
  console.error('CRITICAL: OPENAI_API_KEY environment variable is not set');
}

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
    console.log('Starting AI content generation...');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key is missing - cannot proceed');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AI service is not properly configured. Please contact support.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { topic, platform, tone, contentType } = await req.json();
    console.log('Request details:', { topic, platform, tone, contentType });

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

    console.log('Making request to OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error Details:', response.status, errorData);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `AI service error (${response.status}): ${errorData.slice(0, 200)}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI Response received:', { 
      hasChoices: !!data.choices, 
      choicesLength: data.choices?.length || 0 
    });

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', JSON.stringify(data, null, 2));
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Received invalid response from AI service' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let generatedContent;
    try {
      generatedContent = JSON.parse(data.choices[0].message.content);
      console.log('Parsed AI content:', Object.keys(generatedContent));
    } catch (parseError) {
      console.error('Failed to parse AI response:', data.choices[0].message.content);
      console.error('Parse error:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AI generated invalid response format. Please try again.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate the response structure
    if (!generatedContent.caption || !generatedContent.hashtags || !generatedContent.engagement_prediction) {
      console.error('Generated content missing required fields:', generatedContent);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AI generated incomplete content. Please try again.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully generated AI content');
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
    
  } catch (error: any) {
    console.error('Unexpected error in generate-ai-content function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unexpected error occurred while generating content' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});