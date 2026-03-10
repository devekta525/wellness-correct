import { useState, useEffect } from 'react';
import { Users, Search, Eye, Lock, Unlock } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminCustomersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ page, limit: 20, role: 'customer', search });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {} finally { setLoading(false); }
  };

  const toggleStatus = async (user) => {
    setUpdating(user._id);
    try {
      await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User blocked' : 'User unblocked');
      fetchUsers();
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Users className="text-primary-600" size={26} />Customers</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input pl-8 py-2 text-sm w-52" placeholder="Search name, email..." />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex justify-center py-10"><Loader /></div> : (
          <div className="table-responsive">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Customer', 'Email', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No customers found</td></tr>
                ) : users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {user.name?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setSelectedUser(user)} className="p-1.5 hover:bg-primary-50 text-primary-600 rounded-lg"><Eye size={14} /></button>
                        <button onClick={() => toggleStatus(user)} disabled={updating === user._id}
                          className={`p-1.5 rounded-lg transition-colors ${user.isActive ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-600'}`}>
                          {updating === user._id ? <Loader size="sm" /> : user.isActive ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination currentPage={page} totalPages={pagination?.pages || 1} onPageChange={setPage} />

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Customer Details" size="md">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black">
                {selectedUser.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedUser.name}</h3>
                <p className="text-gray-500 text-sm">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Phone', value: selectedUser.phone || 'Not set' },
                { label: 'Status', value: selectedUser.isActive ? 'Active' : 'Blocked' },
                { label: 'Role', value: selectedUser.role },
                { label: 'Joined', value: new Date(selectedUser.createdAt).toLocaleDateString('en-IN') },
                { label: 'Email Verified', value: selectedUser.isEmailVerified ? 'Yes' : 'No' },
                { label: 'Wishlist', value: `${selectedUser.wishlist?.length || 0} items` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-medium text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {selectedUser.addresses?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Saved Addresses ({selectedUser.addresses.length})</h4>
                {selectedUser.addresses.map((addr, i) => (
                  <div key={i} className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-2">
                    <span className="font-semibold">{addr.label}:</span> {addr.street}, {addr.city}, {addr.state}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCustomersPage;
