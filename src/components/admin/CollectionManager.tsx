import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { FileUpload } from './FileUpload';

interface Collection {
  id: string;
  title: string;
  tagline: string;
  image_url: string;
  url: string;
  display_order: number;
  media_type: 'image' | 'video';
}

export const CollectionManager = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Collection>>({ display_order: 0, media_type: 'image' });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching collections:', error);
    } else {
      setCollections(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('collections')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error('Upload failed: ' + uploadError.message);
    }

    const { data } = supabase.storage.from('collections').getPublicUrl(fileName);
    setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('collections')
        .update(formData)
        .eq('id', editingId);

      if (error) {
        alert('Error updating collection: ' + error.message);
      } else {
        handleCancel();
        fetchCollections();
      }
    } else {
      const { error } = await supabase.from('collections').insert([formData]);

      if (error) {
        alert('Error creating collection: ' + error.message);
      } else {
        handleCancel();
        fetchCollections();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const { error } = await supabase.from('collections').delete().eq('id', id);

    if (error) {
      alert('Error deleting collection: ' + error.message);
    } else {
      fetchCollections();
    }
  };

  const handleEdit = (collection: Collection) => {
    setFormData(collection);
    setEditingId(collection.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ display_order: 0, media_type: 'image' });
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Collections</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add Collection
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 glass-card rounded-xl border border-cyan-400/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tagline</label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              required
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Media Type</label>
            <select
              value={formData.media_type || 'image'}
              onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' | 'video' })}
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Collection {formData.media_type === 'video' ? 'Video' : 'Image'}
            </label>
            <FileUpload
              accept={formData.media_type === 'video' ? 'video/*' : 'image/*'}
              onUpload={handleImageUpload}
              currentUrl={formData.image_url}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">URL</label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-full hover:border-pink-500 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collections.map((collection) => (
          <div key={collection.id} className="glass-card rounded-xl p-4 hover:border-cyan-400/50 transition-colors">
            <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-black/50">
              {collection.media_type === 'video' ? (
                <video
                  src={collection.image_url}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={collection.image_url}
                  alt={collection.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h3 className="font-bold mb-1">{collection.title}</h3>
            <p className="text-sm text-gray-400 mb-2">{collection.tagline}</p>
            <p className="text-xs text-gray-500 mb-1 truncate">{collection.url}</p>
            <p className="text-xs text-gray-500 mb-3">Type: {collection.media_type}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(collection)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 glass-card rounded-lg hover:border-cyan-400 transition-colors text-sm"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(collection.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 glass-card rounded-lg hover:border-pink-500 transition-colors text-sm"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
