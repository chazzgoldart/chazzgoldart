import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Footer } from '../components/Footer';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_media_url: string | null;
  featured_media_type: 'image' | 'video' | null;
  featured_thumb_url: string | null;
  published_at: string;
}

interface BlogImage {
  id: string;
  blog_post_id: string;
  image_url: string;
  caption: string;
  display_order: number;
}

export const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (data) setPosts(data);
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
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-pink transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            <span className="text-neon-cyan">Blog</span>
          </h1>
          <p className="text-xl text-gray-300">
            Updates on my latest projects and creative journey
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden hover:border-neon-cyan transition-all duration-300"
              >
                <Link to={`/blog/${post.slug}`}>
                  {post.featured_media_url && (
                    <div className="aspect-video bg-gray-900 relative overflow-hidden group">
                      {post.featured_media_type === 'video' ? (
                        <img
                          src={post.featured_thumb_url || post.featured_media_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <img
                          src={post.featured_media_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                      <Calendar size={16} />
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <h2 className="text-3xl font-bold mb-3 group-hover:text-neon-cyan transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [images, setImages] = useState<BlogImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    console.log('Blog post data:', data);
    console.log('Blog post error:', error);

    if (data) {
      setPost(data);

      const { data: blogImages, error: imagesError } = await supabase
        .from('blog_images')
        .select('*')
        .eq('blog_post_id', data.id)
        .order('display_order', { ascending: true });

      console.log('Blog images:', blogImages);
      console.log('Blog images error:', imagesError);

      if (blogImages) setImages(blogImages);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog" className="text-neon-cyan hover:text-neon-pink">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <article className="max-w-4xl mx-auto px-4 py-20">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-pink transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </Link>

        {post.featured_media_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            {post.featured_media_type === 'video' ? (
              <VideoPlayer
                videoUrl={post.featured_media_url}
                posterUrl={post.featured_thumb_url}
              />
            ) : (
              <img
                src={post.featured_media_url}
                alt={post.title}
                className="w-full h-auto"
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
          <Calendar size={16} />
          {new Date(post.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-8 text-neon-cyan">
          {post.title}
        </h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-8">
            {post.content}
          </div>
        </div>

        {images.length > 0 && (
          <div className="space-y-8 mt-12">
            <h2 className="text-3xl font-bold text-neon-cyan mb-8">Gallery</h2>
            {images.map((image) => (
              <div key={image.id} className="rounded-lg overflow-hidden bg-gray-800/30 border border-gray-700">
                <img
                  src={image.image_url}
                  alt={image.caption || 'Blog image'}
                  className="w-full h-auto"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Failed to load image:', image.image_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {image.caption && (
                  <p className="text-center text-gray-400 italic mt-3 mb-3 text-base px-4">
                    {image.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="mt-12 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <p className="text-gray-400">No additional images for this post.</p>
          </div>
        )}
      </article>
      <Footer />
    </div>
  );
};

const VideoPlayer = ({ videoUrl, posterUrl }: { videoUrl: string; posterUrl: string | null }) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  return (
    <div
      className="relative bg-black aspect-video group"
      onMouseEnter={() => {
        if (videoElement) videoElement.muted = false;
      }}
      onMouseLeave={() => {
        if (videoElement) videoElement.muted = true;
      }}
    >
      <video
        ref={setVideoElement}
        src={videoUrl}
        poster={posterUrl || undefined}
        className="w-full h-full"
        controls
        loop
        muted
        playsInline
      />
    </div>
  );
};
