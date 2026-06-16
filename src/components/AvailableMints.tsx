import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { PlatformCard } from './PlatformCard';
import { Platform } from '../types';
import { supabase } from '../lib/supabase';

export const AvailableMints = () => {
  const { ref, isVisible } = useScrollReveal();
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: platformsData } = await supabase
        .from('platforms')
        .select('*')
        .order('display_order', { ascending: true });

      if (platformsData) setPlatforms(platformsData);
    };

    fetchData();
  }, []);

  return (
    <section ref={ref} className="py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className={`text-5xl md:text-7xl font-black mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            Available <span className="text-neon-cyan">Mints</span>
          </h2>
          <p className={`text-xl md:text-2xl text-gray-400 font-light transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            Collect across multiple platforms and chains
          </p>
        </div>

        <div>
          <h3 className={`text-3xl md:text-4xl font-bold mb-8 text-neon-pink transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            Platforms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${400 + index * 100}ms` }}
              >
                <PlatformCard {...platform} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
