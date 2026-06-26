import { useState } from 'react';
import api from '../api';

function ListManager({ title, items, endpoint, onRefresh }) {
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const add = async () => {
    if (!newName.trim()) return;
    setError('');
    try {
      await api(`/api/settings/${endpoint}`, { method: 'POST', body: { name: newName.trim() } });
      setNewName('');
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const save = async (id) => {
    if (!editName.trim()) return;
    setError('');
    try {
      await api(`/api/settings/${endpoint}/${id}`, { method: 'PUT', body: { name: editName.trim() } });
      setEditId(null);
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggle = async (item) => {
    try {
      await api(`/api/settings/${endpoint}/${item.id}`, {
        method: 'PUT',
        body: { active: !item.active },
      });
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="list-manager">
      <h3>{title}</h3>
      {error && <div className="form-error">{error}</div>}
      <ul className="managed-list">
        {items.map(item => (
          <li key={item.id} className={!item.active ? 'inactive' : ''}>
            {editId === item.id ? (
              <div className="edit-row">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && save(item.id)}
                  autoFocus
                />
                <button className="btn-sm btn-primary" onClick={() => save(item.id)}>Save</button>
                <button className="btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
              </div>
            ) : (
              <div className="item-row">
                <span className="item-name">{item.name}</span>
                <div className="item-actions">
                  <button className="btn-sm btn-secondary" onClick={() => { setEditId(item.id); setEditName(item.name); }}>Edit</button>
                  <button className="btn-sm btn-secondary" onClick={() => toggle(item)}>
                    {item.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="add-row">
        <input
          placeholder={`Add new ${title.slice(0, -1).toLowerCase()}…`}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button className="btn-primary btn-sm" onClick={add}>Add</button>
      </div>
    </div>
  );
}

export default function Settings({ properties, technicians, categories, onRefresh }) {
  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <p className="settings-hint">Deactivating an item hides it from forms but preserves historical records.</p>
      <div className="settings-grid">
        <ListManager title="Properties" items={properties} endpoint="properties" onRefresh={onRefresh} />
        <ListManager title="Technicians" items={technicians} endpoint="technicians" onRefresh={onRefresh} />
        <ListManager title="Categories" items={categories} endpoint="categories" onRefresh={onRefresh} />
      </div>
    </div>
  );
}
