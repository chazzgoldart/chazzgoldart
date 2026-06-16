import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  is_active: boolean;
}

export const Footer = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    const { data } = await supabase
      .from('social_links')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (data) {
      setSocialLinks(data);
    }
  };

  const getIcon = (iconName: string) => {
    if (iconName.toLowerCase() === 'youtube') {
      return <Youtube className="w-4 h-4" />;
    }
    return <ExternalLink className="w-4 h-4" />;
  };

  return (
    <footer className="py-8 px-4 bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Chazz Gold. All rights reserved.
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Techno-Divine Cybernetic Art
        </p>

        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mt-6">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-cyan-400 transition-colors"
              >
                {getIcon(link.icon)}
                {link.platform}
              </a>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          <Link
            to="/blog"
            className="text-xs text-gray-600 hover:text-cyan-400 transition-colors"
          >
            Blog
          </Link>
        </div>
      </div>
    </footer>
  );
};
