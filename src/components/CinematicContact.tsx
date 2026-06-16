import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
}

export const CinematicContact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [contactLinks, setContactLinks] = useState<ContactLink[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchContactLinks();
  }, []);

  const fetchContactLinks = async () => {
    const { data } = await supabase
      .from('contact_links')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data) {
      setContactLinks(data);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? IconComponent : Icons.ExternalLink;
  };

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className={`text-5xl md:text-7xl font-black mb-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          Let's <span className="text-neon-pink">Connect</span>
        </h2>

        <p
          className={`text-xl md:text-2xl text-gray-400 font-light mb-16 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          Inquiries, commissions, and collaborations welcome
        </p>

        <a
          href="mailto:chazzgoldart@gmail.com"
          className={`inline-flex items-center gap-3 px-12 py-6 mb-16 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold text-xl hover:scale-105 transition-all duration-300 glow-cyan ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
          style={{ transitionDelay: isVisible ? '300ms' : '0ms' }}
        >
          <Icons.Mail className="w-6 h-6" />
          <span>chazzgoldart@gmail.com</span>
        </a>

        {contactLinks.length > 0 && (
          <>
            <p
              className={`text-lg text-gray-500 font-light mb-8 transition-all duration-1000 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
            >
              Follow the journey across platforms
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-20">
              {contactLinks.map((link, index) => {
                const Icon = getIcon(link.icon);
                const delay = `${(index + 5) * 100}ms`;

                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-3 px-8 py-4 bg-gray-900/50 border border-gray-700 rounded-full hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-500 hover:scale-110 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                    }`}
                    style={{ transitionDelay: isVisible ? delay : '0ms' }}
                  >
                    <Icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
                    <span className="text-lg font-light text-gray-300 group-hover:text-white transition-colors duration-300">
                      {link.platform}
                    </span>
                  </a>
                );
              })}
            </div>
          </>
        )}

        <div
          className={`pt-12 border-t border-gray-800 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-gray-500 font-light text-sm mb-8">
            © 2025 Chazz Gold. All rights reserved.
          </p>

          <Link
            to="/admin"
            className="inline-block text-gray-600 hover:text-cyan-400 transition-colors duration-300 text-xs"
          >
            Admin
          </Link>
        </div>
      </div>
    </section>
  );
};
