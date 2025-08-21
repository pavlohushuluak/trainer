import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
  postId: string;
  fileData: string; // Base64 encoded file data
}

interface UploadResponse {
  success: boolean;
  publicUrl?: string;
  filePath?: string;
  error?: string;
  message?: string;
}

// Helper function to convert base64 to Uint8Array efficiently
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Parse request body
    const { fileName, fileType, fileSize, userId, postId, fileData }: UploadRequest = await req.json()

    // Validate required fields
    if (!fileName || !fileType || !userId || !postId || !fileData) {
      throw new Error('Missing required fields: fileName, fileType, userId, postId, fileData')
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
    if (!allowedTypes.includes(fileType)) {
      throw new Error(`Invalid file type: ${fileType}. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (fileSize > maxSize) {
      throw new Error(`File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds limit (50MB)`)
    }

    // Generate file path
    const fileExtension = fileName.split('.').pop() || 'mp4'
    const filePath = `${userId}/${postId}/video.${fileExtension}`

    console.log('📁 Uploading file:', {
      fileName,
      fileType,
      fileSize: (fileSize / (1024 * 1024)).toFixed(1) + 'MB',
      filePath
    })

    // Convert base64 to buffer efficiently
    console.log('🔄 Converting base64 to buffer...')
    const fileBuffer = base64ToUint8Array(fileData)
    console.log('✅ Buffer conversion completed, size:', fileBuffer.length)

    // Create Supabase client with service role key
    const supabaseUrl = "https://vuzhlwyhcrsxqfysczsu.supabase.co"
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1emhsd3loY3JzeHFmeXNjenN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjU2NDQsImV4cCI6MjA2NTE0MTY0NH0.XXczMcxqEKgwNnRZOJmL02_FEcE5b3_by29qM1dYsX0"
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('📤 Uploading to Supabase storage...')
    const { data, error } = await supabase.storage
      .from('community-videos')
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        upsert: true
      })

    if (error) {
      console.error('❌ Supabase upload error:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    console.log('✅ File uploaded successfully:', data)

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from('community-videos')
      .getPublicUrl(filePath)

    const response: UploadResponse = {
      success: true,
      publicUrl: urlData.publicUrl,
      filePath,
      message: 'File uploaded successfully'
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Storage upload error:', error)
    
    const errorResponse: UploadResponse = {
      success: false,
      error: error.message
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
