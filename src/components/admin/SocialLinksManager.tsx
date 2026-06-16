import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
}

export const SocialLinksManager = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon: 'ExternalLink',
    color: 'cyan-400',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching social links:', error);
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('social_links')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        console.error('Error updating link:', error);
        alert('Error updating link');
        return;
      }
    } else {
      const { error } = await supabase
        .from('social_links')
        .insert([formData]);

      if (error) {
        console.error('Error creating link:', error);
        alert('Error creating link');
        return;
      }
    }

    setFormData({
      platform: '',
      url: '',
      icon: 'ExternalLink',
      color: 'cyan-400',
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
    fetchLinks();
  };

  const handleEdit = (link: SocialLink) => {
    setFormData({
      platform: link.platform,
      url: link.url,
      icon: link.icon,
      color: link.color,
      display_order: link.display_order,
      is_active: link.is_active,
    });
    setEditingId(link.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return;

    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting link:', error);
      alert('Error deleting link');
    } else {
      fetchLinks();
    }
  };

  const handleCancel = () => {
    setFormData({
      platform: '',
      url: '',
      icon: 'ExternalLink',
      color: 'cyan-400',
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading social links...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          {editingId ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          {editingId ? 'Edit Social Link' : 'Add Social Link'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Name</label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:border-cyan-500 focus:outline-none"
                required
                placeholder="e.g., Twitter/X, Instagram"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:border-cyan-500 focus:outline-none"
                required
                placeholder="https://... or mailto:..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Icon (Lucide Icon Name)</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:border-cyan-500 focus:outline-none"
                required
                placeholder="Twitter, Instagram, Mail, ExternalLink"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hover Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:border-cyan-500 focus:outline-none"
                required
                placeholder="cyan-400, pink-400, green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-700 focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-700 bg-black/50 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update Link' : 'Add Link'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Existing Social Links</h2>

        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-4 rounded-lg bg-black/50 border border-gray-700 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{link.platform}</span>
                  {!link.is_active && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{link.url}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-2">
                  <span>Icon: {link.icon}</span>
                  <span>Color: {link.color}</span>
                  <span>Order: {link.display_order}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(link)}
                  className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(link.id)}
                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {links.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No social links yet. Add your first one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
