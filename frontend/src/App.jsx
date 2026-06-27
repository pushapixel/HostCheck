import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Settings from './pages/Settings';
import RecordForm from './components/RecordForm';
import RecordsTable from './components/RecordsTable';
import api from './api';

export default function App() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('log');
  const [records, setRecords] = useState([]);
  const [properties, setProperties] = useState([]);
  const [superstars, setSuperstars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLookups = useCallback(async () => {
    const [props, techs, cats] = await Promise.all([
      api('/api/settings/properties'),
      api('/api/settings/technicians'),
      api('/api/settings/categories'),
    ]);
    setProperties(props);
    setSuperstars(techs);
    setCategories(cats);
  }, []);

  const fetchRecords = useCallback(async () => {
    const data = await api('/api/records');
    setRecords(data);
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchLookups(), fetchRecords()]).finally(() => setLoading(false));
  }, [user, fetchLookups, fetchRecords]);

  const handleSave = async (form, id) => {
    if (id) {
      await api(`/api/records/${id}`, { method: 'PUT', body: form });
      setEditRecord(null);
    } else {
      await api('/api/records', { method: 'POST', body: form });
    }
    await fetchRecords();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    await api(`/api/records/${id}`, { method: 'DELETE' });
    await fetchRecords();
  };

  // Loading auth state
  if (user === undefined) {
    return <div className="loading-screen">Loading…</div>;
  }

  // Not logged in
  if (!user) return <Login />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <img src="/icons/apple-touch-icon.png" alt="HostCheck" className="header-logo-img" />
          <span className="header-title">HostCheck</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${tab === 'log' ? 'nav-btn--active' : ''}`}
            onClick={() => { setTab('log'); setEditRecord(null); }}
          >
            Log
          </button>
          <button
            className={`nav-btn ${tab === 'settings' ? 'nav-btn--active' : ''}`}
            onClick={() => setTab('settings')}
          >
            Settings
          </button>
        </nav>
        <div className="header-right">
          {user.photo && <img src={user.photo} alt={user.name} className="user-avatar" />}
          <span className="user-name">{user.name}</span>
          <button className="btn-logout" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="loading-screen">Loading…</div>
        ) : tab === 'log' ? (
          <>
            <RecordForm
              properties={properties}
              superstars={superstars}
              categories={categories}
              onSave={handleSave}
              editRecord={editRecord}
              onCancel={() => setEditRecord(null)}
            />
            <RecordsTable
              records={records}
              properties={properties}
              onEdit={(r) => { setEditRecord(r); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onDelete={handleDelete}
            />
          </>
        ) : (
          <Settings
            properties={properties}
            superstars={superstars}
            categories={categories}
            onRefresh={fetchLookups}
          />
        )}
      </main>
    </div>
  );
}
