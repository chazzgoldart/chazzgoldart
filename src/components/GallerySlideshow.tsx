import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
}

export const GallerySlideshow = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_slideshow_images')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 glass-card rounded-2xl animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (images.length === 0) return null;

  return (
    <section className="py-24 bg-black/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            The Sacred Cyborg Collection
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              Originally minted on MakersPlace in 2022, The Sacred Cyborg collection began with a vision I experienced in a coma dream after my traumatic brain injury. Thirteen years later, I re-created that vision — Emiko — as a symbol of rebirth and the art of imagining the future. The other works in this series are reminiscent of the many visions I witnessed in that same dream — fragments of a world both divine and mechanical.
            </p>
            <p>
              Created through multi-tiered, intuition-driven processes using photobashing, portrait photography, and sacred geometry — blending traditional techniques with generative adversarial networks through countless hours of creative dialogue.
            </p>
            <p>
              This series merges my fascination with cybernetic technology and my lifelong reverence for the Divine Feminine. Through sacred geometry, futuristic design, and the beauty of the female form, I create art that honors and empowers women.
            </p>
            <p>
              The Divine Feminine — the Great Goddess — is the embodiment of creation itself. She is the sun, the moon, the earth, and the stars. By collecting one of these works, you participate in her sacred cycle, recognizing that you, too, are a reflection of her light.
            </p>
            <p className="text-lg">
              Each Sacred Cyborg is more than circuitry and form — she is built from the elements of creation, a fusion of spirit, technology, and divine geometry.
            </p>
            <a
              href="https://opensea.io/gallery/0xaf8c481eb42defb31ae67319382624a68e28f5e8/fc55883e310f44e3b79ec93df4b36b57"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-8 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300"
            >
              View Collection on OpenSea
            </a>
          </div>
        </div>

        <div className="relative w-full max-w-md mx-auto aspect-[2/3] overflow-hidden rounded-2xl">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
            >
              <img
                src={image.image_url}
                alt={image.title || 'Gallery image'}
                className="w-full h-full object-contain bg-black"
              />
              {image.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{image.title}</h3>
                    {image.description && (
                      <p className="text-sm text-gray-300">{image.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-12 bg-gradient-to-r from-cyan-400 to-pink-400'
                    : 'w-1 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
