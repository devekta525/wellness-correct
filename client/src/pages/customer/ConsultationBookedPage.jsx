import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ConsultationBookedPage = () => {
  const { consultationId } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'
  const [consultation, setConsultation] = useState(null);

  useEffect(() => {
    const gateway = new URLSearchParams(window.location.search).get('gateway');
    if (!consultationId || !gateway) {
      setStatus('failed');
      return;
    }
    doctorAPI
      .verifyConsultationPayment({ gatewayId: gateway, consultationId })
      .then((res) => {
        setConsultation(res.data.consultation);
        setStatus('success');
        toast.success('Payment verified. Consultation booked!');
      })
      .catch(() => {
        setStatus('failed');
        toast.error('Payment verification failed or already completed.');
      });
  }, [consultationId]);

  if (status === 'loading') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary-500" />
        <p className="text-gray-600 dark:text-gray-400">Verifying your payment…</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="page-container py-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mb-4">
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment could not be verified</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
          If you have already paid, your consultation may still be confirmed. Check My Consultations.
        </p>
        <div className="flex gap-3">
          <Link to="/my-consultations" className="btn-primary">My Consultations</Link>
          <Link to="/consultation" className="btn-secondary">Browse doctors</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-12 flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mb-6">
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Consultation booked!</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
        Your appointment is confirmed. You can view details and the meeting link in My Consultations.
      </p>
      <div className="flex gap-3">
        <Link to="/my-consultations" className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700">
          View my consultations
        </Link>
        <Link to="/consultation" className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">
          Book another
        </Link>
      </div>
      {consultation && (
        <p className="mt-6 text-xs text-gray-400">
          {new Date(consultation.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      )}
    </div>
  );
};

export default ConsultationBookedPage;
