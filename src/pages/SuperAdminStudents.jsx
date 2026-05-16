import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Search, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download, X } from 'lucide-react';

const SuperAdminStudents = () => {
  const { user } = useAuth();

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDepartment, setStudentDepartment] = useState('');
  const [studentSemester, setStudentSemester] = useState('');
  const [studentEligible, setStudentEligible] = useState('');
  const [bulkSemester, setBulkSemester] = useState('');
  const [bulkPromotionResult, setBulkPromotionResult] = useState(null);

  const [successMessage, setSuccessMessage] = useState(null);

  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [showImportResult, setShowImportResult] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const fetchStudents = async (overrides = {}) => {
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const data = await api.getAdminStudents({
        search: overrides.search ?? studentSearch,
        department: overrides.department ?? studentDepartment,
        semester: overrides.semester ?? studentSemester,
        eligible: overrides.eligible ?? studentEligible,
      });
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setStudentsError('Failed to load students.');
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const toggleEligibility = async (studentId) => {
    try {
      await api.toggleStudentEligibility(studentId);
      await fetchStudents();
      showSuccess('Eligibility updated');
    } catch (err) {
      console.error('Failed to toggle eligibility:', err);
      setStudentsError(err.response?.data?.error || 'Failed to update eligibility.');
    }
  };

  const promoteStudent = async (studentId) => {
    try {
      await api.promoteStudent(studentId);
      await fetchStudents();
      showSuccess('Student promoted');
    } catch (err) {
      console.error('Failed to promote student:', err);
      setStudentsError(err.response?.data?.error || 'Failed to promote student.');
    }
  };

  const promoteBulk = async () => {
    if (!bulkSemester) {
      setStudentsError('Please select a semester for bulk promotion.');
      return;
    }
    try {
      const result = await api.promoteStudentsBulk(bulkSemester);
      setBulkPromotionResult(result);
      await fetchStudents();
      showSuccess('Bulk promotion completed');
    } catch (err) {
      console.error('Failed to promote students:', err);
      setStudentsError(err.response?.data?.error || 'Failed to promote students.');
    }
  };

  const handleImportStudents = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setImportError('Please select a CSV file to upload.');
      return;
    }
    setIsImporting(true);
    setImportError(null);
    setImportResult(null);
    try {
      const result = await api.importStudents(importFile);
      setImportResult(result);
      setShowImportResult(true);
      setImportFile(null);
      const fileInput = document.getElementById('student-import-file');
      if (fileInput) fileInput.value = '';
      if (result.importedCount > 0) {
        await fetchStudents();
        showSuccess(`Imported ${result.importedCount} student(s)`);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setImportError(typeof serverMsg === 'string' ? serverMsg : 'Import failed. Please check your CSV and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportStudents = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const blobData = await api.exportStudentsCsv();
      const blob = blobData instanceof Blob ? blobData : new Blob([blobData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Students CSV downloaded');
    } catch (err) {
      console.error('Failed to export students:', err);
      setExportError('Failed to export students CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      <Sidebar user={user} role="SUPER_ADMIN" />
      <div className="flex-1 md:ml-64 p-4 md:p-8 w-full max-w-7xl mx-auto">
        <Navbar user={user} />

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Operations</h1>
          <p className="text-secondary mt-2 font-medium">Manage students, eligibility, promotions, and CSV imports.</p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="font-medium text-sm">{successMessage}</p>
          </div>
        )}

        {/* Student Management */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Student Management
            </h2>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchStudents({ search: e.currentTarget.value });
                  }}
                  placeholder="Search name / USN / email"
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <select
                value={studentDepartment}
                onChange={(e) => {
                  setStudentDepartment(e.target.value);
                  fetchStudents({ department: e.target.value });
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="">All Depts</option>
                <option value="CSE">CSE</option>
                <option value="ISE">ISE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="ME">ME</option>
                <option value="CV">CV</option>
              </select>
              <select
                value={studentSemester}
                onChange={(e) => {
                  setStudentSemester(e.target.value);
                  fetchStudents({ semester: e.target.value });
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="">All Sem</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
              <select
                value={studentEligible}
                onChange={(e) => {
                  setStudentEligible(e.target.value);
                  fetchStudents({ eligible: e.target.value });
                }}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="">All</option>
                <option value="true">Eligible</option>
                <option value="false">Ineligible</option>
              </select>
              <button
                onClick={() => fetchStudents()}
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleExportStudents}
                disabled={isExporting}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Students CSV'}
              </button>
            </div>
          </div>

          {exportError && (
            <div className="px-6 py-3 bg-red-50 text-red-700 text-sm font-semibold border-b border-red-100">
              {exportError}
            </div>
          )}

          <div className="px-6 py-4 border-b border-gray-100 bg-white flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bulk Promotion</span>
            <select
              value={bulkSemester}
              onChange={(e) => setBulkSemester(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold bg-white"
            >
              <option value="">Select semester</option>
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <option key={s} value={s}>Semester {s} → {s + 1}</option>
              ))}
            </select>
            <button
              onClick={promoteBulk}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Promote Semester
            </button>
            {bulkPromotionResult && (
              <span className="text-xs font-semibold text-gray-600">
                Promoted: {bulkPromotionResult.promotedCount}, Skipped: {bulkPromotionResult.skippedCount}
              </span>
            )}
          </div>

          {studentsError && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold border-b border-red-100">
              {studentsError}
            </div>
          )}

          {studentsLoading ? (
            <div className="p-8 text-center text-gray-500 font-medium">Loading students...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">USN</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dept</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sem</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Eligible</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Open</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dept</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-semibold text-gray-900">{s.name || '—'}</td>
                      <td className="p-4 text-gray-700 font-medium">{s.usn || '—'}</td>
                      <td className="p-4 text-gray-700 font-medium">{s.email || '—'}</td>
                      <td className="p-4 text-gray-700 font-semibold">{s.department || '—'}</td>
                      <td className="p-4 text-gray-700 font-semibold">
                        {s.semester === null || s.semester === undefined || s.semester === 0 ? '—' : s.semester}
                      </td>
                      <td className="p-4">
                        {s.eligible ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            ELIGIBLE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            INELIGIBLE
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {s.openElectiveSubmitted ? (
                          <span className="text-xs font-black text-green-700">YES</span>
                        ) : (
                          <span className="text-xs font-black text-gray-400">NO</span>
                        )}
                      </td>
                      <td className="p-4">
                        {s.deptElectiveSubmitted ? (
                          <span className="text-xs font-black text-green-700">YES</span>
                        ) : (
                          <span className="text-xs font-black text-gray-400">NO</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => promoteStudent(s.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-colors shadow-sm border border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                          >
                            Promote
                          </button>
                          <button
                            onClick={() => toggleEligibility(s.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-colors shadow-sm border ${
                              s.eligible
                                ? 'bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                                : 'bg-white border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300'
                            }`}
                          >
                            {s.eligible ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!studentsLoading && students.length === 0 && (
                <div className="p-10 text-center text-gray-500 font-medium">No students found.</div>
              )}
            </div>
          )}
        </div>

        {/* Bulk Student Import */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Bulk Student Import
            </h2>
            <span className="text-xs font-semibold text-gray-400">CSV · max file size 5 MB</span>
          </div>

          <div className="p-6">
            <div className="mb-5 p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Expected CSV Format
              </h4>
              <p className="text-xs font-mono text-blue-800 bg-white/70 px-3 py-2 rounded-lg border border-blue-100 mb-2">
                name,email,usn,department,currentSemester,isEligible
              </p>
              <ul className="text-xs font-medium text-blue-700 space-y-1 list-disc list-inside ml-1">
                <li>Allowed domains: @dsce.edu.in · @dayanandasagar.edu</li>
                <li>currentSemester: 1–8</li>
                <li>isEligible: true / false (defaults to true if omitted)</li>
                <li>Duplicate emails and USNs are skipped per row</li>
              </ul>
            </div>

            <form onSubmit={handleImportStudents} className="flex flex-col gap-4">
              {importError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {importError}
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select CSV File (.csv)</label>
                <input
                  id="student-import-file"
                  type="file"
                  accept=".csv"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors border border-gray-200 rounded-xl p-2"
                  onChange={(e) => { setImportFile(e.target.files[0]); setImportError(null); }}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isImporting || !importFile}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isImporting ? 'Importing...' : 'Import Students'}
                </button>
                {importResult && (
                  <button
                    type="button"
                    onClick={() => setShowImportResult(true)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                  >
                    View Last Result
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Import Result Modal */}
      {showImportResult && importResult && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Import Summary
              </h3>
              <button onClick={() => setShowImportResult(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                  <div className="text-2xl font-black text-gray-900">{importResult.totalRows}</div>
                  <div className="text-xs font-semibold text-gray-500 mt-1">Total Rows</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="text-2xl font-black text-green-700">{importResult.importedCount}</div>
                  <div className="text-xs font-semibold text-green-600 mt-1">Imported</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                  <div className="text-2xl font-black text-red-700">{importResult.skippedCount}</div>
                  <div className="text-xs font-semibold text-red-500 mt-1">Skipped</div>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-600 mb-4">{importResult.message}</p>

              {importResult.failedRows && importResult.failedRows.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Failed Rows</h4>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-red-100 divide-y divide-red-50">
                    {importResult.failedRows.map((row) => (
                      <div key={row.rowNumber} className="flex items-start gap-3 px-4 py-3 bg-red-50/40">
                        <span className="text-xs font-black text-red-400 mt-0.5 min-w-[4rem]">Row {row.rowNumber}</span>
                        <span className="text-xs font-medium text-red-700">{row.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowImportResult(false)}
                className="mt-6 w-full px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminStudents;
