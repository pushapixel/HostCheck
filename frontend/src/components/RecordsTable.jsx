import { useState } from 'react';

const STATUS_COLORS = {
  'Complete': 'status--complete',
  'In Progress': 'status--progress',
  'Scheduled': 'status--scheduled',
};

const COLS = [
  { key: 'date', label: 'Date' },
  { key: 'property', label: 'Property' },
  { key: 'category', label: 'Category' },
  { key: 'task', label: 'Task' },
  { key: 'technician', label: 'Technician' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
];

export default function RecordsTable({ records, properties, onEdit, onDelete }) {
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [filterProp, setFilterProp] = useState('');

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const filtered = filterProp
    ? records.filter(r => String(r.property_id) === filterProp)
    : records;

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortCol] ?? '';
    let bv = b[sortCol] ?? '';
    if (sortCol === 'date') {
      av = new Date(av);
      bv = new Date(bv);
    } else {
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const activeProps = properties.filter(p => p.active);

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="sort-icon sort-icon--inactive">↕</span>;
    return <span className="sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="records-section">
      <div className="records-header">
        <h2>Maintenance Log</h2>
        <div className="filter-bar">
          <label>Filter by property</label>
          <select value={filterProp} onChange={e => setFilterProp(e.target.value)}>
            <option value="">All Properties</option>
            {activeProps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">No records yet. Add one above.</div>
      ) : (
        <div className="table-wrapper">
          <table className="records-table">
            <thead>
              <tr>
                {COLS.map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="sortable-th">
                    {col.label} <SortIcon col={col.key} />
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => (
                <tr key={r.id}>
                  <td className="td-mono">{r.date?.split('T')[0]}</td>
                  <td><span className="tag tag--property">{r.property}</span></td>
                  <td>{r.category}</td>
                  <td className="td-task">{r.task}</td>
                  <td>{r.technician}</td>
                  <td><span className={`status-badge ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                  <td className="td-notes">{r.notes || '—'}</td>
                  <td className="td-actions">
                    <button className="btn-icon" onClick={() => onEdit(r)} title="Edit">✏️</button>
                    <button className="btn-icon btn-icon--danger" onClick={() => onDelete(r.id)} title="Delete">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="records-count">{sorted.length} record{sorted.length !== 1 ? 's' : ''}</div>
    </div>
  );
}
