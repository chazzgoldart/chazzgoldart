import { Mail } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const Contact = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className={`max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            Get in <span className="text-neon-pink">Touch</span>
          </h2>
          <p className="text-xl text-gray-300">Inquiries, commissions, and collaborations welcome</p>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 text-center">
          <Mail className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
          <p className="text-xl text-gray-300 mb-8">
            Interested in my work? Let's connect!
          </p>
          <a
            href="mailto:chazzgoldart@gmail.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-300 glow-cyan"
          >
            <Mail className="w-5 h-5" />
            <span>chazzgoldart@gmail.com</span>
          </a>
          <p className="text-center text-sm text-gray-400 mt-8">
            Collectors may receive physical metal prints with select works.
          </p>
        </div>
      </div>
    </section>
  );
};
