import { useState, useEffect } from 'react';
import { Upload, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FileUpload } from './FileUpload';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
}

export const GallerySlideshowManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_slideshow_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (url: string) => {
    setUploading(true);
    try {
      const maxOrder = images.length > 0
        ? Math.max(...images.map(img => img.display_order))
        : -1;

      const { error } = await supabase
        .from('gallery_slideshow_images')
        .insert({
          image_url: url,
          display_order: maxOrder + 1
        });

      if (error) throw error;
      await fetchImages();
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const { error } = await supabase
        .from('gallery_slideshow_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const startEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setEditForm({
      title: image.title || '',
      description: image.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '' });
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery_slideshow_images')
        .update({
          title: editForm.title || null,
          description: editForm.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await fetchImages();
      cancelEdit();
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Failed to update image');
    }
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updates = [
      { id: images[currentIndex].id, display_order: images[targetIndex].display_order },
      { id: images[targetIndex].id, display_order: images[currentIndex].display_order }
    ];

    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('gallery_slideshow_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }
      await fetchImages();
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('Failed to reorder images');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Gallery Slideshow Manager</h2>
        <p className="text-gray-400 mb-6">
          Manage images for the gallery slideshow section (up to 25-30 images recommended)
        </p>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4">Upload New Image</h3>
        <FileUpload
          bucket="gallery-slideshow"
          onUploadComplete={handleUpload}
          accept="image/*"
          disabled={uploading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="glass-card overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={image.image_url}
                alt={image.title || 'Gallery image'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 space-y-3">
              {editingId === image.id ? (
                <>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Title (optional)"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description (optional)"
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(image.id)}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {image.title && (
                    <h4 className="font-semibold">{image.title}</h4>
                  )}
                  {image.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{image.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(image)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                    >
                      Edit Info
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => moveImage(image.id, 'up')}
                  disabled={index === 0}
                  className="flex-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                >
                  ↑ Move Up
                </button>
                <button
                  onClick={() => moveImage(image.id, 'down')}
                  disabled={index === images.length - 1}
                  className="flex-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                >
                  ↓ Move Down
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 glass-card">
          <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400">No images yet. Upload your first image above.</p>
        </div>
      )}
    </div>
  );
};
