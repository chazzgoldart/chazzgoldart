import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideItem {
  image: string;
  title?: string;
  description?: string;
  mediaType?: 'image' | 'video';
}

interface SlideshowProps {
  slides: SlideItem[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  aspectRatio?: 'video' | 'square' | 'wide';
}

export const Slideshow = ({
  slides,
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  aspectRatio = 'video'
}: SlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]'
  };

  return (
    <div className="relative group">
      <div className={`relative overflow-hidden rounded-2xl ${aspectClasses[aspectRatio]}`}>
        {slides.map((slide, index) => {
          const isVideo = slide.mediaType === 'video';
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {isVideo ? (
                <video
                  src={slide.image}
                  autoPlay={index === currentIndex}
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title || `Slide ${index + 1}`}
                  className="w-full h-full object-contain bg-black"
                />
              )}

              {slide.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
                  <div className="p-6 md:p-8">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">{slide.title}</h3>
                    {slide.description && (
                      <p className="text-gray-300">{slide.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showControls && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass-card rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass-card rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-gradient-to-r from-cyan-400 to-pink-400'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
