import { useEffect, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { Ciclo, CicloBody } from '../../models/types'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .ciclos-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }

  :root {
    --teal-dark:   #0d4f5c;
    --teal-mid:    #0a9396;
    --teal-light:  #94d2bd;
    --teal-pale:   #e8f4f5;
    --accent:      #e9c46a;
    --danger:      #e76f51;
    --text-main:   #212529;
    --text-muted:  #6c757d;
    --border:      #dee2e6;
    --card-bg:     #ffffff;
  }

  /* Page header */
  .ciclos-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
  }
  .ciclos-title {
    font-size: 22px; font-weight: 700; color: var(--teal-dark);
    display: flex; align-items: center; gap: 10px; margin: 0;
  }
  .ciclos-title-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 17px; flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(10,147,150,0.3);
  }
  .ciclos-subtitle {
    font-size: 13px; color: var(--text-muted); margin-top: 2px; font-weight: 400;
  }

  /* Btn nuevo */
  .btn-nuevo {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    color: white; font-size: 13px; font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(10,147,150,0.3);
    transition: opacity 0.18s, transform 0.12s;
  }
  .btn-nuevo:hover { opacity: 0.88; transform: translateY(-1px); }

  /* Alert */
  .ciclos-alert {
    display: flex; align-items: center; gap: 10px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 12px 16px; color: #b91c1c; font-size: 13px; margin-bottom: 20px;
  }

  /* Form card */
  .ciclos-form-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  }
  .ciclos-form-header {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 20px;
    background: linear-gradient(90deg, var(--teal-pale), #ffffff);
    border-bottom: 1px solid var(--border);
  }
  .ciclos-form-header-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--teal-mid);
  }
  .ciclos-form-title {
    font-size: 14px; font-weight: 700; color: var(--teal-dark); margin: 0;
  }
  .ciclos-form-body { padding: 20px; }

  .ciclos-field label {
    display: block; font-size: 12px; font-weight: 600;
    color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .ciclos-field input {
    width: 100%; padding: 9px 12px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit;
    transition: border-color 0.18s, box-shadow 0.18s;
    outline: none;
    background: #fafafa;
  }
  .ciclos-field input:focus {
    border-color: var(--teal-mid);
    box-shadow: 0 0 0 3px rgba(10,147,150,0.12);
    background: white;
  }
  .ciclos-form-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
    gap: 14px; margin-bottom: 16px;
  }
  .ciclos-form-actions { display: flex; gap: 10px; }
  .btn-save {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 9px; border: none;
    background: var(--teal-mid); color: white;
    font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: background 0.18s, transform 0.12s;
    box-shadow: 0 4px 10px rgba(10,147,150,0.25);
  }
  .btn-save:hover { background: var(--teal-dark); transform: translateY(-1px); }
  .btn-cancel {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 9px;
    border: 1.5px solid var(--border); background: white;
    color: var(--text-muted); font-size: 13px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    transition: border-color 0.18s, color 0.18s;
  }
  .btn-cancel:hover { border-color: #adb5bd; color: var(--text-main); }

  /* Table card */
  .ciclos-table-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  }
  .ciclos-table-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--teal-pale), #ffffff);
  }
  .ciclos-count-badge {
    background: var(--teal-mid); color: white;
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 20px;
  }

  .ciclos-table { width: 100%; border-collapse: collapse; }
  .ciclos-table thead th {
    padding: 11px 16px;
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: var(--text-muted);
    background: #f8fafc; border-bottom: 1px solid var(--border);
    text-align: left;
  }
  .ciclos-table thead th:last-child { text-align: right; }
  .ciclos-table tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .ciclos-table tbody tr:last-child { border-bottom: none; }
  .ciclos-table tbody tr:hover { background: var(--teal-pale); }
  .ciclos-table tbody td {
    padding: 13px 16px; font-size: 13px; color: var(--text-main);
    vertical-align: middle;
  }
  .ciclos-table tbody td:last-child { text-align: right; }

  /* Nombre cell */
  .ciclo-nombre {
    font-weight: 600; color: var(--teal-dark);
    display: flex; align-items: center; gap: 8px;
  }
  .ciclo-nombre-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--teal-mid); flex-shrink: 0;
  }

  /* Duration badge */
  .dur-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--teal-pale); color: var(--teal-dark);
    font-size: 12px; font-weight: 600;
    padding: 3px 10px; border-radius: 20px;
    border: 1px solid rgba(10,147,150,0.2);
  }

  /* Date cell */
  .date-cell { color: var(--text-muted); font-size: 13px; }

  /* Action buttons */
  .btn-edit {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    border: 1.5px solid var(--teal-mid); background: transparent;
    color: var(--teal-mid); font-size: 12px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    transition: background 0.15s, color 0.15s;
    margin-right: 6px;
  }
  .btn-edit:hover { background: var(--teal-mid); color: white; }
  .btn-delete {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    border: 1.5px solid var(--danger); background: transparent;
    color: var(--danger); font-size: 12px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn-delete:hover { background: var(--danger); color: white; }

  /* Empty state */
  .ciclos-empty {
    text-align: center; padding: 48px 20px;
    color: var(--text-muted);
  }
  .ciclos-empty i { font-size: 40px; color: var(--teal-light); margin-bottom: 12px; display: block; }
  .ciclos-empty p { font-size: 14px; margin: 0; }

  /* Loading */
  .ciclos-loading {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 60px; color: var(--teal-mid); font-size: 14px; font-weight: 500;
  }
  .ciclos-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2.5px solid var(--teal-light);
    border-top-color: var(--teal-mid);
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .ciclos-form-row { grid-template-columns: 1fr 1fr; }
    .ciclos-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
  @media (max-width: 500px) {
    .ciclos-form-row { grid-template-columns: 1fr; }
  }
`

export function AdminCiclosView() {
  const [items, setItems] = useState<Ciclo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Ciclo | null>(null)
  const [form, setForm] = useState<CicloBody>({ nombre: '', fechaInicio: '', duracion: 0, fechaFin: '' })

  const load = () => {
    setLoading(true)
    adminApi.getCiclos()
      .then((res) => setItems(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('No se pudieron cargar los ciclos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await adminApi.updateCiclo(editing.id, form)
        setEditing(null)
      } else {
        await adminApi.createCiclo(form)
      }
      setForm({ nombre: '', fechaInicio: '', duracion: 0, fechaFin: '' })
      setShowForm(false)
      load()
    } catch {
      setError('Error al guardar el ciclo.')
    }
  }

  const handleDelete = async (c: Ciclo) => {
    if (!confirm(`¿Eliminar ciclo "${getNombre(c)}"?`)) return
    try {
      await adminApi.deleteCiclo(c.id)
      load()
    } catch {
      setError('No se pudo eliminar el ciclo.')
    }
  }

  const openEdit = (c: Ciclo) => {
    setEditing(c)
    setForm({
      nombre: getNombre(c),
      fechaInicio: getFechaInicio(c),
      duracion: c.duracion_meses ?? c.duracion ?? 0,
      fechaFin: getFechaFin(c),
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm({ nombre: '', fechaInicio: '', duracion: 0, fechaFin: '' })
  }

  const getFechaInicio = (c: Ciclo) => c.fecha_inicio ?? c.fechaInicio ?? ''
  const getFechaFin = (c: Ciclo) => c.fecha_fin ?? c.fechaFin ?? ''
  const getNombre = (c: Ciclo) => c.nombres ?? c.nombre ?? ''
  const formatDate = (date: string) => {
    if (!date) return '—'
    try { return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) }
    catch { return date }
  }
  const getDurLabel = (c: Ciclo) => {
    const val = c.duracion_meses ?? c.duracion
    if (val == null) return '—'
    return `${val} ${c.duracion_meses != null ? (val === 1 ? 'mes' : 'meses') : (val === 1 ? 'sem' : 'sem')}`
  }

  if (loading) return (
    <div className="ciclos-wrap">
      <style>{styles}</style>
      <div className="ciclos-loading">
        <div className="ciclos-spinner" />
        Cargando ciclos...
      </div>
    </div>
  )

  return (
    <div className="ciclos-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="ciclos-header">
        <div>
          <h2 className="ciclos-title">
            <span className="ciclos-title-icon"><i className="bi bi-arrow-repeat" /></span>
            <span>
              Ciclos académicos
              <div className="ciclos-subtitle">Gestiona los ciclos de tu institución</div>
            </span>
          </h2>
        </div>
        <button
          className="btn-nuevo"
          onClick={() => { setEditing(null); setForm({ nombre: '', fechaInicio: '', duracion: 0, fechaFin: '' }); setShowForm(true) }}
        >
          <i className="bi bi-plus-lg" /> Nuevo ciclo
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="ciclos-alert">
          <i className="bi bi-exclamation-circle-fill" />
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="ciclos-form-card">
          <div className="ciclos-form-header">
            <div className="ciclos-form-header-dot" />
            <h5 className="ciclos-form-title">
              {editing ? 'Editar ciclo' : 'Crear nuevo ciclo'}
            </h5>
          </div>
          <div className="ciclos-form-body">
            <form onSubmit={handleSubmit}>
              <div className="ciclos-form-row">
                <div className="ciclos-field">
                  <label>Nombre</label>
                  <input
                    type="text" placeholder="Ej: Ciclo 2024-I"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="ciclos-field">
                  <label>Fecha inicio</label>
                  <input
                    type="date" value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    required
                  />
                </div>
                <div className="ciclos-field">
                  <label>Duración (sem)</label>
                  <input
                    type="number" placeholder="0"
                    value={form.duracion || ''}
                    onChange={(e) => setForm({ ...form, duracion: parseInt(e.target.value, 10) || 0 })}
                    required min={1}
                  />
                </div>
                <div className="ciclos-field">
                  <label>Fecha fin (opcional)</label>
                  <input
                    type="date" value={form.fechaFin || ''}
                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                  />
                </div>
              </div>
              <div className="ciclos-form-actions">
                <button type="submit" className="btn-save">
                  <i className="bi bi-check-lg" />
                  {editing ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" className="btn-cancel" onClick={cancelForm}>
                  <i className="bi bi-x-lg" /> Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="ciclos-table-card">
        <div className="ciclos-table-card-header">
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            <i className="bi bi-table me-2" style={{ color: 'var(--teal-mid)' }} />
            Lista de ciclos
          </span>
          <span className="ciclos-count-badge">{items.length} registros</span>
        </div>

        {items.length === 0 ? (
          <div className="ciclos-empty">
            <i className="bi bi-calendar-x" />
            <p>No hay ciclos registrados aún.<br />Crea el primero con el botón <strong>Nuevo ciclo</strong>.</p>
          </div>
        ) : (
          <table className="ciclos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Inicio</th>
                <th>Duración</th>
                <th>Fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="ciclo-nombre">
                      <span className="ciclo-nombre-dot" />
                      {getNombre(c)}
                    </div>
                  </td>
                  <td className="date-cell">
                    <i className="bi bi-calendar3 me-1" style={{ color: 'var(--teal-mid)' }} />
                    {formatDate(getFechaInicio(c))}
                  </td>
                  <td>
                    <span className="dur-badge">
                      <i className="bi bi-clock" />
                      {getDurLabel(c)}
                    </span>
                  </td>
                  <td className="date-cell">
                    {getFechaFin(c) ? (
                      <>
                        <i className="bi bi-calendar-check me-1" style={{ color: 'var(--teal-light)' }} />
                        {formatDate(getFechaFin(c))}
                      </>
                    ) : '—'}
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => openEdit(c)}>
                      <i className="bi bi-pencil-fill" /> Editar
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(c)}>
                      <i className="bi bi-trash3-fill" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}