import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export const ContactLinksManager = () => {
  const [links, setLinks] = useState<ContactLink[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon: 'ExternalLink',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    const { data } = await supabase
      .from('contact_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (data) {
      setLinks(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from('contact_links')
        .update(formData)
        .eq('id', editingId);
    } else {
      await supabase
        .from('contact_links')
        .insert([formData]);
    }

    setFormData({
      platform: '',
      url: '',
      icon: 'ExternalLink',
      display_order: 0,
      is_active: true,
    });
    setEditingId(null);
    fetchLinks();
  };

  const handleEdit = (link: ContactLink) => {
    setEditingId(link.id);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon: link.icon,
      display_order: link.display_order,
      is_active: link.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      await supabase
        .from('contact_links')
        .delete()
        .eq('id', id);
      fetchLinks();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      platform: '',
      url: '',
      icon: 'ExternalLink',
      display_order: 0,
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Contact Links</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Platform Name</label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
              placeholder="e.g., Instagram, Twitter, Email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Icon Name</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
              placeholder="e.g., Instagram, Twitter, Mail"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Use Lucide React icon names</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Display Order</label>
            <input
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="is_active" className="text-sm">Active</label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? 'Update' : 'Add'} Link
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{link.platform}</h3>
                {!link.is_active && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-1">{link.url}</p>
              <p className="text-xs text-gray-500 mt-1">
                Icon: {link.icon} | Order: {link.display_order}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(link)}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-blue-400" />
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
