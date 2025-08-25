import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Twitter API credentials
const TWITTER_CONSUMER_KEY = Deno.env.get("TWITTER_CONSUMER_KEY")?.trim();
const TWITTER_CONSUMER_SECRET = Deno.env.get("TWITTER_CONSUMER_SECRET")?.trim();
const TWITTER_ACCESS_TOKEN = Deno.env.get("TWITTER_ACCESS_TOKEN")?.trim();
const TWITTER_ACCESS_TOKEN_SECRET = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET")?.trim();

// Supabase
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function validateTwitterCredentials() {
  if (!TWITTER_CONSUMER_KEY) {
    throw new Error("Missing TWITTER_CONSUMER_KEY environment variable");
  }
  if (!TWITTER_CONSUMER_SECRET) {
    throw new Error("Missing TWITTER_CONSUMER_SECRET environment variable");
  }
  if (!TWITTER_ACCESS_TOKEN) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN environment variable");
  }
  if (!TWITTER_ACCESS_TOKEN_SECRET) {
    throw new Error("Missing TWITTER_ACCESS_TOKEN_SECRET environment variable");
  }
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(
    url
  )}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(
    consumerSecret
  )}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");

  console.log("Signature Base String:", signatureBaseString);
  console.log("Signing Key:", signingKey);
  console.log("Generated Signature:", signature);

  return signature;
}

function generateOAuthHeader(method: string, url: string): string {
  const oauthParams = {
    oauth_consumer_key: TWITTER_CONSUMER_KEY!,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: TWITTER_ACCESS_TOKEN!,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(
    method,
    url,
    oauthParams,
    TWITTER_CONSUMER_SECRET!,
    TWITTER_ACCESS_TOKEN_SECRET!
  );

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    "OAuth " +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function sendTweet(tweetText: string): Promise<any> {
  const url = "https://api.x.com/2/tweets";
  const method = "POST";
  const params = { text: tweetText };

  const oauthHeader = generateOAuthHeader(method, url);
  console.log("OAuth Header:", oauthHeader);

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: oauthHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const responseText = await response.text();
  console.log("Response Body:", responseText);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, body: ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

async function publishPost(postId: string, platform: string, content: string, hashtags: string[]) {
  console.log(`Publishing post ${postId} to ${platform}`);
  
  // Prepare content with hashtags
  let finalContent = content;
  if (hashtags && hashtags.length > 0) {
    finalContent += '\n\n' + hashtags.map(tag => `#${tag}`).join(' ');
  }

  try {
    let result;
    
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'twitter/x':
        validateTwitterCredentials();
        result = await sendTweet(finalContent);
        break;
      case 'linkedin':
        // LinkedIn API integration would go here
        throw new Error('LinkedIn publishing not yet implemented. Please connect your LinkedIn API credentials.');
      case 'facebook':
        // Facebook API integration would go here
        throw new Error('Facebook publishing not yet implemented. Please connect your Facebook API credentials.');
      case 'instagram':
        // Instagram API integration would go here
        throw new Error('Instagram publishing not yet implemented. Please connect your Instagram API credentials.');
      case 'tiktok':
        // TikTok API integration would go here
        throw new Error('TikTok publishing not yet implemented. Please connect your TikTok API credentials.');
      case 'youtube':
        // YouTube API integration would go here
        throw new Error('YouTube publishing not yet implemented. Please connect your YouTube API credentials.');
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Update post status to published
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post status:', updateError);
    }

    return { success: true, result, platform };
  } catch (error) {
    console.error(`Error publishing to ${platform}:`, error);
    
    // Update post status to failed
    const { error: updateError } = await supabase
      .from('posts')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post status:', updateError);
    }

    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postId, platform, content, hashtags } = await req.json();

    if (!postId || !platform || !content) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: postId, platform, and content are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await publishPost(postId, platform, content, hashtags || []);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in publish-post function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});