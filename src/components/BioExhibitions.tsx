import { useScrollReveal } from '../hooks/useScrollReveal';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const BioExhibitions = () => {
  const { ref, isVisible } = useScrollReveal();
  const [exhibitions, setExhibitions] = useState<any[]>([]);

  useEffect(() => {
    const fetchExhibitions = async () => {
      const { data } = await supabase
        .from('exhibitions')
        .select('*')
        .order('event_date', { ascending: false });

      if (data) {
        setExhibitions(data);
      }
    };

    fetchExhibitions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
  };

  return (
    <section ref={ref} className="py-32 px-6 bg-gradient-to-b from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-10 text-neon-cyan">BIO</h2>
            <div className="space-y-6 text-gray-300 text-lg md:text-xl leading-relaxed font-light">
              <p>
                Chazz Gold is a visionary NFT artist with a passion for creating immersive digital art. With a background in both traditional and digital mediums, Chazz specializes in transforming imaginative concepts into breathtaking, photorealistic experiences.
              </p>
              <p>
                His work explores the intersection of sacred architecture and digital divinity, creating cyber-surreal maximalist compositions that challenge perceptions and invite viewers into new dimensions of visual storytelling.
              </p>
              <p>
                Through innovative use of technology and artistic vision, Chazz Gold continues to push the boundaries of what's possible in the digital art space, creating works that resonate with collectors and enthusiasts worldwide.
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-10 text-neon-pink">EXHIBITIONS</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
              {exhibitions.map((exhibition, index) => (
                <div
                  key={exhibition.id}
                  className={`border-b border-gray-700 pb-4 hover:border-neon-cyan transition-all duration-300 hover:pl-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${400 + index * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg md:text-xl font-semibold text-white">{exhibition.title}</h3>
                    <span className="text-gray-400 font-light text-sm">{formatDate(exhibition.event_date)}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-300 font-light text-sm">{exhibition.location}</p>
                    {exhibition.venue && (
                      <p className="text-gray-400 text-xs font-light">{exhibition.venue}</p>
                    )}
                    {exhibition.artwork && (
                      <p className="text-neon-cyan text-xs font-light italic">{exhibition.artwork}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
