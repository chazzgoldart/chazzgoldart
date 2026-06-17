import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileUpload } from './FileUpload';
import { Edit2, Trash2, X, Save, Plus } from 'lucide-react';

interface SlideshowImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export const SlideshowManager = () => {
  const [images, setImages] = useState<SlideshowImage[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    description: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase
      .from('slideshow_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) setImages(data);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      image_url: '',
      title: '',
      description: '',
      display_order: images.length,
      is_active: true
    });
  };

  const handleEdit = (image: SlideshowImage) => {
    setEditingId(image.id);
    setFormData({
      image_url: image.image_url,
      title: image.title || '',
      description: image.description || '',
      display_order: image.display_order,
      is_active: image.is_active
    });
  };

  const handleSave = async () => {
    if (!formData.image_url) {
      alert('Please upload an image');
      return;
    }

    if (isAdding) {
      await supabase.from('slideshow_images').insert([{
        ...formData,
        title: formData.title || null,
        description: formData.description || null
      }]);
    } else if (editingId) {
      await supabase.from('slideshow_images').update({
        ...formData,
        title: formData.title || null,
        description: formData.description || null
      }).eq('id', editingId);
    }

    setIsAdding(false);
    setEditingId(null);
    fetchImages();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      await supabase.from('slideshow_images').delete().eq('id', id);
      fetchImages();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleFileUploaded = (url: string) => {
    setFormData({ ...formData, image_url: url });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Slideshow Manager</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-neon-cyan text-black rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Image
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-xl font-bold mb-4">{isAdding ? 'Add New Image' : 'Edit Image'}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <FileUpload
                onFileUploaded={handleFileUploaded}
                accept="image/*,video/*"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title (optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 focus:border-neon-cyan outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 focus:border-neon-cyan outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-600 rounded border border-gray-500 focus:border-neon-cyan outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Active</label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="bg-gray-700 rounded-lg p-4">
            <img src={image.image_url} alt={image.title || 'Slideshow image'} className="w-full h-48 object-cover rounded mb-3" />

            <div className="space-y-2">
              {image.title && <h3 className="font-bold">{image.title}</h3>}
              {image.description && <p className="text-sm text-gray-300">{image.description}</p>}
              <p className="text-xs text-gray-400">Order: {image.display_order}</p>
              <p className="text-xs">
                <span className={`px-2 py-1 rounded ${image.is_active ? 'bg-green-600' : 'bg-red-600'}`}>
                  {image.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(image)}
                className="flex-1 px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(image.id)}
                className="flex-1 px-3 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
