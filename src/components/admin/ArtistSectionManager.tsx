import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileUpload } from './FileUpload';
import { Save, RefreshCw } from 'lucide-react';

interface ArtistSection {
  id: string;
  image_url: string;
  title: string;
  paragraph_1: string;
  paragraph_2: string;
  paragraph_3: string;
  linktree_url: string;
  email: string;
  press_kit_url: string;
  is_active: boolean;
}

export const ArtistSectionManager = () => {
  const [section, setSection] = useState<ArtistSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSection();
  }, []);

  const fetchSection = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('artist_section')
      .select('*')
      .eq('is_active', true)
      .single();

    if (data) {
      setSection(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!section) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('artist_section')
      .update({
        image_url: section.image_url,
        title: section.title,
        paragraph_1: section.paragraph_1,
        paragraph_2: section.paragraph_2,
        paragraph_3: section.paragraph_3,
        linktree_url: section.linktree_url,
        email: section.email,
        press_kit_url: section.press_kit_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', section.id);

    setSaving(false);

    if (error) {
      setMessage('Error saving: ' + error.message);
    } else {
      setMessage('Artist section updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleImageUpload = (url: string) => {
    if (section) {
      setSection({ ...section, image_url: url });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No artist section found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neon-cyan">Artist Section</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full hover:scale-105 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-500/20 border border-red-500' : 'bg-green-500/20 border border-green-500'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Artist Image
            </label>
            <FileUpload
              bucket="artworks"
              onUpload={handleImageUpload}
              accept="image/*"
              currentUrl={section.image_url}
            />
            {section.image_url && (
              <div className="mt-4 relative aspect-square rounded-lg overflow-hidden border-2 border-cyan-400">
                <img
                  src={section.image_url}
                  alt="Artist"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Section Title
            </label>
            <input
              type="text"
              value={section.title}
              onChange={(e) => setSection({ ...section, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="e.g., About the Artist"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={section.email}
              onChange={(e) => setSection({ ...section, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="hello@chazzgold.art"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Linktree URL
            </label>
            <input
              type="url"
              value={section.linktree_url}
              onChange={(e) => setSection({ ...section, linktree_url: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="https://linktr.ee/yourname"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Press Kit URL
            </label>
            <input
              type="url"
              value={section.press_kit_url}
              onChange={(e) => setSection({ ...section, press_kit_url: e.target.value })}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            First Paragraph
          </label>
          <textarea
            value={section.paragraph_1}
            onChange={(e) => setSection({ ...section, paragraph_1: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors resize-none"
            placeholder="Main introduction..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Second Paragraph
          </label>
          <textarea
            value={section.paragraph_2}
            onChange={(e) => setSection({ ...section, paragraph_2: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors resize-none"
            placeholder="Additional details..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Third Paragraph
          </label>
          <textarea
            value={section.paragraph_3}
            onChange={(e) => setSection({ ...section, paragraph_3: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none transition-colors resize-none"
            placeholder="Achievements and exhibitions..."
          />
        </div>
      </div>
    </div>
  );
};
