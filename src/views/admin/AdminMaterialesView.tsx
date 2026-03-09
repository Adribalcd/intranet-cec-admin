import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { Ciclo, Curso } from '../../models/types'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .mats-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
  .mats-wrap {
    --teal-dark: #0d4f5c; --teal-mid: #0a9396; --teal-light: #94d2bd;
    --teal-pale: #e8f4f5; --purple: #7c3aed; --purple-pale: #f5f0fe;
    --danger: #e76f51; --text-main: #212529; --text-muted: #6c757d; --border: #dee2e6;
  }

  .mats-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
  }
  .mats-title {
    font-size: 22px; font-weight: 700; color: var(--teal-dark);
    display: flex; align-items: center; gap: 10px; margin: 0;
  }
  .mats-title-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--purple), #4c1d95);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 17px; flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(124,58,237,0.3);
  }
  .mats-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; font-weight: 400; }

  /* Filtros top */
  .mats-filters {
    display: grid; grid-template-columns: 200px 1fr 200px; gap: 12px;
    background: white; border: 1px solid var(--border); border-radius: 14px;
    padding: 14px 18px; margin-bottom: 22px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .mats-filter-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 5px; display: block;
  }
  .mats-select, .mats-search {
    width: 100%; padding: 8px 12px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; outline: none; background: #fafafa;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none; -webkit-appearance: none;
  }
  .mats-select:focus, .mats-search:focus {
    border-color: var(--purple); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); background: white;
  }
  .mats-search { background-image: none; }

  /* Selector de curso */
  .mats-curso-selector {
    background: white; border: 1px solid var(--border); border-radius: 14px;
    margin-bottom: 22px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .mats-curso-selector-header {
    padding: 12px 18px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--purple-pale), white);
    font-size: 12px; font-weight: 700; color: #4c1d95;
    display: flex; align-items: center; gap: 8px;
  }
  .mats-curso-list {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 10px; padding: 14px;
  }
  .mats-curso-card {
    border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 14px;
    cursor: pointer; transition: all 0.15s; background: #fafafa;
  }
  .mats-curso-card:hover { border-color: var(--purple); background: var(--purple-pale); }
  .mats-curso-card.active {
    border-color: var(--purple); background: var(--purple-pale);
    box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
  }
  .mats-curso-card-name { font-size: 13px; font-weight: 600; color: var(--teal-dark); margin-bottom: 4px; }
  .mats-curso-card-sub { font-size: 11px; color: var(--text-muted); }
  .mats-curso-card-badge {
    display: inline-block; font-size: 10px; font-weight: 600;
    background: var(--teal-pale); color: var(--teal-dark);
    padding: 2px 8px; border-radius: 20px; margin-top: 6px;
    border: 1px solid rgba(10,147,150,0.2);
  }
  .mats-curso-empty { padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; }

  /* Panel materiales del curso seleccionado */
  .mats-panel {
    background: white; border: 1px solid var(--border); border-radius: 16px;
    overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  }
  .mats-panel-header {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--purple-pale), white);
  }
  .mats-panel-title {
    font-size: 15px; font-weight: 700; color: #4c1d95;
    display: flex; align-items: center; gap: 8px;
  }
  .mats-panel-subtitle { font-size: 12px; color: var(--text-muted); font-weight: 400; }
  .mats-panel-actions { display: flex; gap: 8px; }

  .btn-add-semana {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px;
    border: 1.5px dashed #c4b5fd; background: var(--purple-pale);
    color: var(--purple); font-size: 12px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-add-semana:hover { border-color: var(--purple); background: #ede9fe; }
  .btn-guardar-mats {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 18px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, var(--purple), #4c1d95);
    color: white; font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(124,58,237,0.3); transition: opacity 0.18s;
  }
  .btn-guardar-mats:hover:not(:disabled) { opacity: 0.88; }
  .btn-guardar-mats:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Tabla */
  .mats-table-wrap { overflow-x: auto; }
  .mats-table { width: 100%; border-collapse: collapse; }
  .mats-table thead th {
    padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-muted);
    background: #f8fafc; border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }
  .mats-table thead th:last-child { text-align: center; width: 60px; }
  .mats-table tbody tr { border-bottom: 1px solid #f1f5f9; transition: background 0.12s; }
  .mats-table tbody tr:last-child { border-bottom: none; }
  .mats-table tbody tr:hover { background: #fafafa; }
  .mats-table tbody td { padding: 8px 14px; vertical-align: middle; }
  .mats-table tbody td:last-child { text-align: center; }

  .mats-input {
    width: 100%; padding: 7px 10px;
    border: 1.5px solid var(--border); border-radius: 8px;
    font-size: 13px; font-family: inherit; background: white; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .mats-input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
  .mats-input.semana-input { width: 70px; text-align: center; }

  .mats-drive-link {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; color: var(--purple); font-weight: 600;
    text-decoration: none; padding: 4px 8px; border-radius: 6px;
    background: var(--purple-pale); transition: background 0.12s;
  }
  .mats-drive-link:hover { background: #ede9fe; }

  .btn-del-row {
    width: 28px; height: 28px; border-radius: 7px; border: none;
    background: #fff0ed; color: var(--danger); font-size: 12px;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.12s;
  }
  .btn-del-row:hover { background: #ffe0d9; }

  .mats-empty-panel {
    padding: 60px 20px; text-align: center; color: var(--text-muted);
  }
  .mats-empty-panel i { font-size: 44px; color: #c4b5fd; display: block; margin-bottom: 12px; }
  .mats-empty-panel p { font-size: 14px; margin: 0; }

  .mats-placeholder {
    padding: 60px 20px; text-align: center; color: var(--text-muted);
    border: 2px dashed var(--border); border-radius: 16px; margin-top: 0;
  }
  .mats-placeholder i { font-size: 44px; color: var(--teal-light); display: block; margin-bottom: 12px; }
  .mats-placeholder p { font-size: 14px; margin: 0; }

  .mats-alert {
    display: flex; align-items: center; gap: 10px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 12px 16px; color: #b91c1c; font-size: 13px; margin-bottom: 16px;
  }
  .mats-alert-success {
    display: flex; align-items: center; gap: 10px;
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
    padding: 12px 16px; color: #166534; font-size: 13px; margin-bottom: 16px;
  }

  .mats-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2.5px solid #c4b5fd; border-top-color: var(--purple);
    animation: msspin 0.7s linear infinite; display: inline-block;
  }
  .mats-spinner-sm {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: msspin 0.7s linear infinite; display: inline-block;
  }
  @keyframes msspin { to { transform: rotate(360deg); } }

  .mats-loading {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 50px; color: var(--purple); font-size: 14px; font-weight: 500;
  }

  .semana-chip {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    background: linear-gradient(135deg, var(--purple-pale), #ede9fe);
    color: var(--purple); font-size: 12px; font-weight: 700;
    border: 1.5px solid #c4b5fd;
  }

  .mats-file-btn {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 5px 10px; border-radius: 7px;
    border: 1.5px dashed var(--border); background: #fafafa;
    color: var(--text-muted); font-size: 11px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .mats-file-btn:hover { border-color: var(--purple); color: var(--purple); background: var(--purple-pale); }
  .mats-file-attached { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--teal-dark); font-weight: 600; }
  .mats-file-clear { background: none; border: none; cursor: pointer; color: var(--danger); font-size: 14px; padding: 0 2px; }

  /* Fuente del material — alternativas claras */
  .mats-fuente-cell { display: flex; flex-direction: column; gap: 0; min-width: 280px; }
  .mats-fuente-section {
    padding: 8px 10px; border-radius: 8px; border: 1.5px solid var(--border);
    background: #fafafa; transition: border-color 0.15s;
  }
  .mats-fuente-section:focus-within { border-color: var(--purple); background: white; }
  .mats-fuente-section-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--text-muted); margin-bottom: 5px; display: flex; align-items: center; gap: 5px;
  }
  .mats-fuente-section-label i { font-size: 12px; }
  .mats-or-divider {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 2px; font-size: 10px; font-weight: 700;
    color: #adb5bd; text-transform: uppercase; letter-spacing: 0.1em;
    user-select: none;
  }
  .mats-or-divider::before, .mats-or-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  @media (max-width: 768px) {
    .mats-filters { grid-template-columns: 1fr; }
    .mats-curso-list { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 500px) { .mats-curso-list { grid-template-columns: 1fr; } }
`

interface MatRow {
  id?: number
  semana: string
  nombre: string
  urlDrive: string
  urlArchivo: string
  tipoArchivo?: string
  dirty?: boolean
  uploading?: boolean
  fileToUpload?: File | null
}

function getBasename(url: string): string {
  try {
    const parts = url.split('/')
    return decodeURIComponent(parts[parts.length - 1].split('?')[0]) || url
  } catch {
    return url
  }
}

export function AdminMaterialesView() {
  const [ciclos, setCiclos]             = useState<Ciclo[]>([])
  const [cursos, setCursos]             = useState<Curso[]>([])
  const [filterCicloId, setFilterCicloId] = useState<number | ''>('')
  const [search, setSearch]             = useState('')

  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [rows, setRows]                 = useState<MatRow[]>([])
  const [loadingMats, setLoadingMats]   = useState(false)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [loadingInit, setLoadingInit]   = useState(true)

  // One ref per row for the hidden file inputs
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    Promise.all([adminApi.getCiclos(), adminApi.getCursos()])
      .then(([cRes, cuRes]) => {
        setCiclos(Array.isArray(cRes.data) ? cRes.data : [])
        setCursos(Array.isArray(cuRes.data) ? cuRes.data : [])
      })
      .finally(() => setLoadingInit(false))
  }, [])

  const filteredCursos = cursos.filter((c) => {
    const matchCiclo = !filterCicloId || (c.ciclo_id ?? c.cicloId) === filterCicloId
    const matchSearch = !search ||
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.profesor.toLowerCase().includes(search.toLowerCase())
    return matchCiclo && matchSearch
  })

  const getCicloNombre = (c: Curso) => {
    const id = c.ciclo_id ?? c.cicloId ?? 0
    return c.Ciclo?.nombres ?? c.Ciclo?.nombre ??
      ciclos.find((x) => x.id === id)?.nombres ??
      ciclos.find((x) => x.id === id)?.nombre ?? `Ciclo ${id}`
  }

  const selectCurso = async (c: Curso) => {
    setSelectedCurso(c)
    setRows([])
    setError('')
    setSuccess('')
    setLoadingMats(true)
    try {
      const res = await adminApi.getMaterialesPorCurso(c.id)
      const mats = Array.isArray(res.data) ? res.data : []
      setRows(mats.map((m: any) => ({
        id: m.id,
        semana: String(m.semana),
        nombre: m.nombre || '',
        urlDrive: m.url_drive ?? m.urlDrive ?? '',
        urlArchivo: m.url_archivo ?? m.urlArchivo ?? '',
        tipoArchivo: m.tipo_archivo ?? m.tipoArchivo ?? '',
        fileToUpload: null,
      })))
    } catch {
      setRows([])
    } finally {
      setLoadingMats(false)
    }
  }

  // Agregar material — multiple materials per semana are now supported
  const addRow = () => {
    const maxSemana = rows.reduce((m, r) => Math.max(m, parseInt(r.semana) || 0), 0)
    setRows([...rows, {
      semana: String(maxSemana + 1),
      nombre: '',
      urlDrive: '',
      urlArchivo: '',
      dirty: true,
      fileToUpload: null,
    }])
  }

  const updateRow = (i: number, field: keyof MatRow, value: string) => {
    setRows((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value, dirty: true }
      return next
    })
  }

  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i))

  const handleFileChange = (i: number, file: File | null) => {
    setRows((prev) => {
      const next = [...prev]
      const current = { ...next[i] }
      current.fileToUpload = file
      current.dirty = true
      if (file && !current.nombre) {
        current.nombre = file.name
      }
      next[i] = current
      return next
    })
  }

  const clearFile = (i: number) => {
    setRows((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], fileToUpload: null, dirty: true }
      return next
    })
    if (fileInputRefs.current[i]) {
      fileInputRefs.current[i]!.value = ''
    }
  }

  const handleDelete = async (row: MatRow) => {
    if (!selectedCurso) return
    if (row.id) {
      try {
        await adminApi.deleteMaterial(selectedCurso.id, row.id)
      } catch {
        setError('No se pudo eliminar el material.')
        return
      }
    }
    setRows((prev) => prev.filter((r) => r !== row))
    // Reload from server to keep state in sync
    await selectCurso(selectedCurso)
  }

  const handleSave = async () => {
    if (!selectedCurso) return
    const toSave = rows.filter((r) => r.semana && r.nombre && (r.dirty || !r.id))
    if (toSave.length === 0) { setError('No hay materiales nuevos o modificados para guardar.'); return }

    setSaving(true)
    setError('')
    setSuccess('')
    let errores = 0
    let lastErrorMsg = ''

    for (const row of toSave) {
      try {
        if (row.fileToUpload) {
          // Si el material ya existe (row.id), el backend actualiza en vez de crear duplicado
          await adminApi.uploadMaterial(
            selectedCurso.id,
            parseInt(row.semana),
            row.nombre,
            row.fileToUpload,
            row.id,
          )
        } else if (row.id) {
          await adminApi.updateMaterial(selectedCurso.id, row.id, {
            semana:     parseInt(row.semana),
            nombre:     row.nombre,
            urlDrive:   row.urlDrive   || undefined,
            urlArchivo: row.urlArchivo || undefined,
          })
        } else {
          await adminApi.createMaterial(selectedCurso.id, {
            semana:     parseInt(row.semana),
            nombre:     row.nombre,
            urlDrive:   row.urlDrive   || undefined,
            urlArchivo: row.urlArchivo || undefined,
          })
        }
      } catch (e: any) {
        errores++
        lastErrorMsg = e?.response?.data?.error || e?.message || 'Error desconocido'
      }
    }

    setSaving(false)
    if (errores === 0) {
      setSuccess(`${toSave.length} material(es) guardados en "${selectedCurso.nombre}".`)
      selectCurso(selectedCurso)
    } else {
      setError(`${errores} material(es) no se pudieron guardar. Detalle: ${lastErrorMsg}`)
    }
  }

  if (loadingInit) return (
    <div className="mats-wrap">
      <style>{styles}</style>
      <div className="mats-loading"><div className="mats-spinner" /> Cargando módulo...</div>
    </div>
  )

  return (
    <div className="mats-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="mats-header">
        <h2 className="mats-title">
          <span className="mats-title-icon"><i className="bi bi-folder-fill" /></span>
          <span>
            Materiales
            <div className="mats-subtitle">Ver y editar materiales por curso — enlace Drive y archivo</div>
          </span>
        </h2>
      </div>

      {error   && <div className="mats-alert"><i className="bi bi-exclamation-circle-fill" />{error}</div>}
      {success && <div className="mats-alert-success"><i className="bi bi-check-circle-fill" />{success}</div>}

      {/* Filtros */}
      <div className="mats-filters">
        <div>
          <span className="mats-filter-label">Ciclo</span>
          <select className="mats-select" value={filterCicloId}
            onChange={(e) => setFilterCicloId(e.target.value ? parseInt(e.target.value) : '')}>
            <option value="">Todos los ciclos</option>
            {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
          </select>
        </div>
        <div>
          <span className="mats-filter-label">Buscar curso</span>
          <input className="mats-search" placeholder="Nombre o profesor..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>
            <strong style={{ color: 'var(--teal-dark)' }}>{filteredCursos.length}</strong> curso(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="mats-curso-selector">
        <div className="mats-curso-selector-header">
          <i className="bi bi-journals" />
          Selecciona un curso para ver o editar sus materiales
        </div>
        {filteredCursos.length === 0 ? (
          <div className="mats-curso-empty">No hay cursos con esos filtros.</div>
        ) : (
          <div className="mats-curso-list">
            {filteredCursos.map((c) => (
              <div
                key={c.id}
                className={`mats-curso-card${selectedCurso?.id === c.id ? ' active' : ''}`}
                onClick={() => selectCurso(c)}
              >
                <div className="mats-curso-card-name">
                  <i className="bi bi-book-fill" style={{ color: 'var(--teal-mid)', marginRight: 6 }} />
                  {c.nombre}
                </div>
                <div className="mats-curso-card-sub">
                  <i className="bi bi-person-fill" style={{ marginRight: 4 }} />{c.profesor}
                </div>
                <div className="mats-curso-card-badge">{getCicloNombre(c)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel de materiales */}
      {!selectedCurso ? (
        <div className="mats-placeholder">
          <i className="bi bi-hand-index-thumb" />
          <p>Haz clic en un curso para ver y editar sus materiales</p>
        </div>
      ) : (
        <div className="mats-panel">
          <div className="mats-panel-header">
            <div>
              <div className="mats-panel-title">
                <i className="bi bi-folder-fill" />
                {selectedCurso.nombre}
              </div>
              <div className="mats-panel-subtitle">
                {getCicloNombre(selectedCurso)} &bull; {selectedCurso.profesor}
              </div>
            </div>
            <div className="mats-panel-actions">
              {/* Agregar material — multiple materials per semana are now supported */}
              <button className="btn-add-semana" onClick={addRow}>
                <i className="bi bi-plus-circle" /> Agregar material
              </button>
              <button className="btn-guardar-mats" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><div className="mats-spinner-sm" /> Guardando...</>
                  : <><i className="bi bi-check-lg" /> Guardar cambios</>}
              </button>
            </div>
          </div>

          {loadingMats ? (
            <div className="mats-loading">
              <div className="mats-spinner" /> Cargando materiales...
            </div>
          ) : rows.length === 0 ? (
            <div className="mats-empty-panel">
              <i className="bi bi-folder-x" />
              <p>Este curso no tiene materiales aún.<br />Usa el botón "Agregar material" para comenzar.</p>
            </div>
          ) : (
            <div className="mats-table-wrap">
              <table className="mats-table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Semana</th>
                    <th>Nombre / Descripción</th>
                    <th>
                      Fuente del material
                      <div style={{ fontSize: 9, fontWeight: 500, color: '#adb5bd', textTransform: 'none', letterSpacing: 0, marginTop: 2 }}>
                        enlace externo <em>o</em> archivo adjunto — elige uno
                      </div>
                    </th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          className="mats-input semana-input"
                          type="number" min={1} placeholder="1"
                          value={row.semana}
                          onChange={(e) => updateRow(i, 'semana', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="mats-input"
                          type="text" placeholder="Ej: Repaso álgebra básica"
                          value={row.nombre}
                          onChange={(e) => updateRow(i, 'nombre', e.target.value)}
                        />
                      </td>
                      {/* Fuente: enlace externo O archivo — elige uno */}
                      <td>
                        <div className="mats-fuente-cell">

                          {/* OPCIÓN A — Enlace externo */}
                          <div className="mats-fuente-section">
                            <div className="mats-fuente-section-label">
                              <i className="bi bi-link-45deg" />
                              Enlace externo
                              <span style={{ fontWeight: 500, color: '#adb5bd', textTransform: 'none', letterSpacing: 0 }}>
                                Drive, YouTube, web…
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                className="mats-input"
                                type="url"
                                placeholder="https://drive.google.com/…  o  https://youtu.be/…"
                                value={row.urlDrive}
                                onChange={(e) => updateRow(i, 'urlDrive', e.target.value)}
                                style={{ fontSize: 12 }}
                              />
                              {row.urlDrive && (
                                <a href={row.urlDrive} target="_blank" rel="noopener noreferrer"
                                  className="mats-drive-link" title="Abrir enlace">
                                  <i className="bi bi-box-arrow-up-right" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Divisor */}
                          <div className="mats-or-divider">o bien</div>

                          {/* OPCIÓN B — Subir archivo */}
                          <div className="mats-fuente-section">
                            <div className="mats-fuente-section-label">
                              <i className="bi bi-paperclip" />
                              Subir archivo
                              <span style={{ fontWeight: 500, color: '#adb5bd', textTransform: 'none', letterSpacing: 0 }}>
                                PDF, PPT, imagen
                              </span>
                            </div>

                            {/* Hidden file input */}
                            <input
                              type="file"
                              accept=".pdf,.ppt,.pptx,image/*"
                              style={{ display: 'none' }}
                              ref={(el) => { fileInputRefs.current[i] = el }}
                              onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                            />

                            {/* Archivo ya guardado */}
                            {row.urlArchivo && !row.fileToUpload && (
                              <div className="mats-file-attached" style={{ marginBottom: 4 }}>
                                <span>📎</span>
                                <a href={row.urlArchivo} target="_blank" rel="noopener noreferrer"
                                  style={{ color: 'var(--teal-dark)', textDecoration: 'none', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}
                                  title={row.urlArchivo}>
                                  {getBasename(row.urlArchivo)}
                                </a>
                                <button className="mats-file-clear" title="Quitar archivo"
                                  onClick={() => updateRow(i, 'urlArchivo', '')}>×</button>
                              </div>
                            )}

                            {/* Archivo pendiente de subir */}
                            {row.fileToUpload && (
                              <div className="mats-file-attached" style={{ marginBottom: 4 }}>
                                <span>📎</span>
                                <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}
                                  title={row.fileToUpload.name}>
                                  {row.fileToUpload.name}
                                </span>
                                <button className="mats-file-clear" title="Quitar" onClick={() => clearFile(i)}>×</button>
                              </div>
                            )}

                            <button className="mats-file-btn" type="button"
                              onClick={() => fileInputRefs.current[i]?.click()}>
                              <i className="bi bi-upload" />
                              {row.fileToUpload ? 'Cambiar archivo' : (row.urlArchivo ? 'Reemplazar' : 'Seleccionar archivo')}
                            </button>
                          </div>

                        </div>
                      </td>
                      <td>
                        <button
                          className="btn-del-row"
                          onClick={() => handleDelete(row)}
                          title="Eliminar material"
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer con totales */}
              <div style={{
                padding: '10px 18px', borderTop: '1px solid var(--border)',
                background: '#fafafa', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)'
              }}>
                <span>{rows.length} material(es) en este curso</span>
                <span>
                  {rows.filter((r) => r.urlDrive).length} con enlace &bull;{' '}
                  {rows.filter((r) => r.urlArchivo || r.fileToUpload).length} con archivo
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
