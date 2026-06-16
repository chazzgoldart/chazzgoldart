import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_media_url: string | null;
  featured_media_type: 'image' | 'video' | null;
  featured_thumb_url: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface BlogImage {
  id: string;
  blog_post_id: string;
  image_url: string;
  caption: string;
  display_order: number;
  created_at: string;
}

export const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'published',
    featured_media_url: null as string | null,
    featured_media_type: null as 'image' | 'video' | null,
    featured_thumb_url: null as string | null,
  });
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageCaptions, setImageCaptions] = useState<{[key: number]: string}>({});
  const [existingImages, setExistingImages] = useState<BlogImage[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    console.log('additionalImages state changed:', additionalImages.length, additionalImages.map(f => f.name));
  }, [additionalImages]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setPosts(data);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const uploadFile = async (file: File, bucket: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    console.log('Submitting with additionalImages:', additionalImages.length);
    console.log('Additional images array:', additionalImages);

    try {
      let featured_media_url = formData.featured_media_url || null;
      let featured_media_type = formData.featured_media_type || null;
      let featured_thumb_url = formData.featured_thumb_url || null;

      if (mediaFile) {
        featured_media_url = await uploadFile(mediaFile, 'blog-media');
        featured_media_type = mediaFile.type.startsWith('video/') ? 'video' : 'image';

        if (featured_media_type === 'video' && thumbFile) {
          featured_thumb_url = await uploadFile(thumbFile, 'blog-media');
        }
      }

      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        excerpt: formData.excerpt,
        status: formData.status,
        featured_media_url,
        featured_media_type,
        featured_thumb_url,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      let postId = editingId;

      if (editingId) {
        await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingId);
      } else {
        const { data } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();
        postId = data?.id;
      }

      if (postId && additionalImages.length > 0) {
        const existingImagesCount = existingImages.length;
        console.log('Uploading', additionalImages.length, 'new images');

        for (let i = 0; i < additionalImages.length; i++) {
          console.log('Uploading image', i + 1, 'of', additionalImages.length, ':', additionalImages[i].name);
          const imageUrl = await uploadFile(additionalImages[i], 'blog-media');
          await supabase
            .from('blog_images')
            .insert([{
              blog_post_id: postId,
              image_url: imageUrl,
              caption: imageCaptions[i] || '',
              display_order: existingImagesCount + i,
            }]);
          console.log('Successfully uploaded:', imageUrl);
        }
      }

      alert('Post saved successfully!');
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (post: BlogPost) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      featured_media_url: post.featured_media_url,
      featured_media_type: post.featured_media_type,
      featured_thumb_url: post.featured_thumb_url,
    });

    const { data: images } = await supabase
      .from('blog_images')
      .select('*')
      .eq('blog_post_id', post.id)
      .order('display_order', { ascending: true });

    if (images) setExistingImages(images);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    fetchPosts();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
      featured_media_url: null,
      featured_media_type: null,
      featured_thumb_url: null,
    });
    setMediaFile(null);
    setThumbFile(null);
    setAdditionalImages([]);
    setImageCaptions({});
    setExistingImages([]);
    setIsCreating(false);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddImages = (files: FileList | null) => {
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      console.log('handleAddImages called with files:', files.length, filesArray.map(f => f.name));
      console.log('Current additionalImages before update:', additionalImages.length);
      setAdditionalImages(prev => {
        const newImages = [...prev, ...filesArray];
        console.log('Updated additionalImages:', newImages.length, newImages.map(f => f.name));
        return newImages;
      });
    } else {
      console.log('handleAddImages called with null/no files');
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setImageCaptions(prev => {
      const newCaptions = { ...prev };
      delete newCaptions[index];
      return newCaptions;
    });
  };

  const updateImageCaption = (index: number, caption: string) => {
    setImageCaptions(prev => ({ ...prev, [index]: caption }));
  };

  const deleteExistingImage = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;
    await supabase.from('blog_images').delete().eq('id', imageId);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Blog Posts</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-black rounded-lg hover:bg-neon-cyan/80 transition-colors"
          >
            <Plus size={20} />
            New Post
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Edit Post' : 'Create New Post'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
              rows={10}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Featured Media (Image or Video)
            </label>
            {formData.featured_media_url && !mediaFile && (
              <div className="mb-3 p-3 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">Current media:</p>
                {formData.featured_media_type === 'video' ? (
                  <video src={formData.featured_media_url} className="max-w-xs rounded" controls />
                ) : (
                  <img src={formData.featured_media_url} alt="Featured" className="max-w-xs rounded" />
                )}
                <p className="text-xs text-gray-400 mt-2">Upload a new file to replace</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          {mediaFile && mediaFile.type.startsWith('video/') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Images (Multiple Photos)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleAddImages(e.target.files)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Select multiple images to add to your blog post</p>
          </div>

          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Existing Images
              </label>
              <div className="space-y-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                    <img src={img.image_url} alt="" className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{img.caption || 'No caption'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteExistingImage(img.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {additionalImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Images to Upload ({additionalImages.length})
              </label>
              <div className="space-y-3">
                {additionalImages.map((file, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-700 rounded">
                    <ImageIcon className="w-5 h-5 text-neon-cyan mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-white mb-2">{file.name}</p>
                      <input
                        type="text"
                        placeholder="Caption (optional)"
                        value={imageCaptions[index] || ''}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        className="w-full px-3 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-neon-cyan"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                console.log('=== DEBUG STATE ===');
                console.log('additionalImages:', additionalImages);
                console.log('additionalImages.length:', additionalImages.length);
                console.log('Files:', additionalImages.map(f => ({ name: f.name, size: f.size, type: f.type })));
                console.log('fileInputRef.current?.files:', fileInputRef.current?.files);
                console.log('===================');
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500"
            >
              DEBUG
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2 bg-neon-cyan text-black rounded-lg hover:bg-neon-cyan/80 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {uploading ? 'Saving...' : editingId ? 'Update Post' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-800 p-6 rounded-lg flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{post.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    post.status === 'published'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {post.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-2">/{post.slug}</p>
              {post.excerpt && (
                <p className="text-gray-300 mb-2">{post.excerpt}</p>
              )}
              {post.featured_media_type && (
                <p className="text-gray-500 text-sm">
                  Featured {post.featured_media_type}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Created: {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(post)}
                className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
