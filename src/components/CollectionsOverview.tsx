import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Collection } from '../types';
import { supabase } from '../lib/supabase';

export const CollectionsOverview = () => {
  const { ref, isVisible } = useScrollReveal();
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (data) {
        const fetchedCollections = data.map(item => ({
          title: item.title,
          tagline: item.tagline,
          image: item.image_url,
          url: item.url,
          mediaType: item.media_type || 'image',
        }));

        const totalSlots = 6;
        const emptySlots = totalSlots - fetchedCollections.length;
        const placeholders = Array(Math.max(0, emptySlots)).fill(null).map(() => ({
          title: '',
          tagline: '',
          image: '',
          url: '',
          mediaType: 'image' as const,
          isEmpty: true,
        }));

        setCollections([...fetchedCollections, ...placeholders]);
      }
    };

    fetchCollections();
  }, []);

  return (
    <section ref={ref} className="py-32 px-6 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-transparent to-cyan-500" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className={`text-5xl md:text-7xl font-black mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <span className="text-neon-pink">Collections</span>
          </h2>
          <p className={`text-xl md:text-2xl text-gray-400 font-light transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            Explore the multiverse of Chazz Gold
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {collections.map((collection, index) => {
            if (collection.isEmpty) {
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900/30 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div className="aspect-video flex items-center justify-center">
                    <p className="text-gray-600 text-lg font-light">Coming Soon</p>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={index}
                href={collection.url}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-700 hover-lift ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="aspect-video bg-black">
                  {collection.mediaType === 'video' ? (
                    <video
                      src={collection.image}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={collection.image}
                      alt={collection.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-bold mb-3 group-hover:text-neon-cyan transition-colors duration-300">
                    {collection.title}
                  </h3>
                  <p className="text-gray-300 text-lg mb-4 font-light">{collection.tagline}</p>
                  <div className="inline-flex items-center gap-2 text-neon-cyan group-hover:gap-4 transition-all duration-300">
                    <span className="font-semibold">Explore Collection</span>
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-pink-500 rounded-2xl transition-all duration-500 glow-pink opacity-0 group-hover:opacity-100" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
