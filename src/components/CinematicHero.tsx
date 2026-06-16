import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export const CinematicHero = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxBg = scrollY * 0.5;
  const parallaxMid = scrollY * 0.3;
  const fadeOut = Math.max(0, 1 - scrollY / 600);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="parallax-bg"
        style={{
          transform: `translateY(${parallaxBg}px)`,
          backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(https://images.pexels.com/photos/1629236/pexels-photo-1629236.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
        }}
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"
        style={{ opacity: fadeOut }}
      />

      <div
        className="relative z-10 text-center px-6 max-w-6xl mx-auto"
        style={{
          transform: `translateY(${parallaxMid}px)`,
          opacity: fadeOut,
        }}
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 fade-in leading-tight">
          <span className="text-neon-cyan block mb-2">Techno-Divine</span>
          <span className="text-white block">Cybernetic Art</span>
        </h1>

        <p
          className="text-xl md:text-3xl font-light text-gray-300 max-w-4xl mx-auto mb-4 fade-in tracking-wide"
          style={{ animationDelay: '0.3s' }}
        >
          Cyber-surreal collage and AI-driven narratives
        </p>

        <p
          className="text-lg md:text-2xl font-light text-gray-400 mb-16 fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          exploring emotion, divinity, and technology
        </p>

        <div className="scroll-indicator fade-in" style={{ animationDelay: '0.8s' }}>
          <ChevronDown className="w-10 h-10 mx-auto text-neon-cyan" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
};
