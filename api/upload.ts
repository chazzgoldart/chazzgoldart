import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, filename } = request.body;

    if (!file || !filename) {
      return response.status(400).json({ error: 'Missing file or filename' });
    }

    // Convert base64 string to buffer
    const buffer = Buffer.from(file, 'base64');

    const blob = await put(filename, buffer, {
      access: 'public',
    });

    return response.status(200).json({
      url: blob.url,
      success: true,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return response.status(500).json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
