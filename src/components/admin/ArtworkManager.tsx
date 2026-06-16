import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { FileUpload } from './FileUpload';

interface Artwork {
  id: string;
  title: string;
  series: string;
  chain: string;
  platform: string;
  media_type: 'image' | 'video';
  thumb_url: string;
  media_url: string;
  lore: string;
  collect_url: string;
  display_order: number;
  is_featured: boolean;
}

export const ArtworkManager = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Artwork>>({
    media_type: 'image',
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching artworks:', error);
    } else {
      setArtworks(data || []);
    }
    setLoading(false);
  };

  const handleMediaUpload = async (file: File, type: 'thumb' | 'media') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const bucket = type === 'thumb' ? 'artwork-thumbs' : 'artwork-media';

    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      bucket
    });

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('Upload failed: ' + uploadError.message + '\nFile type: ' + file.type);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.thumb_url) {
      alert('Please upload a thumbnail image before submitting.');
      return;
    }

    if (!formData.media_url) {
      alert('Please upload the main media file (image or video) before submitting.');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('artworks')
        .update(formData)
        .eq('id', editingId);

      if (error) {
        alert('Error updating artwork: ' + error.message);
      } else {
        setEditingId(null);
        setFormData({ media_type: 'image', is_featured: false, display_order: 0 });
        fetchArtworks();
      }
    } else {
      const { error } = await supabase.from('artworks').insert([formData]);

      if (error) {
        alert('Error creating artwork: ' + error.message);
      } else {
        setShowForm(false);
        setFormData({ media_type: 'image', is_featured: false, display_order: 0 });
        fetchArtworks();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    const { error } = await supabase.from('artworks').delete().eq('id', id);

    if (error) {
      alert('Error deleting artwork: ' + error.message);
    } else {
      fetchArtworks();
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setFormData(artwork);
    setEditingId(artwork.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ media_type: 'image', is_featured: false, display_order: 0 });
  };

  if (loading) {
    return <div className="text-center py-8">Loading artworks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Artworks</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add Artwork
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
              <label className="block text-sm font-semibold mb-2">Series</label>
              <input
                type="text"
                value={formData.series || ''}
                onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                required
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Chain</label>
              <input
                type="text"
                value={formData.chain || ''}
                onChange={(e) => setFormData({ ...formData, chain: e.target.value })}
                required
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Platform</label>
              <input
                type="text"
                value={formData.platform || ''}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                required
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Media Type</label>
              <select
                value={formData.media_type}
                onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' | 'video' })}
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
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
            <label className="block text-sm font-semibold mb-2">Thumbnail Image</label>
            <FileUpload
              bucket="artworks"
              accept="image/*"
              onUpload={async (file: File) => {
                const url = await handleMediaUpload(file, 'thumb');
                if (url) setFormData({ ...formData, thumb_url: url });
              }}
              currentUrl={formData.thumb_url}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              {formData.media_type === 'video' ? 'Video File' : 'Full Image'}
            </label>
            <FileUpload
              bucket="artworks"
              accept={formData.media_type === 'video' ? 'video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.mov,.webm,.avi' : 'image/*'}
              onUpload={async (file: File) => {
                const url = await handleMediaUpload(file, 'media');
                if (url) setFormData({ ...formData, media_url: url });
              }}
              currentUrl={formData.media_url}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Lore / Description</label>
            <textarea
              value={formData.lore || ''}
              onChange={(e) => setFormData({ ...formData, lore: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Collect URL</label>
            <input
              type="url"
              value={formData.collect_url || ''}
              onChange={(e) => setFormData({ ...formData, collect_url: e.target.value })}
              required
              className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.is_featured || false}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="featured" className="text-sm font-semibold">
              Featured Artwork
            </label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {artworks.map((artwork) => (
          <div key={artwork.id} className="glass-card rounded-xl p-4 group hover:border-cyan-400/50 transition-colors">
            <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-black/50">
              {artwork.media_type === 'video' ? (
                <video
                  src={artwork.media_url}
                  poster={artwork.thumb_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
              ) : (
                <img
                  src={artwork.thumb_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h3 className="font-bold mb-1 truncate">{artwork.title}</h3>
            <p className="text-sm text-gray-400 mb-2 truncate">{artwork.series}</p>
            <div className="flex gap-2 text-xs text-gray-500 mb-3">
              <span>{artwork.chain}</span>
              <span>•</span>
              <span>{artwork.platform}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(artwork)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 glass-card rounded-lg hover:border-cyan-400 transition-colors text-sm"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(artwork.id)}
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
