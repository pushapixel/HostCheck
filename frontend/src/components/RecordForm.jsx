import { useState, useEffect } from 'react';

const today = () => new Date().toISOString().split('T')[0];

export default function RecordForm({ properties, technicians, categories, onSave, editRecord, onCancel }) {
  const blank = {
    property_id: '',
    date: today(),
    category_id: '',
    task: '',
    technician_id: '',
    status: 'Complete',
    notes: '',
  };

  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editRecord) {
      setForm({
        property_id: editRecord.property_id,
        date: editRecord.date?.split('T')[0] || today(),
        category_id: editRecord.category_id,
        task: editRecord.task,
        technician_id: editRecord.technician_id,
        status: editRecord.status,
        notes: editRecord.notes || '',
      });
    } else {
      setForm(blank);
    }
  }, [editRecord]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.property_id || !form.date || !form.category_id || !form.task || !form.technician_id) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form, editRecord?.id);
      if (!editRecord) setForm({ ...blank, date: today() });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activeProps = properties.filter(p => p.active);
  const activeTechs = technicians.filter(t => t.active);
  const activeCats = categories.filter(c => c.active);

  return (
    <div className="record-form">
      <h2 className="form-title">{editRecord ? 'Edit Record' : 'Add Record'}</h2>
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid">
        <div className="form-group">
          <label>Property *</label>
          <select value={form.property_id} onChange={set('property_id')}>
            <option value="">Select…</option>
            {activeProps.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input type="date" value={form.date} onChange={set('date')} />
        </div>
        <div className="form-group">
          <label>Category *</label>
          <select value={form.category_id} onChange={set('category_id')}>
            <option value="">Select…</option>
            {activeCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Technician *</label>
          <select value={form.technician_id} onChange={set('technician_id')}>
            <option value="">Select…</option>
            {activeTechs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="form-group form-group--full">
          <label>Task *</label>
          <input type="text" value={form.task} onChange={set('task')} placeholder="Describe the work done…" />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={set('status')}>
            <option>Scheduled</option>
            <option>In Progress</option>
            <option>Complete</option>
          </select>
        </div>
        <div className="form-group form-group--full">
          <label>Notes</label>
          <textarea value={form.notes} onChange={set('notes')} placeholder="Optional notes…" rows={2} />
        </div>
      </div>
      <div className="form-actions">
        {editRecord && <button className="btn-secondary" onClick={onCancel}>Cancel</button>}
        <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : editRecord ? 'Save Changes' : 'Add Record'}
        </button>
      </div>
    </div>
  );
}
