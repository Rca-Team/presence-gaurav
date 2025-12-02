import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FaceBox {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

interface RecognitionRequest {
  imageData: string; // base64
  faces: Array<{ id: string; boundingBox: FaceBox }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');

    if (!hfToken) {
      throw new Error('HuggingFace token not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { imageData, faces } = await req.json() as RecognitionRequest;

    console.log(`Processing ${faces.length} faces for recognition`);

    // Convert base64 to image buffer
    const base64Data = imageData.split(',')[1];
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Decode image to get dimensions
    const image = await decodeImage(imageBuffer);

    const recognitionResults = [];

    for (const face of faces) {
      try {
        // Crop face from image
        const croppedFace = cropFace(image, face.boundingBox);
        
        // Get embedding from HuggingFace InsightFace
        const embedding = await getEmbedding(croppedFace, hfToken);
        
        // Compare with stored embeddings
        const match = await findMatch(supabase, embedding);
        
        recognitionResults.push({
          faceId: face.id,
          recognized: match !== null,
          userId: match?.user_id || null,
          username: match?.username || null,
          confidence: match?.confidence || 0,
          embedding: Array.from(embedding)
        });
      } catch (error) {
        console.error(`Error processing face ${face.id}:`, error);
        recognitionResults.push({
          faceId: face.id,
          recognized: false,
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ results: recognitionResults }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Face recognition error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function decodeImage(buffer: Uint8Array): Promise<ImageData> {
  // Simple JPEG/PNG decoder - in production, use proper image library
  // For now, we'll pass the buffer directly to HuggingFace
  return {
    data: buffer,
    width: 0,
    height: 0
  } as any;
}

function cropFace(image: any, box: FaceBox): Uint8Array {
  // In production, properly crop the image
  // For now, return the full image and let HuggingFace handle it
  return image.data;
}

async function getEmbedding(imageData: Uint8Array, hfToken: string): Promise<Float32Array> {
  // Using InsightFace model from HuggingFace
  const response = await fetch(
    'https://api-inference.huggingface.co/models/adept/insightface',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/octet-stream',
      },
      body: imageData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('HuggingFace API error:', response.status, errorText);
    throw new Error(`HuggingFace API error: ${response.status}`);
  }

  const result = await response.json();
  
  // HuggingFace returns embeddings in different formats
  // Handle both array and nested array formats
  let embedding: number[];
  if (Array.isArray(result)) {
    embedding = Array.isArray(result[0]) ? result[0] : result;
  } else if (result.embeddings) {
    embedding = Array.isArray(result.embeddings[0]) ? result.embeddings[0] : result.embeddings;
  } else {
    throw new Error('Unexpected embedding format from HuggingFace');
  }

  return new Float32Array(embedding);
}

async function findMatch(
  supabase: any,
  queryEmbedding: Float32Array
): Promise<{ user_id: string; username: string; confidence: number } | null> {
  const SIMILARITY_THRESHOLD = 0.6;

  // Fetch all registered face embeddings
  const { data: records, error } = await supabase
    .from('attendance_records')
    .select('user_id, face_descriptor')
    .in('status', ['registered', 'pending_approval'])
    .not('face_descriptor', 'is', null);

  if (error) {
    console.error('Database query error:', error);
    throw error;
  }

  if (!records || records.length === 0) {
    console.log('No registered faces found');
    return null;
  }

  let bestMatch: { user_id: string; similarity: number } | null = null;

  for (const record of records) {
    try {
      const storedEmbedding = JSON.parse(record.face_descriptor);
      const similarity = cosineSimilarity(queryEmbedding, new Float32Array(storedEmbedding));

      if (similarity > SIMILARITY_THRESHOLD && (!bestMatch || similarity > bestMatch.similarity)) {
        bestMatch = { user_id: record.user_id, similarity };
      }
    } catch (e) {
      console.error('Error parsing embedding:', e);
    }
  }

  if (!bestMatch) {
    return null;
  }

  // Get username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('user_id', bestMatch.user_id)
    .single();

  return {
    user_id: bestMatch.user_id,
    username: profile?.username || 'Unknown',
    confidence: bestMatch.similarity
  };
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
