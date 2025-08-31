import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    console.log('=== AI Content Generation Function (Google Gemini) ===');
    console.log('Google Gemini API Key available:', !!geminiApiKey);
    
    if (!geminiApiKey) {
      console.error('CRITICAL: Google Gemini API key not found in environment');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'AI service is not configured. Please check your Google Gemini API key in project settings.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { topic, platform, tone, contentType } = await req.json();
    console.log('Request details:', { topic, platform, tone, contentType });

    const prompt = `You are an expert social media content creator. Generate engaging content for ${platform} posts.

Create ${contentType} content about: ${topic}

Platform: ${platform}
Tone: ${tone}

Return your response as a JSON object with these fields:
- "caption": A compelling caption/text for the post
- "hashtags": An array of relevant hashtags (without # symbols)
- "engagement_prediction": A score from 1-100 estimating potential engagement

Guidelines:
- Keep captions appropriate for ${platform}
- Use ${tone} tone
- Include 5-15 relevant hashtags
- Make content engaging and shareable
- Focus on creating content that will resonate with the target audience and encourage engagement.

Return ONLY valid JSON, no other text.`;

    console.log('Making request to Google Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    console.log('Google Gemini response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Gemini API Error Details:', response.status, errorData);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `AI service error (${response.status}): ${errorData.slice(0, 200)}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Google Gemini Response received:', { 
      hasCandidates: !!data.candidates, 
      candidatesLength: data.candidates?.length || 0 
    });

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('Invalid Google Gemini response structure:', JSON.stringify(data, null, 2));
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Received invalid response from AI service' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', responseText);

    let generatedContent;
    try {
      // Clean up the response text to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText;
      generatedContent = JSON.parse(jsonText);
      console.log('Parsed AI content:', Object.keys(generatedContent));
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
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