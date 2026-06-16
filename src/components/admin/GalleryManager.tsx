import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Save, X, MoveUp, MoveDown } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) setImages(data);
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('blog-media')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('blog-media')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editingId) {
        let image_url = null;
        if (imageFiles.length > 0) {
          image_url = await uploadFile(imageFiles[0]);
        }
        await supabase
          .from('gallery_images')
          .update({
            ...formData,
            ...(image_url ? { image_url } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
      } else {
        const startOrder = images.length;
        const imagesToInsert = [];

        for (let i = 0; i < imageFiles.length; i++) {
          const image_url = await uploadFile(imageFiles[i]);
          imagesToInsert.push({
            title: formData.title || null,
            description: formData.description || null,
            is_active: formData.is_active,
            image_url,
            display_order: startOrder + i,
          });
        }

        await supabase
          .from('gallery_images')
          .insert(imagesToInsert);
      }

      resetForm();
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setFormData({
      title: image.title || '',
      description: image.description || '',
      is_active: image.is_active,
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    fetchImages();
  };

  const moveImage = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    for (let i = 0; i < newImages.length; i++) {
      await supabase
        .from('gallery_images')
        .update({ display_order: i })
        .eq('id', newImages[i].id);
    }

    fetchImages();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      is_active: true,
    });
    setImageFiles([]);
    setIsCreating(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gallery Images</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-black rounded-lg hover:bg-neon-cyan/80 transition-colors"
          >
            <Plus size={20} />
            Add Image
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Edit Image' : 'Add New Image'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image{editingId ? ' (leave empty to keep current)' : 's (select multiple)'}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple={!editingId}
              onChange={(e) => setImageFiles(e.target.files ? Array.from(e.target.files) : [])}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              required={!editingId}
            />
            {imageFiles.length > 0 && (
              <p className="text-sm text-gray-400 mt-2">
                {imageFiles.length} file{imageFiles.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {!editingId && imageFiles.length > 1 ? (
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                Uploading {imageFiles.length} images. Title and description will be applied to all images.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="is_active" className="text-sm text-gray-300">
              Active (visible on gallery page)
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2 bg-neon-cyan text-black rounded-lg hover:bg-neon-cyan/80 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {uploading ? 'Uploading...' : editingId ? 'Update Image' : imageFiles.length > 1 ? `Add ${imageFiles.length} Images` : 'Add Image'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            <div className="aspect-square relative">
              <img
                src={image.image_url}
                alt={image.title || ''}
                className="w-full h-full object-cover"
              />
              {!image.is_active && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Hidden
                </div>
              )}
            </div>
            <div className="p-4">
              {image.title && (
                <h3 className="text-white font-bold mb-1">{image.title}</h3>
              )}
              {image.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {image.description}
                </p>
              )}
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => moveImage(image.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <MoveUp size={16} />
                  </button>
                  <button
                    onClick={() => moveImage(image.id, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <MoveDown size={16} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && !isCreating && (
        <div className="text-center py-12 text-gray-400">
          No images in gallery. Click "Add Image" to get started.
        </div>
      )}
    </div>
  );
};
