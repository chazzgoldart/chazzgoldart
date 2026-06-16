import { ExternalLink, LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface PlatformCardProps {
  name: string;
  tagline: string;
  url: string;
  icon: string;
}

export const PlatformCard = ({ name, tagline, url, icon }: PlatformCardProps) => {
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[icon] || Icons.Box;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-card rounded-xl p-6 hover-lift hover:border-cyan-400 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-pink-500/0 group-hover:from-cyan-500/10 group-hover:to-pink-500/10 transition-all duration-500" />

      <div className="relative flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-lg group-hover:from-cyan-500/40 group-hover:to-pink-500/40 transition-all duration-500 group-hover:scale-110">
          <IconComponent className="w-6 h-6 text-neon-cyan" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1 group-hover:text-neon-cyan transition-colors duration-300">
            {name}
          </h3>
          <p className="text-sm text-gray-400 font-light">{tagline}</p>
        </div>
        <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-neon-cyan transition-all duration-300 group-hover:translate-x-1" />
      </div>
    </a>
  );
};
