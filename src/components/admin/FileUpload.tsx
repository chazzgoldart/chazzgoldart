import { useState, useRef, useEffect } from 'react';
import { Upload, X, Check } from 'lucide-react';

interface FileUploadProps {
  accept: string;
  bucket: string;
  onUploadComplete?: (url: string) => void;
  onFileUploaded?: (url: string) => void;
  onUpload?: (file: File) => Promise<void>;
  currentUrl?: string;
  disabled?: boolean;
}

export const FileUpload = ({ accept, bucket, onUploadComplete, onFileUploaded, onUpload, currentUrl, disabled }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

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
    if (files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    const maxSize = 50 * 1024 * 1024;

    if (file.size > maxSize) {
      alert('File size exceeds 50 MB limit. Please compress your video or use a smaller file.');
      return;
    }

    setUploading(true);

    try {
      if (onUpload) {
        await onUpload(file);
        setUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      // Convert file to base64 for API
      const fileBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(fileBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      // Upload via Vercel API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          filename: fileName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const { url } = await response.json();

      if (onUploadComplete) {
        onUploadComplete(url);
      }
      if (onFileUploaded) {
        onFileUploaded(url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (error && typeof error === 'object' && 'message' in error) {
        alert(`Upload failed: ${error.message}`);
      } else {
        alert('Upload failed. Please try again.');
      }
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isVideo = accept.includes('video');

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isDragging
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-gray-700 hover:border-gray-600 bg-black/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            <p className="text-sm text-gray-400">Uploading...</p>
          </div>
        ) : preview ? (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span className="text-sm">Uploaded</span>
            </div>
            {isVideo ? (
              <video src={preview} className="max-h-32 mx-auto rounded" controls />
            ) : (
              <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm text-gray-400">
              Drag and drop {isVideo ? 'video' : 'image'} here or click to browse
            </p>
            {isVideo && (
              <p className="text-xs text-gray-500">
                MP4, WebM, MOV, or AVI • Max 50 MB
              </p>
            )}
          </div>
        )}
      </div>

      {preview && !uploading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm glass-card rounded-lg hover:border-pink-500 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
};
