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

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Fetching metadata for URL:', url);

    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '').toLowerCase();
    
    // YouTube - use oEmbed (free, no API key)
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube metadata');
      }
      
      const data = await response.json();
      
      console.log('YouTube metadata fetched:', data.title);
      
      return new Response(
        JSON.stringify({
          title: data.title,
          description: `Watch "${data.title}" by ${data.author_name} on YouTube`,
          image: data.thumbnail_url,
          author: data.author_name
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Spotify - use oEmbed
    if (hostname.includes('spotify.com')) {
      const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Spotify metadata');
      }
      
      const data = await response.json();
      
      console.log('Spotify metadata fetched:', data.title);
      
      return new Response(
        JSON.stringify({
          title: data.title,
          description: `Listen on Spotify`,
          image: data.thumbnail_url,
          author: null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // SoundCloud - use oEmbed
    if (hostname.includes('soundcloud.com')) {
      const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch SoundCloud metadata');
      }
      
      const data = await response.json();
      
      console.log('SoundCloud metadata fetched:', data.title);
      
      return new Response(
        JSON.stringify({
          title: data.title,
          description: data.description || `Listen on SoundCloud`,
          image: data.thumbnail_url,
          author: data.author_name
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Generic URLs - parse HTML for Open Graph tags
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SquirrelBot/1.0; +https://squirrelshoppingapp.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }
    
    const html = await response.text();
    
    // Simple regex parsing for Open Graph tags
    const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
    const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
    
    // Fallback to HTML title tag
    const htmlTitleMatch = !titleMatch ? html.match(/<title[^>]*>([^<]*)<\/title>/i) : null;
    
    console.log('Generic URL metadata fetched:', titleMatch?.[1] || htmlTitleMatch?.[1]);
    
    return new Response(
      JSON.stringify({
        title: titleMatch?.[1] || htmlTitleMatch?.[1] || 'Untitled',
        description: descMatch?.[1] || `Content from ${hostname}`,
        image: imageMatch?.[1] || null,
        author: null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        title: 'Unable to fetch metadata',
        description: 'Please enter details manually',
        image: null
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
