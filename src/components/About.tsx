import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface ArtistSection {
  id: string;
  image_url: string;
  title: string;
  paragraph_1: string;
  paragraph_2: string;
  paragraph_3: string;
}

export const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [section, setSection] = useState<ArtistSection | null>(null);
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
    const fetchSection = async () => {
      const { data } = await supabase
        .from('artist_section')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setSection(data);
      }
    };

    fetchSection();
  }, []);

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
            {section?.title || 'About the Artist'}
          </h2>
        </div>

        {section && (
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
                    src={section.image_url}
                    alt="Chazz Gold"
                    className="w-full h-full object-cover"
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
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
