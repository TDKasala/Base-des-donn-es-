import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth, AppUser } from '../contexts/AuthContext';
import { Plus, Trash2, ShieldCheck, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('app_users')
      .select('id, username, is_admin')
      .order('created_at', { ascending: true });
    if (!error && data) setUsers(data as AppUser[]);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const username = newUsername.trim();
    if (!username) return;
    setAdding(true);

    const { error } = await supabase
      .from('app_users')
      .insert({ username, is_admin: newIsAdmin });

    setAdding(false);
    if (error) {
      if (error.code === '23505') {
        toast.error("Ce nom d'utilisateur existe déjà.");
      } else {
        toast.error("Erreur lors de la création.");
      }
      return;
    }

    toast.success(`Utilisateur « ${username} » créé.`);
    setNewUsername('');
    setNewIsAdmin(false);
    fetchUsers();
  };

  const handleDelete = async (id: string, username: string) => {
    if (id === currentUser?.id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (!window.confirm(`Supprimer l'utilisateur « ${username} » ?`)) return;

    const { error } = await supabase.from('app_users').delete().eq('id', id);
    if (error) {
      toast.error('Erreur lors de la suppression.');
      return;
    }
    toast.success(`Utilisateur « ${username} » supprimé.`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  if (!currentUser?.is_admin) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Accès réservé aux administrateurs.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-500 mt-1">Créez et supprimez les comptes qui peuvent se connecter.</p>
      </div>

      {/* Add user form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Nouvel utilisateur</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl cursor-pointer select-none text-sm text-gray-700 whitespace-nowrap">
            <input
              type="checkbox"
              checked={newIsAdmin}
              onChange={(e) => setNewIsAdmin(e.target.checked)}
              className="accent-blue-600"
            />
            Administrateur
          </label>
          <button
            type="submit"
            disabled={adding || !newUsername.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Créer
          </button>
        </form>
      </div>

      {/* User list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement…
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">Aucun utilisateur.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    u.is_admin ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  )}>
                    {u.is_admin ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.is_admin ? 'Administrateur' : 'Utilisateur'}</p>
                  </div>
                </div>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {u.id === currentUser?.id && (
                  <span className="text-xs text-gray-400 px-2">Vous</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
