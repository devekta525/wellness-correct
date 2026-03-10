import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Calendar, Loader2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminReportsPage = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    adminAPI
      .getReportTypes()
      .then((res) => setTypes(res.data.types || []))
      .catch(() => toast.error('Failed to load report types'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    if (!selectedType) {
      toast.error('Select a report type');
      return;
    }
    setDownloading(true);
    try {
      const params = { type: selectedType };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await adminAPI.downloadReport(params);
      const blob = res.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = res.headers['content-disposition']?.split('filename=')?.[1]?.replace(/"/g, '') || `report-${selectedType}-${Date.now()}.xlsx`;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (err) {
      toast.error(err.message || 'Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const selectedMeta = types.find((t) => t.id === selectedType);
  const showDateRange = selectedMeta?.supportsDateRange;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="text-primary-600" size={28} />
          Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Generate and download Excel reports for orders, products, customers, and more.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 max-w-2xl">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Generate Excel Report</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Report type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input w-full"
            >
              <option value="">Choose a report...</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {showDateRange && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-1.5">
                  <Calendar size={14} /> Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block flex items-center gap-1.5">
                  <Calendar size={14} /> End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading || !selectedType}
            className="btn-primary flex items-center gap-2"
          >
            {downloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Excel
              </>
            )}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <strong>Available reports:</strong> Orders (with date filter), Products, Customers, Sales Summary (with date filter), Categories, Brands, Reviews (with date filter), Coupons. Date range is optional; leave empty for all data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
