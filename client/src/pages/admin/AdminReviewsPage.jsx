import { useState, useEffect } from 'react';
import { Star, Check, X, MessageSquare } from 'lucide-react';
import { reviewAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [replyModal, setReplyModal] = useState(null);
  const [reply, setReply] = useState('');
  const [updating, setUpdating] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchReviews(); }, [page, statusFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewAPI.getAll({ page, limit: 20, status: statusFilter });
      setReviews(res.data.reviews);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const handleUpdate = async (id, status, adminReply = undefined) => {
    setUpdating(id);
    try {
      await reviewAPI.update(id, { status, ...(adminReply !== undefined && { adminReply }) });
      toast.success(`Review ${status}`);
      fetchReviews();
      setReplyModal(null);
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(null); }
  };

  const Stars = ({ rating }) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Star className="text-primary-600" size={26} />Reviews</h1>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><Loader /></div> : (
          <div className="divide-y divide-gray-50">
            {reviews.length === 0 ? <div className="text-center py-10 text-gray-400">No {statusFilter} reviews</div> :
              reviews.map(review => (
                <div key={review._id} className="p-5 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {review.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{review.user?.name}</p>
                          <Stars rating={review.rating} />
                        </div>
                        {review.isVerifiedPurchase && <span className="badge bg-green-100 text-green-700 text-xs">Verified</span>}
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <img src={review.product?.thumbnail} alt="" className="w-6 h-6 rounded object-cover" />
                        <span className="text-xs text-gray-500 font-medium">{review.product?.title}</span>
                      </div>
                      {review.title && <p className="font-semibold text-gray-800 text-sm">{review.title}</p>}
                      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                      {review.adminReply && (
                        <div className="mt-2 p-2 bg-primary-50 rounded-lg text-xs text-primary-800">
                          <span className="font-semibold">Your reply:</span> {review.adminReply}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {statusFilter === 'pending' && (
                        <>
                          <button onClick={() => handleUpdate(review._id, 'approved')} disabled={updating === review._id}
                            className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleUpdate(review._id, 'rejected')} disabled={updating === review._id}
                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors">
                            <X size={14} />
                          </button>
                        </>
                      )}
                      <button onClick={() => { setReplyModal(review); setReply(review.adminReply || ''); }}
                        className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors">
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      <Pagination currentPage={page} totalPages={pagination?.pages || 1} onPageChange={setPage} />

      <Modal isOpen={!!replyModal} onClose={() => setReplyModal(null)} title="Reply to Review" size="sm">
        {replyModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <Stars rating={replyModal.rating} />
              <p className="text-gray-700 mt-1">{replyModal.comment}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Your Reply</label>
              <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} className="input resize-none" placeholder="Write your response..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReplyModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleUpdate(replyModal._id, replyModal.status, reply)} className="btn-primary flex-1">Send Reply</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminReviewsPage;
