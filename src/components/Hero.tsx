import { ChevronDown } from 'lucide-react';
import { useParallax } from '../hooks/useParallax';

export const Hero = () => {
  const offset = useParallax(0.5);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 parallax-layer"
        style={{
          transform: `translateY(${offset}px)`,
          backgroundImage: 'url(https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3)',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 fade-in">
          <span className="text-neon-cyan">Techno-Divine</span>
          <br />
          <span className="text-white">Cybernetic Art</span>
          <br />
          <span className="text-sm md:text-lg font-light tracking-widest">by Chazz Gold</span>
        </h1>

        <p className="text-lg md:text-2xl font-light text-gray-300 max-w-3xl mx-auto mb-12 fade-in" style={{ animationDelay: '0.3s' }}>
          Cyber-surreal collage and AI-driven narratives exploring emotion, divinity, and technology.
        </p>

        <div className="scroll-indicator fade-in" style={{ animationDelay: '0.6s' }}>
          <ChevronDown className="w-8 h-8 mx-auto text-neon-cyan" />
        </div>
      </div>
    </section>
  );
};
