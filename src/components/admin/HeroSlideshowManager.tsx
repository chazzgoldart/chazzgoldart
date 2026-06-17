import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Save, X, GripVertical } from 'lucide-react';
import { FileUpload } from './FileUpload';

interface HeroImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export const HeroSlideshowManager = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slideshow_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      alert('Please upload an image');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('hero_slideshow_images')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hero_slideshow_images')
          .insert([formData]);

        if (error) throw error;
      }

      setFormData({
        image_url: '',
        title: '',
        description: '',
        display_order: 0,
        is_active: true,
      });
      setShowAddForm(false);
      setEditingId(null);
      fetchImages();
    } catch (error) {
      console.error('Error saving hero image:', error);
      alert('Failed to save image. Please try again.');
    }
  };

  const handleEdit = (image: HeroImage) => {
    setFormData({
      image_url: image.image_url,
      title: image.title || '',
      description: image.description || '',
      display_order: image.display_order,
      is_active: image.is_active,
    });
    setEditingId(image.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await supabase
        .from('hero_slideshow_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchImages();
    } catch (error) {
      console.error('Error deleting hero image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({
      image_url: '',
      title: '',
      description: '',
      display_order: 0,
      is_active: true,
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Hero Slideshow Manager</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h3 className="text-xl font-semibold text-white">
            {editingId ? 'Edit Image' : 'Add New Image'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image
            </label>
            <FileUpload
              accept="image/*"
              onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
              currentUrl={formData.image_url}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Enter image title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Enter image description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              min="0"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-black/50"
            />
            <label htmlFor="is_active" className="text-sm text-gray-300">
              Active
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="glass-card p-4 flex items-start gap-4"
          >
            <GripVertical className="w-5 h-5 text-gray-500 mt-2 flex-shrink-0" />

            <img
              src={image.image_url}
              alt={image.title || 'Hero image'}
              className="w-32 h-20 object-cover rounded flex-shrink-0"
            />

            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-semibold">
                    {image.title || 'Untitled'}
                  </h4>
                  {image.description && (
                    <p className="text-sm text-gray-400 mt-1">{image.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500">Order: {image.display_order}</span>
                    <span className={`text-xs ${image.is_active ? 'text-green-400' : 'text-gray-500'}`}>
                      {image.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 text-pink-400 hover:bg-pink-400/10 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {images.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No images yet. Add your first hero slideshow image.
          </div>
        )}
      </div>
    </div>
  );
};
