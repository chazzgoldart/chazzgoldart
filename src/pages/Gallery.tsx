import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, X } from 'lucide-react';
import { Footer } from '../components/Footer';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
}

export const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data) setImages(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="mb-12">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-pink transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              Back to Blog
            </Link>
            <h1 className="text-5xl md:text-7xl font-black mb-4">
              <span className="text-neon-cyan">Gallery</span>
            </h1>
            <p className="text-xl text-gray-300">
              A collection of my work and creative journey
            </p>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">No images yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-neon-cyan transition-all duration-300"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt={image.title || ''}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {(image.title || image.description) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {image.title && (
                          <h3 className="text-white font-bold text-lg mb-1">
                            {image.title}
                          </h3>
                        )}
                        {image.description && (
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {image.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-neon-cyan transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div className="max-w-6xl max-h-[90vh] flex flex-col items-center">
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {(selectedImage.title || selectedImage.description) && (
              <div className="mt-6 text-center max-w-2xl">
                {selectedImage.title && (
                  <h2 className="text-2xl font-bold text-neon-cyan mb-2">
                    {selectedImage.title}
                  </h2>
                )}
                {selectedImage.description && (
                  <p className="text-gray-300 text-lg">{selectedImage.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
