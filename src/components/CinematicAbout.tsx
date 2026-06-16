import { ExternalLink, Mail, FileText } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ArtistSection {
  image_url: string;
  title: string;
  paragraph_1: string;
  paragraph_2: string;
  paragraph_3: string;
  linktree_url: string;
  email: string;
  press_kit_url: string;
}

export const CinematicAbout = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [section, setSection] = useState<ArtistSection | null>(null);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSection = async () => {
      console.log('CinematicAbout: Starting to fetch artist section...');
      setLoading(true);

      const { data, error } = await supabase
        .from('artist_section')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      console.log('CinematicAbout: Fetch complete', { data, error });

      if (error) {
        console.error('CinematicAbout: Error fetching artist section:', error);
      }

      if (data) {
        console.log('CinematicAbout: Setting section data:', data);
        setSection(data);
      } else {
        console.warn('CinematicAbout: No data returned from query');
      }

      setLoading(false);
      console.log('CinematicAbout: Loading complete');
    };

    fetchSection();

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

  if (loading) {
    return (
      <section className="py-32 px-6 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  if (!section) return null;

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-transparent to-pink-500" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2
            className={`text-5xl md:text-7xl font-black mb-6 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
          >
            {section.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
            }`}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full opacity-20 blur-2xl" />
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-cyan-400 glow-cyan">
                <img
                  src={`${section.image_url}?v=${Date.now()}`}
                  alt="Artist"
                  className="w-full h-full object-cover"
                  key={section.image_url}
                />
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
            }`}
          >
            <div className="space-y-6">
              <p className="text-xl md:text-2xl leading-relaxed text-gray-300 font-light">
                {section.paragraph_1}
              </p>

              <p className="text-lg md:text-xl leading-relaxed text-gray-400 font-light">
                {section.paragraph_2}
              </p>

              <p className="text-lg md:text-xl leading-relaxed text-gray-400 font-light">
                {section.paragraph_3}
              </p>

              <div className="pt-8 flex flex-wrap gap-4">
                {section.linktree_url && section.linktree_url !== '#' && (
                  <a
                    href={section.linktree_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-400 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:scale-105 transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Linktree</span>
                  </a>
                )}

                {section.email && (
                  <a
                    href={`mailto:${section.email}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500/10 border border-pink-500 text-pink-500 rounded-full hover:bg-pink-500/20 hover:scale-105 transition-all duration-300"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                )}

                {section.press_kit_url && section.press_kit_url !== '#' && (
                  <a
                    href={section.press_kit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-400 text-cyan-400 rounded-full hover:bg-cyan-500/20 hover:scale-105 transition-all duration-300"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Press Kit</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
