import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { Ciclo, Curso, CursoBody, MaterialAdmin } from '../../models/types'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .cursos-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }

  .cursos-wrap {
    --teal-dark:  #0d4f5c;
    --teal-mid:   #0a9396;
    --teal-light: #94d2bd;
    --teal-pale:  #e8f4f5;
    --danger:     #e76f51;
    --text-main:  #212529;
    --text-muted: #6c757d;
    --border:     #dee2e6;
  }

  .cursos-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
  }
  .cursos-title {
    font-size: 22px; font-weight: 700; color: var(--teal-dark);
    display: flex; align-items: center; gap: 10px; margin: 0;
  }
  .cursos-title-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 17px; flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(10,147,150,0.3);
  }
  .cursos-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; font-weight: 400; }
  .cursos-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .btn-nuevo {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    color: white; font-size: 13px; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 12px rgba(10,147,150,0.3);
    transition: opacity 0.18s, transform 0.12s;
  }
  .btn-nuevo:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-reporte {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 10px;
    border: 1.5px solid var(--border); background: white;
    color: var(--text-muted); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: border-color 0.15s, color 0.15s;
  }
  .btn-reporte:hover { border-color: var(--teal-mid); color: var(--teal-dark); }

  .cursos-alert {
    display: flex; align-items: center; gap: 10px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 12px 16px; color: #b91c1c; font-size: 13px; margin-bottom: 20px;
  }
  .cursos-alert-success {
    display: flex; align-items: center; gap: 10px;
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
    padding: 12px 16px; color: #166534; font-size: 13px; margin-bottom: 20px;
  }

  .cursos-form-card {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; margin-bottom: 24px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  }
  .cursos-form-header {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 20px;
    background: linear-gradient(90deg, var(--teal-pale), #fff);
    border-bottom: 1px solid var(--border);
  }
  .cursos-form-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--teal-mid); }
  .cursos-form-title { font-size: 14px; font-weight: 700; color: var(--teal-dark); margin: 0; }
  .cursos-form-body { padding: 20px; }
  .cursos-form-row {
    display: grid; grid-template-columns: 1.5fr 1.5fr 1fr;
    gap: 14px; margin-bottom: 16px;
  }
  .cursos-field label {
    display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;
  }
  .cursos-field input, .cursos-field select {
    width: 100%; padding: 9px 12px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: #fafafa;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
    appearance: none; -webkit-appearance: none;
  }
  .cursos-field input:focus, .cursos-field select:focus {
    border-color: var(--teal-mid); box-shadow: 0 0 0 3px rgba(10,147,150,0.12); background: white;
  }
  .select-wrapper { position: relative; }
  .select-wrapper::after {
    content: '\\f282'; font-family: 'Bootstrap Icons';
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none; font-size: 12px;
  }
  .cursos-form-actions { display: flex; gap: 10px; }
  .btn-save {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 9px; border: none;
    background: var(--teal-mid); color: white;
    font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(10,147,150,0.25);
    transition: background 0.18s, transform 0.12s;
  }
  .btn-save:hover { background: var(--teal-dark); transform: translateY(-1px); }
  .btn-cancel {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 9px;
    border: 1.5px solid var(--border); background: white;
    color: var(--text-muted); font-size: 13px; font-weight: 600;
    font-family: inherit; cursor: pointer; transition: border-color 0.18s, color 0.18s;
  }
  .btn-cancel:hover { border-color: #adb5bd; color: var(--text-main); }

  .cursos-table-card {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  }
  .cursos-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--teal-pale), #fff);
  }
  .cursos-table-header-left { font-size: 13px; font-weight: 600; color: #374151; }
  .cursos-count-badge {
    background: var(--teal-mid); color: white;
    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
  }

  .cursos-filter-bar {
    padding: 12px 20px; border-bottom: 1px solid var(--border);
    background: #fafafa; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  }
  .cursos-search-input-wrap { position: relative; flex: 1; min-width: 180px; max-width: 300px; }
  .cursos-search-input-wrap i {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); font-size: 14px;
  }
  .cursos-search-input {
    width: 100%; padding: 7px 12px 7px 32px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: white; outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .cursos-search-input:focus { border-color: var(--teal-mid); box-shadow: 0 0 0 3px rgba(10,147,150,0.12); }
  .cursos-filter-ciclo { position: relative; min-width: 160px; }
  .cursos-filter-ciclo::after {
    content: '\\f282'; font-family: 'Bootstrap Icons';
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none; font-size: 11px;
  }
  .cursos-filter-ciclo select {
    width: 100%; padding: 7px 28px 7px 10px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 12px; font-family: inherit; background: white; outline: none;
    appearance: none; -webkit-appearance: none;
    transition: border-color 0.18s;
  }
  .cursos-filter-ciclo select:focus { border-color: var(--teal-mid); }

  .cursos-table { width: 100%; border-collapse: collapse; }
  .cursos-table thead th {
    padding: 11px 16px; text-align: left;
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: var(--text-muted);
    background: #f8fafc; border-bottom: 1px solid var(--border);
  }
  .cursos-table thead th:last-child { text-align: right; }
  .cursos-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background 0.15s; }
  .cursos-table tbody tr:last-child { border-bottom: none; }
  .cursos-table tbody tr:hover { background: var(--teal-pale); }
  .cursos-table tbody td { padding: 12px 16px; font-size: 13px; color: var(--text-main); vertical-align: middle; }
  .cursos-table tbody td:last-child { text-align: right; }

  .curso-nombre { display: flex; align-items: center; gap: 10px; }
  .curso-icon {
    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--teal-pale), var(--teal-light));
    display: flex; align-items: center; justify-content: center;
    color: var(--teal-dark); font-size: 13px;
  }
  .curso-nombre-text { font-weight: 600; color: var(--teal-dark); }
  .profesor-cell { display: flex; align-items: center; gap: 7px; }
  .profesor-cell i { color: var(--teal-light); font-size: 14px; }
  .ciclo-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--teal-pale); color: var(--teal-dark);
    font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px;
    border: 1px solid rgba(10,147,150,0.2);
  }

  .btn-edit {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 7px;
    border: 1.5px solid var(--teal-mid); background: transparent;
    color: var(--teal-mid); font-size: 11px; font-weight: 600;
    font-family: inherit; cursor: pointer; transition: background 0.15s, color 0.15s; margin-right: 5px;
  }
  .btn-edit:hover { background: var(--teal-mid); color: white; }
  .btn-delete {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 7px;
    border: 1.5px solid var(--danger); background: transparent;
    color: var(--danger); font-size: 11px; font-weight: 600;
    font-family: inherit; cursor: pointer; transition: background 0.15s, color 0.15s; margin-right: 5px;
  }
  .btn-delete:hover { background: var(--danger); color: white; }
  .btn-materiales {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 7px;
    border: 1.5px solid #8b5cf6; background: transparent;
    color: #8b5cf6; font-size: 11px; font-weight: 600;
    font-family: inherit; cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .btn-materiales:hover { background: #8b5cf6; color: white; }

  .cursos-empty { text-align: center; padding: 48px 20px; color: var(--text-muted); }
  .cursos-empty i { font-size: 40px; color: var(--teal-light); margin-bottom: 12px; display: block; }
  .cursos-empty p { font-size: 14px; margin: 0; }

  .cursos-loading {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 60px; color: var(--teal-mid); font-size: 14px; font-weight: 500;
  }
  .cursos-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2.5px solid var(--teal-light); border-top-color: var(--teal-mid);
    animation: cspin 0.7s linear infinite;
  }
  .cursos-spinner-sm {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: cspin 0.7s linear infinite;
  }
  @keyframes cspin { to { transform: rotate(360deg); } }

  /* Modal de materiales */
  .mat-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 3000; padding: 20px;
  }
  .mat-box {
    background: white; border-radius: 18px; width: 100%; max-width: 580px;
    max-height: 90vh; display: flex; flex-direction: column;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    animation: matIn 0.2s ease;
  }
  @keyframes matIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .mat-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, #f5f0fe, white);
    border-radius: 18px 18px 0 0; flex-shrink: 0;
  }
  .mat-header h5 { font-size: 15px; font-weight: 700; color: #4c1d95; margin: 0; }
  .mat-close {
    width: 30px; height: 30px; border-radius: 8px; border: none;
    background: #f1f5f9; color: var(--text-muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .mat-close:hover { background: #e2e8f0; }
  .mat-body { padding: 20px; overflow-y: auto; flex: 1; }
  .mat-footer {
    padding: 14px 20px; border-top: 1px solid var(--border); background: #fafafa;
    border-radius: 0 0 18px 18px; display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;
  }

  .mat-row {
    display: grid; grid-template-columns: 60px 1fr 1fr 36px;
    gap: 8px; align-items: center; margin-bottom: 10px;
    background: #f8fafc; border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px;
    transition: border-color 0.15s;
  }
  .mat-row:hover { border-color: #c4b5fd; }
  .mat-row label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 3px; }
  .mat-row input {
    width: 100%; padding: 6px 8px; border: 1.5px solid var(--border); border-radius: 7px;
    font-size: 12px; font-family: inherit; outline: none;
    transition: border-color 0.15s; background: white;
  }
  .mat-row input:focus { border-color: #8b5cf6; }
  .mat-row-del {
    width: 30px; height: 30px; border-radius: 7px; border: none;
    background: #fff0ed; color: var(--danger); font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .mat-row-del:hover { background: #ffe0d9; }
  .mat-add-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    border: 1.5px dashed #c4b5fd; background: #f5f0fe;
    color: #6d28d9; font-size: 12px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.15s; width: 100%; justify-content: center; margin-top: 8px;
  }
  .mat-add-btn:hover { border-color: #8b5cf6; background: #ede9fe; }
  .mat-save-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: white; font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(109,40,217,0.3);
    transition: opacity 0.18s;
  }
  .mat-save-btn:hover:not(:disabled) { opacity: 0.88; }
  .mat-save-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .mat-empty { text-align: center; padding: 28px; color: var(--text-muted); font-size: 13px; }
  .mat-empty i { font-size: 30px; display: block; margin-bottom: 8px; color: #c4b5fd; }

  @media (max-width: 768px) { .cursos-form-row { grid-template-columns: 1fr 1fr; } .mat-row { grid-template-columns: 50px 1fr 1fr 30px; } }
  @media (max-width: 500px) { .cursos-form-row { grid-template-columns: 1fr; } .mat-row { grid-template-columns: 1fr; } }
`

interface MatRow { semana: string; nombre: string; urlDrive: string }

export function AdminCursosView() {
  const [items, setItems]           = useState<Curso[]>([])
  const [ciclos, setCiclos]         = useState<Ciclo[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Curso | null>(null)
  const [form, setForm]             = useState<CursoBody>({ nombre: '', profesor: '', cicloId: 0 })
  const [search, setSearch]         = useState('')
  const [filterCicloId, setFilterCicloId] = useState<number | ''>('')

  // Modal materiales
  const [matModal, setMatModal]     = useState<{ cursoId: number; cursoNombre: string } | null>(null)
  const [matRows, setMatRows]       = useState<MatRow[]>([])
  const [matLoading, setMatLoading] = useState(false)
  const [matSaving, setMatSaving]   = useState(false)

  const reporteRef = useRef<HTMLSelectElement>(null)

  const load = () => {
    setLoading(true)
    Promise.all([adminApi.getCursos(), adminApi.getCiclos()])
      .then(([cursosRes, ciclosRes]) => {
        setItems(Array.isArray(cursosRes.data) ? cursosRes.data : [])
        setCiclos(Array.isArray(ciclosRes.data) ? ciclosRes.data : [])
      })
      .catch(() => setError('No se pudieron cargar los datos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.cicloId) { setError('Selecciona un ciclo.'); return }
    setError('')
    try {
      if (editing) {
        await adminApi.updateCurso(editing.id, form)
        setEditing(null)
      } else {
        await adminApi.createCurso(form)
      }
      setForm({ nombre: '', profesor: '', cicloId: 0 })
      setShowForm(false)
      load()
    } catch {
      setError('Error al guardar el curso.')
    }
  }

  const handleDelete = async (c: Curso) => {
    if (!confirm(`¿Eliminar curso "${c.nombre}"?`)) return
    setError('')
    try {
      await adminApi.deleteCurso(c.id)
      load()
    } catch {
      setError('No se pudo eliminar el curso.')
    }
  }

  const openEdit = (c: Curso) => {
    setEditing(c)
    setForm({ nombre: c.nombre, profesor: c.profesor, cicloId: c.ciclo_id ?? c.cicloId ?? 0 })
    setShowForm(true)
  }

  const cancelForm = () => { setShowForm(false); setEditing(null); setForm({ nombre: '', profesor: '', cicloId: 0 }) }

  const getCicloNombre = (id: number, cicloObj?: Ciclo) =>
    cicloObj?.nombres ?? cicloObj?.nombre ??
    ciclos.find((x) => x.id === id)?.nombres ??
    ciclos.find((x) => x.id === id)?.nombre ?? String(id)

  // Materiales modal
  const abrirMateriales = async (c: Curso) => {
    setMatModal({ cursoId: c.id, cursoNombre: c.nombre })
    setMatRows([])
    setMatLoading(true)
    try {
      const res = await adminApi.getMaterialesPorCurso(c.id)
      const mats: MaterialAdmin[] = Array.isArray(res.data) ? res.data : []
      setMatRows(mats.map((m) => ({
        semana: String(m.semana),
        nombre: m.nombre,
        urlDrive: m.url_drive ?? m.urlDrive ?? '',
      })))
    } catch {
      setMatRows([])
    } finally {
      setMatLoading(false)
    }
  }

  const guardarMateriales = async () => {
    if (!matModal) return
    setMatSaving(true)
    let errores = 0
    for (const row of matRows) {
      if (!row.semana || !row.nombre) continue
      try {
        await adminApi.upsertMaterial(matModal.cursoId, {
          semana: parseInt(row.semana),
          nombre: row.nombre,
          urlDrive: row.urlDrive || undefined,
        })
      } catch { errores++ }
    }
    setMatSaving(false)
    setMatModal(null)
    if (errores === 0) setSuccess('Materiales guardados correctamente.')
    else setError(`${errores} material(es) no se pudieron guardar.`)
  }

  const descargarReporte = async (cicloId: number) => {
    try {
      const res = await adminApi.reporteAlumnosCiclo(cicloId)
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url; a.download = `alumnos-ciclo-${cicloId}.xlsx`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Error al descargar el reporte.')
    }
  }

  const filtered = items.filter((c) => {
    const matchSearch = !search ||
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.profesor.toLowerCase().includes(search.toLowerCase())
    const matchCiclo = !filterCicloId ||
      (c.ciclo_id ?? c.cicloId) === filterCicloId
    return matchSearch && matchCiclo
  })

  if (loading) return (
    <div className="cursos-wrap">
      <style>{styles}</style>
      <div className="cursos-loading"><div className="cursos-spinner" /> Cargando cursos...</div>
    </div>
  )

  return (
    <div className="cursos-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="cursos-header">
        <div>
          <h2 className="cursos-title">
            <span className="cursos-title-icon"><i className="bi bi-journal-text" /></span>
            <span>Cursos<div className="cursos-subtitle">Gestiona los cursos y materiales por ciclo</div></span>
          </h2>
        </div>
        <div className="cursos-header-actions">
          {/* Reporte dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              ref={reporteRef}
              defaultValue=""
              style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 9, fontSize: 12, fontFamily: 'inherit', background: 'white', cursor: 'pointer', appearance: 'none', paddingRight: 28 }}
              onChange={(e) => {
                const v = e.target.value
                if (v) { descargarReporte(parseInt(v)); e.target.value = '' }
              }}
            >
              <option value="">📥 Reporte alumnos...</option>
              {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
            </select>
          </div>
          <button className="btn-nuevo" onClick={() => { setEditing(null); setForm({ nombre: '', profesor: '', cicloId: ciclos[0]?.id || 0 }); setShowForm(true) }}>
            <i className="bi bi-plus-lg" /> Nuevo curso
          </button>
        </div>
      </div>

      {error   && <div className="cursos-alert"><i className="bi bi-exclamation-circle-fill" />{error}</div>}
      {success && <div className="cursos-alert-success"><i className="bi bi-check-circle-fill" />{success}</div>}

      {/* Form */}
      {showForm && (
        <div className="cursos-form-card">
          <div className="cursos-form-header">
            <div className="cursos-form-dot" />
            <h5 className="cursos-form-title">{editing ? 'Editar curso' : 'Crear nuevo curso'}</h5>
          </div>
          <div className="cursos-form-body">
            <form onSubmit={handleSubmit}>
              <div className="cursos-form-row">
                <div className="cursos-field">
                  <label>Nombre del curso</label>
                  <input type="text" placeholder="Ej: Matemáticas I"
                    value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                </div>
                <div className="cursos-field">
                  <label>Profesor</label>
                  <input type="text" placeholder="Nombre del docente"
                    value={form.profesor} onChange={(e) => setForm({ ...form, profesor: e.target.value })} required />
                </div>
                <div className="cursos-field">
                  <label>Ciclo</label>
                  <div className="select-wrapper">
                    <select value={form.cicloId || ''} onChange={(e) => setForm({ ...form, cicloId: parseInt(e.target.value, 10) })} required>
                      <option value="">-- Seleccionar --</option>
                      {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="cursos-form-actions">
                <button type="submit" className="btn-save"><i className="bi bi-check-lg" />{editing ? 'Actualizar' : 'Guardar'}</button>
                <button type="button" className="btn-cancel" onClick={cancelForm}><i className="bi bi-x-lg" /> Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="cursos-table-card">
        <div className="cursos-table-header">
          <span className="cursos-table-header-left">
            <i className="bi bi-journal-bookmark-fill me-2" style={{ color: 'var(--teal-mid)' }} />
            Lista de cursos
          </span>
          <span className="cursos-count-badge">{filtered.length} / {items.length}</span>
        </div>

        {/* Filtros */}
        <div className="cursos-filter-bar">
          <div className="cursos-search-input-wrap">
            <i className="bi bi-search" />
            <input className="cursos-search-input" placeholder="Buscar nombre o profesor..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="cursos-filter-ciclo">
            <select value={filterCicloId} onChange={(e) => setFilterCicloId(e.target.value ? parseInt(e.target.value) : '')}>
              <option value="">Todos los ciclos</option>
              {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="cursos-empty">
            <i className="bi bi-journal-x" />
            <p>{search || filterCicloId ? 'Sin resultados para los filtros seleccionados.' : 'No hay cursos registrados aún.'}</p>
          </div>
        ) : (
          <table className="cursos-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Profesor</th>
                <th>Ciclo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="curso-nombre">
                      <div className="curso-icon"><i className="bi bi-book-fill" /></div>
                      <span className="curso-nombre-text">{c.nombre}</span>
                    </div>
                  </td>
                  <td><div className="profesor-cell"><i className="bi bi-person-fill" />{c.profesor}</div></td>
                  <td>
                    <span className="ciclo-badge">
                      <i className="bi bi-arrow-repeat" />
                      {getCicloNombre(c.ciclo_id ?? c.cicloId ?? 0, c.Ciclo)}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => openEdit(c)}><i className="bi bi-pencil-fill" /> Editar</button>
                    <button className="btn-materiales" onClick={() => abrirMateriales(c)}><i className="bi bi-folder-fill" /> Materiales</button>
                    <button className="btn-delete" onClick={() => handleDelete(c)}><i className="bi bi-trash3-fill" /> Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal materiales con Drive URLs */}
      {matModal && (
        <div className="mat-overlay" onClick={() => setMatModal(null)}>
          <div className="mat-box" onClick={(e) => e.stopPropagation()}>
            <div className="mat-header">
              <h5><i className="bi bi-folder-fill me-2" />Materiales — {matModal.cursoNombre}</h5>
              <button className="mat-close" onClick={() => setMatModal(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="mat-body">
              {matLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40, color: '#8b5cf6' }}>
                  <div className="cursos-spinner" style={{ borderColor: '#c4b5fd', borderTopColor: '#8b5cf6' }} /> Cargando...
                </div>
              ) : (
                <>
                  {matRows.length === 0 && (
                    <div className="mat-empty">
                      <i className="bi bi-folder-x" />
                      No hay materiales aún. Agrega semanas con el botón de abajo.
                    </div>
                  )}
                  {matRows.map((row, i) => (
                    <div key={i} className="mat-row">
                      <div>
                        <label>Semana</label>
                        <input type="number" min={1} placeholder="1" value={row.semana}
                          onChange={(e) => { const r = [...matRows]; r[i] = { ...r[i], semana: e.target.value }; setMatRows(r) }} />
                      </div>
                      <div>
                        <label>Nombre / Descripción</label>
                        <input type="text" placeholder="Ej: Repaso álgebra" value={row.nombre}
                          onChange={(e) => { const r = [...matRows]; r[i] = { ...r[i], nombre: e.target.value }; setMatRows(r) }} />
                      </div>
                      <div>
                        <label>URL de Drive</label>
                        <input type="url" placeholder="https://drive.google.com/..." value={row.urlDrive}
                          onChange={(e) => { const r = [...matRows]; r[i] = { ...r[i], urlDrive: e.target.value }; setMatRows(r) }} />
                      </div>
                      <button className="mat-row-del" onClick={() => setMatRows(matRows.filter((_, idx) => idx !== i))}>
                        <i className="bi bi-trash3" />
                      </button>
                    </div>
                  ))}
                  <button className="mat-add-btn" onClick={() => setMatRows([...matRows, { semana: '', nombre: '', urlDrive: '' }])}>
                    <i className="bi bi-plus-circle" /> Agregar semana
                  </button>
                </>
              )}
            </div>
            <div className="mat-footer">
              <button className="btn-cancel" onClick={() => setMatModal(null)}><i className="bi bi-x" /> Cancelar</button>
              <button className="mat-save-btn" onClick={guardarMateriales} disabled={matSaving}>
                {matSaving ? <><div className="cursos-spinner-sm" /> Guardando...</> : <><i className="bi bi-check-lg" /> Guardar materiales</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
