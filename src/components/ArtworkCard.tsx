import { ExternalLink } from 'lucide-react';
import { Artwork } from '../types';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
}

export const ArtworkCard = ({ artwork, onClick }: ArtworkCardProps) => {
  const isVideo = artwork.mediaType === 'video';

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
    >
      <div className="aspect-square">
        {isVideo ? (
          <video
            src={artwork.thumb}
            poster={artwork.thumb}
            muted
            loop
            playsInline
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        ) : (
          <img
            src={artwork.thumb}
            alt={artwork.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-bold mb-1">{artwork.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neon-cyan">{artwork.platform}</span>
            <span className="text-xs text-gray-400">{artwork.chain}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ExternalLink className="w-5 h-5 text-neon-cyan" />
      </div>

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-cyan-400 rounded-xl transition-colors duration-300 glow-cyan opacity-0 group-hover:opacity-100" />
    </div>
  );
};
