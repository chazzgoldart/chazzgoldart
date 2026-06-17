import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Event } from '../../types';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

export default function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    display_name: '',
    cover_image_url: '',
    auto_approve_photos: false,
    sync_interval_minutes: 5
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update({
            slug: formData.slug,
            display_name: formData.display_name,
            cover_image_url: formData.cover_image_url || null,
            auto_approve_photos: formData.auto_approve_photos,
            sync_interval_minutes: formData.sync_interval_minutes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('events')
          .insert({
            slug: formData.slug,
            display_name: formData.display_name,
            cover_image_url: formData.cover_image_url || null,
            auto_approve_photos: formData.auto_approve_photos,
            sync_interval_minutes: formData.sync_interval_minutes
          });

        if (error) throw error;
      }

      setFormData({
        slug: '',
        display_name: '',
        cover_image_url: '',
        auto_approve_photos: false,
        sync_interval_minutes: 5
      });
      setEditingEvent(null);
      setIsCreating(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      slug: event.slug,
      display_name: event.display_name,
      cover_image_url: event.cover_image_url || '',
      auto_approve_photos: event.auto_approve_photos,
      sync_interval_minutes: event.sync_interval_minutes
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? All photos will be deleted.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event');
    }
  };

  const handleCancel = () => {
    setFormData({
      slug: '',
      display_name: '',
      cover_image_url: '',
      auto_approve_photos: false,
      sync_interval_minutes: 5
    });
    setEditingEvent(null);
    setIsCreating(false);
  };

  if (loading) {
    return <div className="text-white">Loading events...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Events Manager</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      {isCreating && (
        <div className="mb-6 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Event Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                placeholder="miami-2025"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Used in URL: /events/{formData.slug || 'slug'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.auto_approve_photos}
                    onChange={(e) => setFormData({ ...formData, auto_approve_photos: e.target.checked })}
                    className="rounded bg-gray-900 border-gray-700"
                  />
                  Auto-approve photos
                </label>
                <p className="text-xs text-gray-500">
                  Automatically publish synced photos without review
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sync interval (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.sync_interval_minutes}
                  onChange={(e) => setFormData({ ...formData, sync_interval_minutes: parseInt(e.target.value) || 5 })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How often to check for new photos
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No events yet. Create your first event to get started.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                {event.cover_image_url ? (
                  <img
                    src={event.cover_image_url}
                    alt={event.display_name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-white font-semibold">{event.display_name}</h3>
                  <p className="text-gray-400 text-sm">/events/{event.slug}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 text-blue-400 hover:bg-gray-700 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-2 text-red-400 hover:bg-gray-700 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
