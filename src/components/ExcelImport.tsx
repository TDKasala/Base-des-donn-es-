import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { SchoolStatus } from '../types';
import { addSchool } from '../utils/storage';
import { cn } from '../lib/utils';

interface ExcelImportProps {
  onClose: () => void;
  onImported: () => void;
}

type SchoolField = 'ecole' | 'lieu' | 'promoteur' | 'phone' | 'status' | 'description' | 'ignore';

const REQUIRED_FIELDS: SchoolField[] = ['ecole', 'lieu', 'promoteur', 'phone'];
const VALID_STATUSES = new Set<string>(['En attente', 'Contacté', 'Client', 'Refusé']);

const FIELD_LABELS: Record<SchoolField, string> = {
  ecole: 'École',
  lieu: 'Lieu',
  promoteur: 'Promoteur',
  phone: 'Téléphone',
  status: 'Statut',
  description: 'Description',
  ignore: '— Ignorer —',
};

// Auto-detect which school field an Excel column name maps to
function guessField(colName: string): SchoolField {
  const c = colName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/ecole|ecol|school|nom|name/.test(c)) return 'ecole';
  if (/lieu|localit|ville|city|location|adress/.test(c)) return 'lieu';
  if (/promoteur|promo|contact|owner|responsable|directeur/.test(c)) return 'promoteur';
  if (/phone|tel|mobile|gsm|numero|number/.test(c)) return 'phone';
  if (/status|statut|etat|état/.test(c)) return 'status';
  if (/desc|note|comment|remarque/.test(c)) return 'description';
  return 'ignore';
}

function normalizeStatus(val: string): SchoolStatus {
  const v = val.trim();
  if (VALID_STATUSES.has(v)) return v as SchoolStatus;
  const lower = v.toLowerCase();
  if (lower.includes('client')) return 'Client';
  if (lower.includes('contact')) return 'Contacté';
  if (lower.includes('refus')) return 'Refusé';
  return 'En attente';
}

export function ExcelImport({ onClose, onImported }: ExcelImportProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, SchoolField>>({});
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<{ row: number; message: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (json.length < 2) {
        alert('Le fichier semble vide ou ne contient pas de données.');
        return;
      }

      const hdrs = (json[0] as unknown[]).map(String);
      const dataRows = json.slice(1).filter((r) => r.some((c) => String(c).trim() !== '')) as string[][];

      const map: Record<string, SchoolField> = {};
      hdrs.forEach((h) => { map[h] = guessField(h); });

      setHeaders(hdrs);
      setRows(dataRows);
      setColumnMap(map);
      setStep('preview');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const mappedFields = Object.values(columnMap);
  const missingRequired = REQUIRED_FIELDS.filter((f) => !mappedFields.includes(f));

  const handleImport = async () => {
    setStep('importing');
    setProgress(0);
    const errs: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const get = (field: SchoolField) => {
        const idx = headers.findIndex((h) => columnMap[h] === field);
        return idx >= 0 ? String(row[idx] ?? '').trim() : '';
      };

      const ecole = get('ecole');
      const phone = get('phone');

      if (!ecole) {
        errs.push({ row: i + 2, message: `Ligne ${i + 2} : nom d'école manquant` });
        setProgress(Math.round(((i + 1) / rows.length) * 100));
        continue;
      }
      if (!phone) {
        errs.push({ row: i + 2, message: `Ligne ${i + 2} : téléphone manquant` });
        setProgress(Math.round(((i + 1) / rows.length) * 100));
        continue;
      }

      const result = await addSchool({
        ecole,
        lieu: get('lieu') || '—',
        promoteur: get('promoteur') || '—',
        phone,
        status: normalizeStatus(get('status')),
        description: get('description') || undefined,
      });

      if (!result) {
        errs.push({ row: i + 2, message: `Ligne ${i + 2} : erreur lors de l'insertion` });
      }

      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    setErrors(errs);
    setStep('done');
    onImported();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Importer depuis Excel</h2>
            <p className="text-sm text-gray-500 mt-0.5">Formats acceptés : .xlsx, .xls, .csv</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Step: Upload */}
          {step === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors',
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
              )}
            >
              <FileSpreadsheet className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-base font-medium text-gray-700">Glissez votre fichier ici</p>
              <p className="text-sm text-gray-400 mt-1">ou cliquez pour parcourir</p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Step: Preview + column mapping */}
          {step === 'preview' && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                <FileSpreadsheet className="w-4 h-4 text-green-500 shrink-0" />
                <span className="font-medium truncate">{fileName}</span>
                <span className="text-gray-400 shrink-0">— {rows.length} ligne{rows.length > 1 ? 's' : ''}</span>
              </div>

              {/* Column mapping */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Correspondance des colonnes</p>
                <div className="grid grid-cols-2 gap-2">
                  {headers.map((h) => (
                    <div key={h} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                      <span className="text-sm text-gray-500 truncate flex-1" title={h}>{h}</span>
                      <span className="text-gray-300">→</span>
                      <select
                        value={columnMap[h]}
                        onChange={(e) => setColumnMap({ ...columnMap, [h]: e.target.value as SchoolField })}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {(Object.keys(FIELD_LABELS) as SchoolField[]).map((f) => (
                          <option key={f} value={f}>{FIELD_LABELS[f]}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing required fields warning */}
              {missingRequired.length > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Champs requis non mappés : <strong>{missingRequired.map((f) => FIELD_LABELS[f]).join(', ')}</strong></span>
                </div>
              )}

              {/* Data preview */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu (5 premières lignes)</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200 text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {headers.map((h) => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-gray-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {headers.map((_, j) => (
                            <td key={j} className="px-4 py-2 text-gray-700 whitespace-nowrap max-w-[180px] truncate">
                              {row[j] ?? ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Step: Importing */}
          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-gray-700 font-medium">Importation en cours…</p>
              <div className="w-full max-w-xs bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">{progress}%</p>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-6 gap-3">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-lg font-semibold text-gray-900">Importation terminée</p>
                <p className="text-sm text-gray-500">
                  {rows.length - errors.length} / {rows.length} école{rows.length > 1 ? 's' : ''} importée{rows.length > 1 ? 's' : ''} avec succès
                </p>
              </div>
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-1 max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium text-red-700 mb-2">{errors.length} erreur{errors.length > 1 ? 's' : ''}</p>
                  {errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">{e.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors text-sm"
          >
            {step === 'done' ? 'Fermer' : 'Annuler'}
          </button>
          {step === 'preview' && (
            <button
              onClick={handleImport}
              disabled={missingRequired.length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Importer {rows.length} ligne{rows.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
