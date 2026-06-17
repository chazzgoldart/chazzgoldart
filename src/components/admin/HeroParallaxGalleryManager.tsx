import { useState, useEffect } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ParallaxImage {
  id: string;
  image_url: string;
  title: string | null;
  display_order: number;
  speed: number;
}

export const HeroParallaxGalleryManager = () => {
  const [images, setImages] = useState<ParallaxImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_parallax_gallery')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      setMessage({ text: 'Failed to load images', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, order: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('hero-parallax')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-parallax')
        .getPublicUrl(filePath);

      const existingImage = images.find(img => img.display_order === order);

      if (existingImage) {
        const { error: updateError } = await supabase
          .from('hero_parallax_gallery')
          .update({
            image_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingImage.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('hero_parallax_gallery')
          .insert({
            image_url: publicUrl,
            display_order: order,
            speed: 0.5
          });

        if (insertError) throw insertError;
      }

      await fetchImages();
      setMessage({ text: 'Image uploaded successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading:', error);
      setMessage({ text: 'Failed to upload image', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (id: string, field: 'title' | 'speed', value: string | number) => {
    try {
      const { error } = await supabase
        .from('hero_parallax_gallery')
        .update({
          [field]: value,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchImages();
    } catch (error) {
      console.error('Error updating:', error);
      setMessage({ text: 'Failed to update image', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('hero-parallax').remove([fileName]);
      }

      const { error } = await supabase
        .from('hero_parallax_gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchImages();
      setMessage({ text: 'Image deleted successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage({ text: 'Failed to delete image', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg border-2 ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500 text-green-400'
            : 'bg-red-500/10 border-red-500 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-4">Hero Parallax Gallery (Max 7 Images)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5, 6].map((order) => {
          const image = images.find(img => img.display_order === order);

          return (
            <div key={order} className="glass-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Position {order + 1}</h3>
                {image && (
                  <button
                    onClick={() => handleDelete(image.id, image.image_url)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {image ? (
                <>
                  <img
                    src={image.image_url}
                    alt={image.title || `Position ${order + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={image.title || ''}
                      onChange={(e) => handleUpdate(image.id, 'title', e.target.value)}
                      placeholder="Image title (optional)"
                      className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <label className="text-gray-400 text-sm">Speed:</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={image.speed}
                        onChange={(e) => handleUpdate(image.id, 'speed', parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="block">
                    <span className="btn-primary text-center cursor-pointer flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4" />
                      Replace Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, order)}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </>
              ) : (
                <label className="block">
                  <div className="w-full h-48 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors">
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <span className="text-gray-400 text-sm">Upload Image</span>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, order)}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {uploading && (
        <div className="text-center text-cyan-400">
          Uploading...
        </div>
      )}
    </div>
  );
};
