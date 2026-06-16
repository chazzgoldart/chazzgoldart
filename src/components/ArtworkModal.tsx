import { X, ExternalLink } from 'lucide-react';
import { Artwork } from '../types';
import { useEffect } from 'react';

interface ArtworkModalProps {
  artwork: Artwork | null;
  onClose: () => void;
}

export const ArtworkModal = ({ artwork, onClose }: ArtworkModalProps) => {
  useEffect(() => {
    if (artwork) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [artwork]);

  if (!artwork) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full glass-card hover:bg-white/10 transition-colors"
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="glass-card rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="aspect-video md:aspect-square">
          {artwork.mediaType === 'video' ? (
            <video
              src={artwork.image}
              poster={artwork.thumb}
              controls
              autoPlay
              loop
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{artwork.title}</h2>
              <p className="text-neon-cyan text-sm font-semibold">{artwork.series}</p>
            </div>
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">{artwork.lore}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-4 py-2 glass-card rounded-full text-sm">
              {artwork.platform}
            </span>
            <span className="px-4 py-2 glass-card rounded-full text-sm">
              {artwork.chain}
            </span>
          </div>

          <a
            href={artwork.collectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform duration-300 glow-cyan"
          >
            <span>View on {artwork.platform}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
