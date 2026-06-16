import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Artwork {
  id: string;
  title: string;
  series: string;
  platform: string;
  media_type: string;
  thumb_url: string;
  media_url: string;
  collect_url: string;
}

export const FeaturedArtBoxes = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('display_order')
        .limit(3);

      if (error) throw error;
      setArtworks(data || []);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="pb-16 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-72 bg-gray-800/50 rounded-lg animate-pulse"></div>
            <div className="h-72 bg-gray-800/50 rounded-lg animate-pulse"></div>
            <div className="h-72 bg-gray-800/50 rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-16 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <a
              key={artwork.id}
              href={artwork.collect_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden h-72 relative group hover:border-neon-cyan transition-all duration-500 hover-lift"
            >
              {artwork.media_type === 'video' ? (
                <video
                  src={artwork.media_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={artwork.media_url}
                  alt={artwork.title}
                  className="w-full h-full object-cover bg-black group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                <p className="text-white text-lg font-semibold mb-1">{artwork.series}</p>
                <p className="text-gray-300 text-sm font-light">{artwork.platform}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
