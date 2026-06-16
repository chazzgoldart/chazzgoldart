import { useState, useEffect, useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Slideshow } from './Slideshow';
import { ArtworkModal } from './ArtworkModal';
import { Artwork } from '../types';
import { supabase } from '../lib/supabase';
import { Volume2, VolumeX } from 'lucide-react';

export const FeaturedCollection = () => {
  const { ref, isVisible } = useScrollReveal();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [featuredWorks, setFeaturedWorks] = useState<Artwork[]>([]);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchFeaturedArtworks = async () => {
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setFeaturedWorks(data.map(item => ({
          title: item.title,
          series: item.series,
          chain: item.chain,
          platform: item.platform,
          thumb: item.thumb_url,
          image: item.media_url,
          lore: item.lore,
          collectUrl: item.collect_url,
          mediaType: item.media_type,
        })));
      }
    };

    fetchFeaturedArtworks();
  }, []);

  const slideshowItems = featuredWorks.map(work => ({
    image: work.image,
    title: work.title,
    description: work.lore,
    mediaType: work.mediaType
  }));

  return (
    <>
      <section id="featured" ref={ref} className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6">
              <span className="text-neon-cyan">Chazz Gold</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
              Techno-Divine Cybernetic Art
            </p>
            <p className="text-lg md:text-xl text-gray-400 mb-12 font-light">
              ChazzGold.art
            </p>
            <div className="border-t border-gray-700 my-12 max-w-2xl mx-auto"></div>
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-neon-pink">Filigree & Shadows</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A cyber-surreal maximalist exploration of sacred architecture and digital divinity.
            </p>
          </div>

          <div className="text-center mb-8">
            <a
              href="https://superrare.com/collection/0x168ad27f85e7cc63921292d1d3eaac47dd26817d#collection"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors duration-300"
            >
              View Collection on SuperRare
            </a>
          </div>

          {slideshowItems.length > 0 && (
            <div className="mb-12">
              <Slideshow
                slides={slideshowItems}
                autoPlay={true}
                interval={5000}
                aspectRatio="video"
              />
            </div>
          )}

          <div className="text-center mb-8">
            <p className="text-xl text-gray-300 font-light">
              Click to explore collections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '0ms' }}
            >
              <a
                href="https://exchange.art/series/%E2%80%9CNeon%20Nexus%20Chronicles%E2%80%9D/nfts"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden h-64 relative group hover:border-neon-cyan transition-colors"
              >
                <img
                  src="https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Neon Reverie"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  <p className="text-gray-300 text-sm font-light">Neon Reverie</p>
                </div>
              </a>
            </div>
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <a
                href="https://exchange.art/series/Cybernetic%20Cityscapes/nfts"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden h-64 relative group hover:border-neon-cyan transition-colors"
                onMouseEnter={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                  }
                }}
                onMouseLeave={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = true;
                    setIsVideoMuted(true);
                  }
                }}
              >
                <video
                  ref={videoRef}
                  src="https://lspkvjygoanyfwtxnows.supabase.co/storage/v1/object/public/artwork-media/0.23030289578203533.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (videoRef.current) {
                      videoRef.current.muted = !videoRef.current.muted;
                      setIsVideoMuted(videoRef.current.muted);
                    }
                  }}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                  aria-label="Toggle audio"
                >
                  {isVideoMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  <p className="text-gray-300 text-sm font-light">Transient Lab / SuperRare</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <ArtworkModal
        artwork={selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
      />
    </>
  );
};
