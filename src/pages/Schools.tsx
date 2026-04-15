import { useState, useEffect, useRef } from 'react';
import { School, SchoolStatus } from '../types';
import { getSchools, saveSchools } from '../utils/storage';
import { SchoolForm } from '../components/SchoolForm';
import { Plus, Search, Edit2, Trash2, Building2, Upload, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Schools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SchoolStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSchools(getSchools());
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newSchools: School[] = data.map((row: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          ecole: row['Ecole'] || row['ecole'] || row['École'] || 'Inconnu',
          lieu: row['Lieu'] || row['lieu'] || '',
          promoteur: row['Promoteur'] || row['promoteur'] || '',
          phone: row['Téléphone'] || row['Telephone'] || row['phone'] || '',
          status: (row['Statut'] || row['status'] || 'En attente') as SchoolStatus,
          createdAt: Date.now(),
        }));

        const updatedSchools = [...newSchools, ...schools];
        setSchools(updatedSchools);
        saveSchools(updatedSchools);
        toast.success(`${newSchools.length} écoles importées avec succès`);
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de l\'importation du fichier');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handleAddSchool = (data: Omit<School, 'id' | 'createdAt'>) => {
    const newSchool: School = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    const updatedSchools = [newSchool, ...schools];
    setSchools(updatedSchools);
    saveSchools(updatedSchools);
    setIsFormOpen(false);
    toast.success('École ajoutée avec succès');
  };

  const handleEditSchool = (data: Omit<School, 'id' | 'createdAt'>) => {
    if (!editingSchool) return;
    const updatedSchools = schools.map((s) =>
      s.id === editingSchool.id ? { ...s, ...data } : s
    );
    setSchools(updatedSchools);
    saveSchools(updatedSchools);
    setEditingSchool(null);
    toast.success('École modifiée avec succès');
  };

  const handleDeleteSchool = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) {
      const updatedSchools = schools.filter((s) => s.id !== id);
      setSchools(updatedSchools);
      saveSchools(updatedSchools);
      toast.success('École supprimée');
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.ecole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.promoteur.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || school.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchools = filteredSchools.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text('Liste des Écoles', 14, 15);

      const tableColumn = ["École", "Lieu", "Promoteur", "Téléphone", "Statut"];
      const tableRows = filteredSchools.map(school => [
        school.ecole,
        school.lieu,
        school.promoteur,
        school.phone,
        school.status
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save('ecoles.pdf');
      toast.success('PDF exporté avec succès');
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'exportation PDF');
    }
  };

  const filters: (SchoolStatus | 'All')[] = ['All', 'En attente', 'Contacté', 'Client', 'Refusé'];

  const getStatusColor = (status: SchoolStatus) => {
    switch (status) {
      case 'En attente': return 'bg-gray-100 text-gray-700';
      case 'Contacté': return 'bg-amber-100 text-amber-700';
      case 'Client': return 'bg-green-100 text-green-700';
      case 'Refusé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Écoles</h1>
          <p className="text-gray-500 mt-1">Gérez votre base de données d'écoles.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors shadow-sm w-full sm:w-auto"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Importer</span>
            <span className="sm:hidden">Importer Excel</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors shadow-sm w-full sm:w-auto"
          >
            <FileDown className="w-5 h-5" />
            <span className="hidden sm:inline">Exporter</span>
            <span className="sm:hidden">Exporter PDF</span>
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou promoteur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 gap-2 hide-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  activeFilter === filter
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                )}
              >
                {filter === 'All' ? 'Tous' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="px-6 py-4 font-medium">École</th>
                <th className="px-6 py-4 font-medium">Lieu</th>
                <th className="px-6 py-4 font-medium">Promoteur</th>
                <th className="px-6 py-4 font-medium">Téléphone</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedSchools.length > 0 ? (
                paginatedSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{school.ecole}</td>
                    <td className="px-6 py-4 text-gray-600">{school.lieu}</td>
                    <td className="px-6 py-4 text-gray-600">{school.promoteur}</td>
                    <td className="px-6 py-4 text-gray-600">{school.phone}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(school.status))}>
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingSchool(school)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchool(school.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-base font-medium text-gray-900">Aucune école trouvée</p>
                      <p className="text-sm mt-1">Essayez de modifier vos filtres ou ajoutez une nouvelle école.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 md:hidden mt-4">
          {paginatedSchools.length > 0 ? (
            paginatedSchools.map((school) => (
              <div key={school.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{school.ecole}</h3>
                    <p className="text-sm text-gray-500">{school.lieu}</p>
                  </div>
                  <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', getStatusColor(school.status))}>
                    {school.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="text-gray-400">Promoteur:</span> {school.promoteur}</p>
                  <p><span className="text-gray-400">Tél:</span> {school.phone}</p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => setEditingSchool(school)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchool(school.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-col items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-base font-medium text-gray-900">Aucune école trouvée</p>
                <p className="text-sm mt-1">Essayez de modifier vos filtres.</p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{filteredSchools.length === 0 ? 0 : startIndex + 1}</span> à <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredSchools.length)}</span> sur <span className="font-medium">{filteredSchools.length}</span> écoles
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 transition-colors",
                        currentPage === page
                          ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {(isFormOpen || editingSchool) && (
        <SchoolForm
          initialData={editingSchool}
          onSubmit={editingSchool ? handleEditSchool : handleAddSchool}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSchool(null);
          }}
        />
      )}
    </div>
  );
}
