import { useState, useEffect, useRef } from 'react';
import { ArtworkModal } from './ArtworkModal';
import { Slideshow } from './Slideshow';
import { Artwork } from '../types';
import { supabase } from '../lib/supabase';
import { Volume2, VolumeX } from 'lucide-react';

export const ParallaxGallery = () => {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      const { data } = await supabase
        .from('artworks')
        .select('*')
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(20);

      if (data) {
        setArtworks(
          data.map((item) => ({
            title: item.title,
            series: item.series,
            chain: item.chain,
            platform: item.platform,
            thumb: item.thumb_url,
            image: item.media_url,
            lore: item.lore,
            collectUrl: item.collect_url,
            mediaType: item.media_type,
          }))
        );
      }
    };

    fetchArtworks();
  }, []);


  if (artworks.length === 0) return null;

  return (
    <>
      <section className="py-32 px-6 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black mb-6 slide-up">
              Featured <span className="text-neon-pink">Works</span>
            </h2>
            <p
              className="text-xl md:text-2xl text-gray-400 font-light slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              Explore the collection
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="border-t border-gray-700 my-12 max-w-2xl mx-auto"></div>
            <h3 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-neon-pink">Filigree & Shadows</span>
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              A cyber-surreal maximalist exploration of sacred architecture and digital divinity.
            </p>
            <a
              href="https://superrare.com/collection/0x168ad27f85e7cc63921292d1d3eaac47dd26817d#collection"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded-lg hover:bg-neon-cyan/20 transition-colors duration-300"
            >
              View Collection on SuperRare
            </a>
          </div>

          {artworks.length > 0 && (
            <div className="mb-12">
              <Slideshow
                slides={artworks.slice(0, 6).map(work => ({
                  image: work.image,
                  title: work.title,
                  description: work.lore,
                  mediaType: work.mediaType
                }))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <a
              href="https://exchange.art/series/%E2%80%9CNeon%20Nexus%20Chronicles%E2%80%9D/nfts"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden h-64 relative group hover:border-neon-cyan transition-all duration-500 hover-lift"
            >
              <img
                src="https://images.pexels.com/photos/8566472/pexels-photo-8566472.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Neon Reverie"
                className="w-full h-full object-cover bg-black group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <p className="text-gray-300 text-sm font-light">Neon Reverie</p>
              </div>
            </a>
            <a
              href="https://exchange.art/series/Cybernetic%20Cityscapes/nfts"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden h-64 relative group hover:border-neon-cyan transition-all duration-500 hover-lift"
              onMouseEnter={() => {
                if (videoRef.current) {
                  videoRef.current.muted = false;
                  setIsVideoMuted(false);
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
      </section>

      <ArtworkModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
    </>
  );
};
