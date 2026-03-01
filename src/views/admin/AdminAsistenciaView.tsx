import { useEffect, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { Ciclo, AsistenciaListItem, AlumnoDetail } from '../../models/types'
import * as XLSX from 'xlsx'

// --- Helpers de Fecha ---
const todayISO = () => new Date().toISOString().split('T')[0]

const styles = `
  .asis-wrap { font-family: 'Plus Jakarta Sans', sans-serif; color: #212529; --teal: #0a9396; --dark: #001219; --danger: #ae2012; --warn: #ee9b00; }
  .asis-tab-nav { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #dee2e6; padding-bottom: 10px; }
  .asis-tab-btn { padding: 10px 18px; border-radius: 8px; border: 1px solid #dee2e6; background: #fff; cursor: pointer; font-weight: 600; transition: 0.3s; }
  .asis-tab-btn.active { background: var(--teal); color: #fff; border-color: var(--teal); }
  .asis-card { background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .dni-input { width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 15px; outline: none; transition: 0.3s; }
  .dni-input:focus { border-color: var(--teal); }
  .btn-primary { background: var(--teal); color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; width: 100%; }
  .btn-primary:disabled { opacity: 0.6; }
  .asis-alert-error { background: #fff5f5; color: #c53030; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #c53030; }
  .asis-alert-success { background: #f0fff4; color: #2f855a; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2f855a; }
  .alumno-avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--teal); }
  .asis-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  .asis-table th { text-align: left; padding: 12px; background: #f8f9fa; border-bottom: 2px solid #dee2e6; font-size: 13px; }
  .asis-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
`

export function AdminAsistenciaView() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState<'registro' | 'inhabilitar' | 'listado' | 'cierre'>('registro')

  // --- Estados Independientes ---
  const [dni, setDni] = useState('')
  const [alumnoValidado, setAlumnoValidado] = useState<AlumnoDetail | null>(null)
  
  const [inhForm, setInhForm] = useState({ cicloId: '', fecha: '' })
  const [cierreCicloId, setCierreCicloId] = useState('')
  const [busqueda, setBusqueda] = useState({ cicloId: '', fecha: todayISO() })
  const [listado, setListado] = useState<AsistenciaListItem[]>([])

  const [procesando, setProcesando] = useState(false)

  useEffect(() => {
    adminApi.getCiclos()
      .then(res => setCiclos(res.data))
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false))
  }, [])

  const limpiarAlertas = () => { setError(''); setSuccess(''); }

  // 1. REGISTRO MANUAL
  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault(); limpiarAlertas();
    if (!dni) return;
    setProcesando(true);
    try {
      const res = await adminApi.getAlumno(dni);
      setAlumnoValidado(res.data);
    } catch { setError('Alumno no encontrado o código inválido.'); }
    finally { setProcesando(false); }
  }

  const handleConfirmarAsistencia = async () => {
    setProcesando(true);
    try {
      await adminApi.registrarAsistencia({ dni, fecha: todayISO() });
      setSuccess(`¡Asistencia registrada para ${alumnoValidado?.nombres}!`);
      setAlumnoValidado(null); setDni('');
    } catch { setError('Error al registrar. ¿Ya marcó hoy?'); }
    finally { setProcesando(false); }
  }

  // 2. INHABILITAR DÍA (Feriados)
  const handleInhabilitar = async (e: React.FormEvent) => {
    e.preventDefault(); limpiarAlertas();
    if (!inhForm.cicloId || !inhForm.fecha) return setError('Llene todos los campos.');
    setProcesando(true);
    try {
      await adminApi.inhabilitarAsistencia({ cicloId: Number(inhForm.cicloId), fecha: inhForm.fecha });
      setSuccess('Día inhabilitado correctamente.');
      setInhForm({ ...inhForm, fecha: '' });
    } catch { setError('Error al inhabilitar el día.'); }
    finally { setProcesando(false); }
  }

  // 3. CIERRE DE DÍA (Faltas masivas)
  const handleCierreDia = async () => {
    limpiarAlertas();
    if (!cierreCicloId) return setError('Seleccione un ciclo.');
    if (!confirm("¿Cerrar día? Esto marcará FALTÓ a todos los que no vinieron hoy.")) return;
    setProcesando(true);
    try {
      const res = await adminApi.cierreDia({ cicloId: Number(cierreCicloId), fecha: todayISO() });
      setSuccess(`Cierre completado.`);
    } catch { setError('Error al ejecutar cierre.'); }
    finally { setProcesando(false); }
  }

  // 4. REPORTES Y EXCEL
  const buscarListado = async () => {
    if (!busqueda.cicloId) return;
    setProcesando(true);
    try {
      const res = await adminApi.getAsistenciaListado(Number(busqueda.cicloId), busqueda.fecha);
      setListado(res.data.listado);
    } catch { setError('Error al obtener el reporte.'); }
    finally { setProcesando(false); }
  }

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(listado);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");
    XLSX.writeFile(wb, `Reporte_${busqueda.fecha}.xlsx`);
  }

  const formatHora = (hora: string | null | undefined) => {
    if (!hora) return '—'
    try {
      const d = new Date(hora)
      return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch { return '—' }
  }

  if (loading) return <p>Cargando módulo de asistencia...</p>

  return (
    <div className="asis-wrap">
      <style>{styles}</style>
      <h2>Control de Asistencia Administrativo</h2>

      <div className="asis-tab-nav">
        <button className={`asis-tab-btn ${tab === 'registro' ? 'active' : ''}`} onClick={() => setTab('registro')}>Registro</button>
        <button className={`asis-tab-btn ${tab === 'inhabilitar' ? 'active' : ''}`} onClick={() => setTab('inhabilitar')}>Inhabilitar</button>
        <button className={`asis-tab-btn ${tab === 'cierre' ? 'active' : ''}`} onClick={() => setTab('cierre')}>Cierre</button>
        <button className={`asis-tab-btn ${tab === 'listado' ? 'active' : ''}`} onClick={() => setTab('listado')}>Reportes</button>
      </div>

      {error && <div className="asis-alert-error">{error}</div>}
      {success && <div className="asis-alert-success">{success}</div>}

      <div className="asis-card">
        {tab === 'registro' && (
          <div>
            {!alumnoValidado ? (
              <form onSubmit={handleValidar}>
                <label>DNI o Código del Alumno</label>
                <input className="dni-input" value={dni} onChange={e => setDni(e.target.value)} placeholder="Ej: 74859612" />
                <button className="btn-primary" disabled={procesando}>Validar Alumno</button>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={alumnoValidado.foto_url || `https://ui-avatars.com/api/?name=${alumnoValidado.nombres}&background=random`} 
                  className="alumno-avatar" 
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/80'}
                />
                <h3>{alumnoValidado.nombres} {alumnoValidado.apellidos}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={handleConfirmarAsistencia} disabled={procesando}>Confirmar Ingreso</button>
                  <button className="btn-primary" style={{ background: '#6c757d' }} onClick={() => setAlumnoValidado(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'inhabilitar' && (
          <form onSubmit={handleInhabilitar}>
            <label>Ciclo</label>
            <select className="dni-input" value={inhForm.cicloId} onChange={e => setInhForm({ ...inhForm, cicloId: e.target.value })}>
              <option value="">Seleccione Ciclo...</option>
              {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
            </select>
            <label>Fecha a Inhabilitar</label>
            <input type="date" className="dni-input" value={inhForm.fecha} onChange={e => setInhForm({ ...inhForm, fecha: e.target.value })} />
            <button className="btn-primary" style={{ background: 'var(--warn)' }} disabled={procesando}>Inhabilitar Fecha</button>
          </form>
        )}

        {tab === 'cierre' && (
          <div>
            <label>Ciclo para Cierre Masivo</label>
            <select className="dni-input" value={cierreCicloId} onChange={e => setCierreCicloId(e.target.value)}>
              <option value="">Seleccione Ciclo...</option>
              {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
            </select>
            <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={handleCierreDia} disabled={procesando}>
              Ejecutar Cierre Automático Hoy
            </button>
          </div>
        )}

        {tab === 'listado' && (
          <div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select className="dni-input" value={busqueda.cicloId} onChange={e => setBusqueda({ ...busqueda, cicloId: e.target.value })}>
                <option value="">Ciclo...</option>
                {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
              </select>
              <input type="date" className="dni-input" value={busqueda.fecha} onChange={e => setBusqueda({ ...busqueda, fecha: e.target.value })} />
              <button className="btn-primary" style={{ width: 'auto' }} onClick={buscarListado}>Buscar</button>
            </div>
            {listado.length > 0 && (
              <>
                <button onClick={exportarExcel} style={{ marginBottom: '10px', cursor: 'pointer' }}>💾 Exportar Excel</button>
                <table className="asis-table">
                  <thead>
                    <tr><th>Alumno</th><th>Estado</th><th>Hora</th><th>Observación</th></tr>
                  </thead>
                  <tbody>
                    {listado.map((item, i) => (
                      <tr key={i}>
                        <td>{item.nombres} {item.apellidos}</td>
                        <td style={{ color: item.estado === 'Presente' ? 'green' : item.estado === 'Tardanza' ? '#b45309' : 'red', fontWeight: 'bold' }}>{item.estado}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{formatHora(item.hora)}</td>
                        <td>{item.observaciones || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}