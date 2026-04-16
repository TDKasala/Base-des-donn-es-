import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { SchoolStatus } from '../types';
import { cn } from '../lib/utils';

interface SqlQueryPanelProps {
  searchQuery: string;
  activeFilter: SchoolStatus | 'All';
  onClose: () => void;
}

type QueryTab = 'create' | 'select' | 'insert' | 'update' | 'delete';

export function SqlQueryPanel({ searchQuery, activeFilter, onClose }: SqlQueryPanelProps) {
  const [activeTab, setActiveTab] = useState<QueryTab>('create');
  const [copied, setCopied] = useState(false);

  const buildSelectQuery = () => {
    const conditions: string[] = [];

    if (searchQuery) {
      conditions.push(
        `(ecole ILIKE '%${searchQuery}%' OR promoteur ILIKE '%${searchQuery}%')`
      );
    }
    if (activeFilter !== 'All') {
      conditions.push(`status = '${activeFilter}'`);
    }

    const where = conditions.length > 0 ? `\nWHERE ${conditions.join('\n  AND ')}` : '';
    return `SELECT id, ecole, lieu, promoteur, phone, status, description, created_at\nFROM schools${where}\nORDER BY created_at DESC;`;
  };

  const queries: Record<QueryTab, { label: string; sql: string }> = {
    create: {
      label: 'CREATE TABLE',
      sql: `CREATE TABLE IF NOT EXISTS schools (
  id          TEXT PRIMARY KEY,
  ecole       TEXT NOT NULL,
  lieu        TEXT NOT NULL,
  promoteur   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  status      TEXT NOT NULL
                CHECK (status IN ('En attente', 'Contacté', 'Client', 'Refusé')),
  description TEXT,
  created_at  BIGINT NOT NULL
);`,
    },
    select: {
      label: 'SELECT',
      sql: buildSelectQuery(),
    },
    insert: {
      label: 'INSERT',
      sql: `INSERT INTO schools (id, ecole, lieu, promoteur, phone, status, description, created_at)
VALUES (
  gen_random_uuid(),   -- id
  'Nom de l''école',   -- ecole
  'Ville',             -- lieu
  'Nom du promoteur',  -- promoteur
  '+243 000 000 000',  -- phone
  'En attente',        -- status
  NULL,                -- description (optional)
  EXTRACT(EPOCH FROM NOW()) * 1000
);`,
    },
    update: {
      label: 'UPDATE',
      sql: `UPDATE schools
SET
  ecole       = 'Nouveau nom',
  lieu        = 'Nouvelle ville',
  promoteur   = 'Nouveau promoteur',
  phone       = '+243 000 000 000',
  status      = 'Client',
  description = 'Note optionnelle'
WHERE id = '<school-id>';`,
    },
    delete: {
      label: 'DELETE',
      sql: `DELETE FROM schools
WHERE id = '<school-id>';`,
    },
  };

  const currentSql = queries[activeTab].sql;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const tabs: QueryTab[] = ['create', 'select', 'insert', 'update', 'delete'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Requêtes SQL</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Équivalent SQL des opérations de l'application
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {queries[tab].label}
            </button>
          ))}
        </div>

        {/* Context note for SELECT */}
        {activeTab === 'select' && (searchQuery || activeFilter !== 'All') && (
          <div className="mx-6 mt-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
            Filtres actifs :{' '}
            {searchQuery && <span className="font-medium">recherche « {searchQuery} »</span>}
            {searchQuery && activeFilter !== 'All' && ' · '}
            {activeFilter !== 'All' && <span className="font-medium">statut = {activeFilter}</span>}
          </div>
        )}

        {/* SQL Block */}
        <div className="relative mx-6 mt-3 mb-6 flex-1 overflow-auto">
          <pre className="bg-gray-950 text-green-400 text-sm rounded-xl p-5 overflow-auto font-mono leading-relaxed whitespace-pre">
            {currentSql}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
      </div>
    </div>
  );
}
