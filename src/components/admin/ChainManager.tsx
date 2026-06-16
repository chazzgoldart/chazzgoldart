import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface Chain {
  id: string;
  name: string;
  url: string;
  icon: string;
  display_order: number;
}

export const ChainManager = () => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Chain>>({ display_order: 0, icon: 'Link' });

  useEffect(() => {
    fetchChains();
  }, []);

  const fetchChains = async () => {
    const { data, error } = await supabase
      .from('chains')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching chains:', error);
    } else {
      setChains(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from('chains')
        .update(formData)
        .eq('id', editingId);

      if (error) {
        alert('Error updating chain: ' + error.message);
      } else {
        handleCancel();
        fetchChains();
      }
    } else {
      const { error } = await supabase.from('chains').insert([formData]);

      if (error) {
        alert('Error creating chain: ' + error.message);
      } else {
        handleCancel();
        fetchChains();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    const { error } = await supabase.from('chains').delete().eq('id', id);

    if (error) {
      alert('Error deleting chain: ' + error.message);
    } else {
      fetchChains();
    }
  };

  const handleEdit = (chain: Chain) => {
    setFormData(chain);
    setEditingId(chain.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ display_order: 0, icon: 'Link' });
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Blockchain Chains</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add Chain
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 glass-card rounded-xl border border-cyan-400/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Icon (Lucide name)</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                required
                placeholder="Link, Bitcoin, Zap, etc."
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">URL</label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Display Order</label>
              <input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-lg focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-6 py-3 glass-card rounded-full hover:border-pink-500 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chains.map((chain) => (
          <div key={chain.id} className="glass-card rounded-xl p-4 hover:border-cyan-400/50 transition-colors">
            <h3 className="font-bold mb-2">{chain.name}</h3>
            <p className="text-xs text-gray-500 mb-3 truncate">{chain.url}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(chain)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 glass-card rounded-lg hover:border-cyan-400 transition-colors text-sm"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(chain.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 glass-card rounded-lg hover:border-pink-500 transition-colors text-sm"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
