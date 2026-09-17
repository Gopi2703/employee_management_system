import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Trash2, Plus, 
  Search, FileCheck, Shield, AlertCircle, X, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { EmployeeDocument, Employee } from '../types';

export const Documents: React.FC = () => {
  const { role, employee } = useAuth();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadData, setUploadData] = useState({
    employee_id: '',
    document_type: 'Contract',
    title: '',
    file_url: '',
    file_size: 1024 * 350 // ~350 KB
  });

  const canManage = role === 'admin' || role === 'hr';

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = role === 'employee' && employee?.id
        ? `/api/documents?employee_id=${employee.id}`
        : '/api/documents';

      const [docRes, empRes] = await Promise.all([
        fetch(url),
        fetch('/api/employees')
      ]);

      if (docRes.ok) setDocuments(await docRes.json());
      if (empRes.ok) {
        const emps = await empRes.json();
        setEmployees(emps);
        if (emps.length > 0 && !uploadData.employee_id) {
          setUploadData(prev => ({ ...prev, employee_id: emps[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, employee?.id]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadData)
      });
      if (res.ok) {
        setIsUploadOpen(false);
        setUploadData({
          employee_id: employees[0]?.id || '',
          document_type: 'Contract',
          title: '',
          file_url: '',
          file_size: 1024 * 350
        });
        fetchData();
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete document "${title}"?`)) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleDownload = (doc: EmployeeDocument) => {
    // Generates a mock file blob to trigger browser download
    const element = document.createElement('a');
    const file = new Blob([`Official HR Document\nTitle: ${doc.title}\nType: ${doc.document_type}\nDate: ${doc.uploaded_at}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredDocs = documents.filter(d => {
    const matchesType = selectedType === 'all' || d.document_type === selectedType;
    const matchesSearch = !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase()) || (d.employee_name && d.employee_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {role === 'employee' ? 'My Official Documents' : 'Employee Document Repository'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Resumes, offer letters, government IDs, and signed nondisclosure agreements
          </p>
        </div>

        <button
          id="btn-upload-new-doc"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <select
            id="select-doc-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Document Types</option>
            <option value="Contract">Contracts & Agreements</option>
            <option value="Offer Letter">Offer Letters</option>
            <option value="ID Proof">Government ID & Passports</option>
            <option value="Resume">Resumes & CVs</option>
            <option value="Certificate">Certifications</option>
          </select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            id="input-search-docs"
            type="text"
            placeholder="Search by title or employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 sm:w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Documents Grid Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between hover:border-blue-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-2.5 text-blue-600 dark:text-blue-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {doc.title}
                      </h4>
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {doc.document_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p>
                    Owner: <strong className="text-slate-800 dark:text-slate-200">{doc.employee_name}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Uploaded {doc.uploaded_at} • {typeof doc.file_size === 'number' ? `${(doc.file_size / 1024).toFixed(0)} KB` : (doc.file_size || '1.2 MB')}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <Shield className="h-3 w-3" />
                  Verified
                </span>

                <div className="flex items-center gap-1">
                  <button
                    id={`btn-download-doc-${doc.id}`}
                    onClick={() => handleDownload(doc)}
                    aria-label="Download Document"
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                    title="Download Document"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {canManage && (
                    <button
                      id={`btn-delete-doc-${doc.id}`}
                      onClick={() => handleDelete(doc.id, doc.title)}
                      aria-label="Delete Document"
                      className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Personnel Document</h3>
              <button onClick={() => setIsUploadOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Employee *</label>
                <select
                  required
                  value={uploadData.employee_id}
                  onChange={(e) => setUploadData({ ...uploadData, employee_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Document Type *</label>
                <select
                  value={uploadData.document_type}
                  onChange={(e) => setUploadData({ ...uploadData, document_type: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                >
                  <option value="Contract">Employment Contract</option>
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="ID Proof">Government ID / Passport</option>
                  <option value="Resume">Resume / CV</option>
                  <option value="Certificate">Certificate / Accreditation</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="e.g. Signed_Offer_Letter_2026.pdf"
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              {/* Drag and Drop Zone */}
              <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-5 text-center">
                <Upload className="mx-auto h-6 w-6 text-slate-400" />
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Click to select file or drag here
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF, DOCX, PNG up to 10MB</p>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setUploadData(prev => ({
                        ...prev,
                        title: prev.title || e.target.files![0].name,
                        file_size: e.target.files![0].size
                      }));
                    }
                  }}
                  className="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-xl px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-upload-doc"
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Upload Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
