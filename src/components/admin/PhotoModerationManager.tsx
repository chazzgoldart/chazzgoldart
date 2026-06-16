import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Event, Photo } from '../../types';
import { Eye, EyeOff, Trash2, Check, X } from 'lucide-react';
import EventPhotoUploader from './EventPhotoUploader';

export default function PhotoModerationManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchPhotos();
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const togglePhotoVisibility = async (photoId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_visible: !currentVisibility })
        .eq('id', photoId);

      if (error) throw error;
      fetchPhotos();
    } catch (error) {
      console.error('Error updating photo visibility:', error);
      alert('Error updating photo visibility');
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo');
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const approveSelected = async () => {
    if (selectedPhotos.size === 0) return;

    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_visible: true })
        .in('id', Array.from(selectedPhotos));

      if (error) throw error;
      setSelectedPhotos(new Set());
      fetchPhotos();
    } catch (error) {
      console.error('Error approving photos:', error);
      alert('Error approving photos');
    }
  };

  const hideSelected = async () => {
    if (selectedPhotos.size === 0) return;

    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_visible: false })
        .in('id', Array.from(selectedPhotos));

      if (error) throw error;
      setSelectedPhotos(new Set());
      fetchPhotos();
    } catch (error) {
      console.error('Error hiding photos:', error);
      alert('Error hiding photos');
    }
  };

  const deleteSelected = async () => {
    if (selectedPhotos.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedPhotos.size} photos?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .in('id', Array.from(selectedPhotos));

      if (error) throw error;
      setSelectedPhotos(new Set());
      fetchPhotos();
    } catch (error) {
      console.error('Error deleting photos:', error);
      alert('Error deleting photos');
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  const visibleCount = photos.filter(p => p.is_visible).length;
  const hiddenCount = photos.filter(p => !p.is_visible).length;

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Photo Moderation</h2>

      {events.length === 0 ? (
        <p className="text-gray-400">No events yet. Create an event first.</p>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.display_name}
                </option>
              ))}
            </select>
          </div>

          {selectedEventId && (
            <EventPhotoUploader
              event={events.find(e => e.id === selectedEventId)!}
              onPhotoUploaded={fetchPhotos}
            />
          )}

          {photos.length === 0 ? (
            <p className="text-gray-400">No photos in this event yet.</p>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span className="text-green-400">{visibleCount} visible</span>
                  <span className="mx-2">·</span>
                  <span className="text-yellow-400">{hiddenCount} hidden</span>
                  <span className="mx-2">·</span>
                  <span>{photos.length} total</span>
                </div>

                {selectedPhotos.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={approveSelected}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Approve ({selectedPhotos.size})
                    </button>
                    <button
                      onClick={hideSelected}
                      className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <EyeOff className="w-4 h-4" />
                      Hide ({selectedPhotos.size})
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete ({selectedPhotos.size})
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      selectedPhotos.has(photo.id)
                        ? 'border-cyan-500'
                        : 'border-transparent'
                    }`}
                    onClick={() => togglePhotoSelection(photo.id)}
                  >
                    <img
                      src={photo.thumbnail_url || photo.image_url}
                      alt={photo.original_filename}
                      className="w-full h-48 object-cover"
                    />

                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                      photo.is_visible
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-black'
                    }`}>
                      {photo.is_visible ? 'Visible' : 'Hidden'}
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoVisibility(photo.id, photo.is_visible);
                        }}
                        className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                      >
                        {photo.is_visible ? (
                          <EyeOff className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePhoto(photo.id);
                        }}
                        className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    {selectedPhotos.has(photo.id) && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
