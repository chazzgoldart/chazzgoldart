import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { Upload, X } from 'lucide-react';

interface EventPhotoUploaderProps {
  event: Event;
  onPhotoUploaded: () => void;
}

export default function EventPhotoUploader({ event, onPhotoUploaded }: EventPhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await uploadFile(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        await uploadFile(file);
      }
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isVideo && !isImage) {
        alert('Please upload only images or videos');
        setUploading(false);
        return;
      }

      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        alert('File size exceeds 100 MB limit');
        setUploading(false);
        return;
      }

      // Use blog-media bucket which has no MIME type restrictions
      const fileExt = file.name.split('.').pop();
      const fileName = `events/${event.id}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('blog-media')
        .getPublicUrl(fileName);

      // Save photo record to database
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          event_id: event.id,
          image_url: publicUrl,
          thumbnail_url: publicUrl,
          original_filename: file.name,
          is_visible: event.auto_approve_photos,
          taken_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database error:', dbError);
        alert('Failed to save photo record');
        setUploading(false);
        return;
      }

      alert('Photo uploaded successfully!');
      onPhotoUploaded();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 mt-4">
      <h4 className="text-white font-semibold mb-3">Upload Photos/Videos</h4>
      
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="photo-input"
      />

      <label
        htmlFor="photo-input"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isDragging
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        {uploading ? (
          <div className="text-gray-300">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400 mb-2" />
            <p className="text-sm">Uploading...</p>
          </div>
        ) : (
          <div className="text-gray-400">
            <Upload className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Drag and drop photos/videos here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">Max 100 MB per file</p>
          </div>
        )}
      </label>
    </div>
  );
}
