import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileUpload } from './FileUpload';
import { Plus, Edit2, Trash2, Calendar, Save, X } from 'lucide-react';

interface Exhibition {
  id: string;
  event_date: string;
  title: string;
  location: string;
  venue: string;
  artwork: string;
  image_url: string | null;
  notes: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function ExhibitionsManager() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    event_date: '',
    title: '',
    location: '',
    venue: '',
    artwork: '',
    image_url: '',
    notes: '',
    display_order: 0
  });

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setExhibitions(data || []);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('exhibitions')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase
          .from('exhibitions')
          .insert([formData]);

        if (error) throw error;
      }

      resetForm();
      fetchExhibitions();
    } catch (error) {
      console.error('Error saving exhibition:', error);
      alert('Error saving exhibition');
    }
  };

  const handleEdit = (exhibition: Exhibition) => {
    setEditingId(exhibition.id);
    setFormData({
      event_date: exhibition.event_date,
      title: exhibition.title,
      location: exhibition.location,
      venue: exhibition.venue,
      artwork: exhibition.artwork,
      image_url: exhibition.image_url || '',
      notes: exhibition.notes,
      display_order: exhibition.display_order
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exhibition?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('exhibitions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchExhibitions();
    } catch (error) {
      console.error('Error deleting exhibition:', error);
      alert('Error deleting exhibition');
    }
  };

  const resetForm = () => {
    setFormData({
      event_date: '',
      title: '',
      location: '',
      venue: '',
      artwork: '',
      image_url: '',
      notes: '',
      display_order: 0
    });
    setEditingId(null);
    setIsCreating(false);
  };

  if (loading) {
    return <div className="text-white">Loading exhibitions...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Exhibitions Manager</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Exhibition
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Edit Exhibition' : 'Add New Exhibition'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Exhibition Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Gallery/Museum name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Artwork/Piece Name
              </label>
              <input
                type="text"
                value={formData.artwork}
                onChange={(e) => setFormData({ ...formData, artwork: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exhibition Image
              </label>
              <FileUpload
                accept="image/*"
                bucket="blog-media"
                onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                currentUrl={formData.image_url}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                rows={3}
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
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {exhibitions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No exhibitions yet. Add your first exhibition to get started.
          </p>
        ) : (
          exhibitions.map((exhibition) => (
            <div
              key={exhibition.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                {exhibition.image_url ? (
                  <img
                    src={exhibition.image_url}
                    alt={exhibition.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{exhibition.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(exhibition.event_date).toLocaleDateString()} • {exhibition.location}
                  </p>
                  {exhibition.venue && (
                    <p className="text-gray-500 text-xs">{exhibition.venue}</p>
                  )}
                  {exhibition.artwork && (
                    <p className="text-neon-cyan text-xs italic">{exhibition.artwork}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(exhibition)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-cyan-400" />
                </button>
                <button
                  onClick={() => handleDelete(exhibition.id)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
