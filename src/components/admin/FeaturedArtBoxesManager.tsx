import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface FeaturedArtBox {
  id: string;
  title: string;
  series: string;
  platform: string;
  media_type: 'image' | 'video';
  media_url: string;
  collect_url: string;
  display_order: number;
}

export const FeaturedArtBoxesManager = () => {
  const [boxes, setBoxes] = useState<FeaturedArtBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    series: '',
    platform: '',
    media_type: 'image' as 'image' | 'video',
    media_url: '',
    collect_url: '',
  });

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('id, title, series, platform, media_type, media_url, collect_url, display_order')
        .order('display_order')
        .limit(3);

      if (error) throw error;
      setBoxes(data || []);
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const maxOrder = boxes.length > 0 ? Math.max(...boxes.map(b => b.display_order)) : -1;

      const { error } = await supabase
        .from('artworks')
        .insert([{
          ...formData,
          display_order: maxOrder + 1,
          chain: 'Solana',
          thumb_url: formData.media_url,
          lore: '',
          is_featured: false,
        }]);

      if (error) throw error;

      setFormData({
        title: '',
        series: '',
        platform: '',
        media_type: 'image',
        media_url: '',
        collect_url: '',
      });
      setShowAddForm(false);
      fetchBoxes();
    } catch (error) {
      console.error('Error adding box:', error);
      alert('Failed to add box');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const box = boxes.find(b => b.id === id);
      if (!box) return;

      const { error } = await supabase
        .from('artworks')
        .update({
          title: box.title,
          series: box.series,
          platform: box.platform,
          media_type: box.media_type,
          media_url: box.media_url,
          collect_url: box.collect_url,
        })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      fetchBoxes();
    } catch (error) {
      console.error('Error updating box:', error);
      alert('Failed to update box');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this box?')) return;

    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBoxes();
    } catch (error) {
      console.error('Error deleting box:', error);
      alert('Failed to delete box');
    }
  };

  const updateBox = (id: string, field: keyof FeaturedArtBox, value: string) => {
    setBoxes(boxes.map(box =>
      box.id === id ? { ...box, [field]: value } : box
    ));
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Art Boxes</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Box
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Add New Box</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Series Name</label>
              <input
                type="text"
                value={formData.series}
                onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Media Type</label>
              <select
                value={formData.media_type}
                onChange={(e) => setFormData({ ...formData, media_type: e.target.value as 'image' | 'video' })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Media URL</label>
              <input
                type="text"
                value={formData.media_url}
                onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                placeholder="/image.jpg or https://..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Collection URL</label>
              <input
                type="text"
                value={formData.collect_url}
                onChange={(e) => setFormData({ ...formData, collect_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    title: '',
                    series: '',
                    platform: '',
                    media_type: 'image',
                    media_url: '',
                    collect_url: '',
                  });
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {boxes.map((box) => (
          <div key={box.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            {editingId === box.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={box.title}
                    onChange={(e) => updateBox(box.id, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Series Name</label>
                  <input
                    type="text"
                    value={box.series}
                    onChange={(e) => updateBox(box.id, 'series', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <input
                    type="text"
                    value={box.platform}
                    onChange={(e) => updateBox(box.id, 'platform', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Media URL</label>
                  <input
                    type="text"
                    value={box.media_url}
                    onChange={(e) => updateBox(box.id, 'media_url', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Collection URL</label>
                  <input
                    type="text"
                    value={box.collect_url}
                    onChange={(e) => updateBox(box.id, 'collect_url', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(box.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-900">
                    {box.media_type === 'video' ? (
                      <video src={box.media_url} className="w-full h-full object-contain" />
                    ) : (
                      <img src={box.media_url} alt={box.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{box.series}</h3>
                    <p className="text-gray-400 text-sm mb-2">{box.platform}</p>
                    <p className="text-gray-500 text-xs">Order: {box.display_order}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(box.id)}
                    className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(box.id)}
                    className="p-2 bg-red-600 rounded-lg hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
