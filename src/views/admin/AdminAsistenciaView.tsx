import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { adminApi } from '../../models/adminApi'
import type { Ciclo, AsistenciaListItem } from '../../models/types'
import * as XLSX from 'xlsx'

const todayISO = () => new Date().toISOString().split('T')[0]

const HORA_INICIO = '07:00'
const HORA_FIN_PUNTUAL = '08:15'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  .asis-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
  .asis-wrap {
    --teal: #0a9396; --teal-dark: #0d4f5c; --teal-pale: #e8f4f5;
    --danger: #e63946; --warn: #f4a261; --success: #2a9d8f;
    --text: #212529; --muted: #6c757d; --border: #dee2e6;
  }
  .asis-header { display:flex; align-items:flex-start; gap:12px; margin-bottom:24px; flex-wrap:wrap; }
  .asis-title { font-size:22px; font-weight:700; color:var(--teal-dark); display:flex; align-items:center; gap:10px; margin:0; }
  .asis-title-icon { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,var(--teal),var(--teal-dark)); display:flex; align-items:center; justify-content:center; color:white; font-size:17px; flex-shrink:0; box-shadow:0 4px 10px rgba(10,147,150,.3); }
  .asis-subtitle { font-size:13px; color:var(--muted); margin-top:2px; }
  .asis-schedule-banner { display:flex; align-items:center; gap:14px; flex-wrap:wrap; background:linear-gradient(135deg,#e0f5f5,#d4eeee); border:1px solid rgba(10,147,150,.25); border-radius:14px; padding:14px 20px; margin-bottom:20px; }
  .asis-schedule-item { display:flex; align-items:center; gap:7px; font-size:13px; color:var(--teal-dark); font-weight:600; }
  .asis-schedule-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .asis-badge-puntual { background:#d1fae5; color:#065f46; border:1px solid #6ee7b7; }
  .asis-badge-tardanza { background:#fef3c7; color:#92400e; border:1px solid #fcd34d; }
  .asis-tabs { display:flex; gap:6px; margin-bottom:20px; flex-wrap:wrap; }
  .asis-tab { padding:9px 18px; border-radius:10px; border:1.5px solid var(--border); background:white; cursor:pointer; font-size:13px; font-weight:600; color:var(--muted); transition:.2s; display:flex; align-items:center; gap:7px; }
  .asis-tab:hover { border-color:var(--teal); color:var(--teal); }
  .asis-tab.active { background:var(--teal); color:white; border-color:var(--teal); box-shadow:0 4px 10px rgba(10,147,150,.3); }
  .asis-card { background:white; border:1px solid var(--border); border-radius:16px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,.06); }
  .asis-alert { display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:10px; font-size:13px; margin-bottom:16px; }
  .asis-alert-error { background:#fff5f5; border:1px solid #fca5a5; color:#b91c1c; }
  .asis-alert-success { background:#f0fdf4; border:1px solid #86efac; color:#166534; }
  .asis-input { width:100%; padding:10px 14px; border:1.5px solid var(--border); border-radius:9px; font-size:13px; font-family:inherit; outline:none; background:#fafafa; transition:border-color .15s,box-shadow .15s; }
  .asis-input:focus { border-color:var(--teal); background:white; box-shadow:0 0 0 3px rgba(10,147,150,.12); }
  .asis-label { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); margin-bottom:6px; }
  .btn-teal { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:9px; border:none; background:linear-gradient(135deg,var(--teal),var(--teal-dark)); color:white; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; transition:opacity .18s; }
  .btn-teal:hover:not(:disabled) { opacity:.88; }
  .btn-teal:disabled { opacity:.5; cursor:not-allowed; }
  .btn-warn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:9px; border:none; background:linear-gradient(135deg,#f4a261,#e76f51); color:white; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; }
  .btn-danger { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:9px; border:none; background:linear-gradient(135deg,#e63946,#c1121f); color:white; font-size:13px; font-weight:700; font-family:inherit; cursor:pointer; }
  .btn-outline { display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:9px; border:1.5px solid var(--border); background:white; color:var(--muted); font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; }
  .asis-spinner { width:18px; height:18px; border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:white; animation:asispin .7s linear infinite; display:inline-block; }
  @keyframes asispin { to { transform:rotate(360deg); } }
  .alumno-card { display:flex; align-items:center; gap:20px; background:linear-gradient(135deg,#f0fdf4,#e8f4f5); border:1px solid rgba(10,147,150,.2); border-radius:14px; padding:20px 24px; margin-bottom:20px; flex-wrap:wrap; }
  .alumno-photo { width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid var(--teal); flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,.15); }
  .alumno-photo-placeholder { width:90px; height:90px; border-radius:50%; border:3px solid var(--teal); background:var(--teal-pale); display:flex; align-items:center; justify-content:center; font-size:32px; color:var(--teal); flex-shrink:0; }
  .alumno-info { flex:1; min-width:180px; }
  .alumno-name { font-size:18px; font-weight:700; color:var(--teal-dark); margin-bottom:4px; }
  .alumno-meta { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; }
  .alumno-chip { display:inline-flex; align-items:center; gap:5px; font-size:12px; background:white; border:1px solid var(--border); border-radius:20px; padding:3px 10px; color:var(--text); }
  .alumno-estado-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:13px; font-weight:700; }
  .alumno-estado-puntual { background:#d1fae5; color:#065f46; border:1.5px solid #6ee7b7; }
  .alumno-estado-tardanza { background:#fef3c7; color:#92400e; border:1.5px solid #fcd34d; }
  .asis-clock { font-size:28px; font-weight:700; color:var(--teal-dark); font-family:monospace; letter-spacing:.03em; }
  .asis-clock-label { font-size:11px; color:var(--muted); font-weight:600; text-transform:uppercase; margin-top:2px; }
  .asis-table { width:100%; border-collapse:collapse; font-size:13px; }
  .asis-table th { text-align:left; padding:10px 14px; background:#f8fafc; border-bottom:1px solid var(--border); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }
  .asis-table td { padding:10px 14px; border-bottom:1px solid #f1f5f9; color:var(--text); }
  .asis-table tr:last-child td { border-bottom:none; }
  .asis-table tr:hover td { background:#fafafa; }
  .estado-presente { color:#065f46; font-weight:700; }
  .estado-tardanza { color:#92400e; font-weight:700; }
  .estado-falto { color:#991b1b; font-weight:700; }
  .estado-inhabilitado { color:var(--muted); font-style:italic; }
  .asis-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px; }
  @media (max-width:640px) { .asis-grid2 { grid-template-columns:1fr; } }
  .asis-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:4px; }
  .asis-mode-toggle { display:flex; gap:0; background:#f1f5f9; border-radius:10px; padding:4px; margin-bottom:18px; }
  .asis-mode-btn { flex:1; padding:9px 0; border:none; background:transparent; border-radius:8px; font-size:13px; font-weight:600; color:#64748b; cursor:pointer; transition:.18s; display:flex; align-items:center; justify-content:center; gap:7px; }
  .asis-mode-btn.active { background:white; color:var(--teal-dark); box-shadow:0 2px 8px rgba(0,0,0,.1); }
  .qr-viewport { position:relative; width:100%; max-width:340px; margin:0 auto 16px; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,.18); }
  .qr-viewport #qr-reader { border-radius:16px; overflow:hidden; }
  .qr-viewport #qr-reader video { border-radius:16px; }
  .qr-corner { position:absolute; width:36px; height:36px; border-color:var(--teal); border-style:solid; border-width:0; z-index:10; }
  .qr-corner-tl { top:12px; left:12px; border-top-width:4px; border-left-width:4px; border-radius:4px 0 0 0; }
  .qr-corner-tr { top:12px; right:12px; border-top-width:4px; border-right-width:4px; border-radius:0 4px 0 0; }
  .qr-corner-bl { bottom:12px; left:12px; border-bottom-width:4px; border-left-width:4px; border-radius:0 0 0 4px; }
  .qr-corner-br { bottom:12px; right:12px; border-bottom-width:4px; border-right-width:4px; border-radius:0 0 4px 0; }
  .qr-scan-line { position:absolute; left:16px; right:16px; height:2px; background:linear-gradient(90deg,transparent,var(--teal),transparent); animation:qrscan 2s ease-in-out infinite; z-index:10; }
  @keyframes qrscan { 0%,100%{top:15%} 50%{top:82%} }
  .qr-hint { text-align:center; font-size:12px; color:var(--muted); margin-bottom:0; display:flex; align-items:center; justify-content:center; gap:6px; }
  .countdown-ring { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:50%; background:var(--teal); color:white; font-size:15px; font-weight:700; flex-shrink:0; }
`

// ── Componente escáner QR ──────────────────────────────────────────────────
interface QrScannerProps {
  onScan: (codigo: string) => void
  active: boolean
}
function QrScanner({ onScan, active }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!active) return

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner
    mountedRef.current = true

    scanner.start(
      { facingMode: 'environment' },
      { fps: 12, qrbox: { width: 220, height: 220 } },
      (decodedText) => {
        if (!mountedRef.current) return
        const codigo = decodedText.trim()
        onScan(codigo)
      },
      () => { /* ignore scan errors */ }
    ).catch(() => {
      // Cámara trasera no disponible, intentar cualquier cámara
      scanner.start(
        { facingMode: 'user' },
        { fps: 12, qrbox: { width: 220, height: 220 } },
        (decodedText) => { if (mountedRef.current) onScan(decodedText.trim()) },
        () => {}
      ).catch(() => {})
    })

    return () => {
      mountedRef.current = false
      scanner.isScanning && scanner.stop().catch(() => {})
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null

  return (
    <div className="qr-viewport">
      <div id="qr-reader" style={{ width: '100%' }} />
      <div className="qr-corner qr-corner-tl" />
      <div className="qr-corner qr-corner-tr" />
      <div className="qr-corner qr-corner-bl" />
      <div className="qr-corner qr-corner-br" />
      <div className="qr-scan-line" />
    </div>
  )
}

// ── Contador regresivo para auto-confirmar ────────────────────────────────
function Countdown({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) { onDone(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [left]) // eslint-disable-line react-hooks/exhaustive-deps
  return <span className="countdown-ring">{left}</span>
}

interface AlumnoValidado {
  nombres: string
  apellidos: string
  codigo: string
  foto_url?: string
  ciclo?: { id: number; nombres: string } | null
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{ textAlign: 'right' }}>
      <div className="asis-clock">
        {time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>
      <div className="asis-clock-label">
        {time.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  )
}

export function AdminAsistenciaView() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tab, setTab] = useState<'registro' | 'inhabilitar' | 'listado' | 'cierre'>('registro')

  const [dni, setDni] = useState('')
  const [alumnoValidado, setAlumnoValidado] = useState<AlumnoValidado | null>(null)
  const [inhForm, setInhForm] = useState({ cicloId: '', fecha: '' })
  const [cierreCicloId, setCierreCicloId] = useState('')
  const [busqueda, setBusqueda] = useState({ cicloId: '', fecha: todayISO() })
  const [listado, setListado] = useState<AsistenciaListItem[]>([])
  const [procesando, setProcesando] = useState(false)
  const [modoQr, setModoQr] = useState(false)
  const [qrActivo, setQrActivo] = useState(false)

  const dniInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    adminApi.getCiclos()
      .then(res => setCiclos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (tab === 'registro') {
      setTimeout(() => dniInputRef.current?.focus(), 100)
    }
  }, [tab])

  const limpiarAlertas = () => { setError(''); setSuccess('') }

  const activarModoQr = (activo: boolean) => {
    setModoQr(activo)
    setQrActivo(activo)
    setAlumnoValidado(null)
    setDni('')
    limpiarAlertas()
    if (!activo) setTimeout(() => dniInputRef.current?.focus(), 100)
  }

  const validarCodigo = useCallback(async (codigo: string) => {
    if (!codigo.trim()) return
    setQrActivo(false) // detener escáner mientras procesa
    setProcesando(true)
    limpiarAlertas()
    try {
      const res = await adminApi.getAlumno(codigo.trim())
      const data = res.data as any
      setAlumnoValidado({
        nombres:   data.nombres,
        apellidos: data.apellidos,
        codigo:    data.codigo,
        foto_url:  data.foto_url,
        ciclo:     data.Matriculas?.[0]?.Ciclo ?? null,
      })
    } catch {
      setError('Alumno no encontrado: ' + codigo)
      // Reactivar escáner para seguir escaneando
      setTimeout(() => setQrActivo(true), 1500)
    } finally {
      setProcesando(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault()
    await validarCodigo(dni)
  }

  const handleConfirmarAsistencia = async () => {
    if (!alumnoValidado) return
    setProcesando(true)
    limpiarAlertas()
    try {
      const res = await adminApi.registrarAsistencia({ dni: alumnoValidado.codigo, fecha: todayISO() })
      const data = res.data as any
      const estadoFinal = data.estado as string
      setSuccess(
        estadoFinal === 'Tardanza'
          ? `Tardanza registrada para ${alumnoValidado.nombres} — llegó fuera del horario puntual (07:00–08:15).`
          : `Asistencia registrada: ${alumnoValidado.nombres} llegó a tiempo.`
      )
      setAlumnoValidado(null)
      setDni('')
      if (modoQr) {
        // Reactivar escáner para el siguiente alumno
        setTimeout(() => setQrActivo(true), 600)
      } else {
        setTimeout(() => dniInputRef.current?.focus(), 200)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al registrar asistencia.'
      setError(msg)
    } finally {
      setProcesando(false)
    }
  }

  const handleInhabilitar = async (e: React.FormEvent) => {
    e.preventDefault()
    limpiarAlertas()
    if (!inhForm.cicloId || !inhForm.fecha) return setError('Llene todos los campos.')
    setProcesando(true)
    try {
      await adminApi.inhabilitarAsistencia({ cicloId: Number(inhForm.cicloId), fecha: inhForm.fecha })
      setSuccess('Día inhabilitado correctamente para todos los alumnos del ciclo.')
      setInhForm({ ...inhForm, fecha: '' })
    } catch {
      setError('Error al inhabilitar el día.')
    } finally {
      setProcesando(false)
    }
  }

  const handleCierreDia = async () => {
    limpiarAlertas()
    if (!cierreCicloId) return setError('Seleccione un ciclo.')
    if (!confirm('¿Ejecutar cierre? Se registrará Faltó a todos los que no han marcado asistencia hoy.')) return
    setProcesando(true)
    try {
      await adminApi.cierreDia({ cicloId: Number(cierreCicloId), fecha: todayISO() })
      setSuccess('Cierre ejecutado. Las ausencias del día han sido registradas.')
    } catch {
      setError('Error al ejecutar el cierre del día.')
    } finally {
      setProcesando(false)
    }
  }

  const buscarListado = async () => {
    if (!busqueda.cicloId) return setError('Seleccione un ciclo.')
    setProcesando(true)
    limpiarAlertas()
    try {
      const res = await adminApi.getAsistenciaListado(Number(busqueda.cicloId), busqueda.fecha)
      setListado((res.data as any).listado ?? [])
    } catch {
      setError('Error al obtener el reporte.')
    } finally {
      setProcesando(false)
    }
  }

  const exportarExcel = () => {
    const data = listado.map(item => ({
      Alumno: `${item.nombres} ${item.apellidos}`,
      Estado: item.estado,
      Hora: item.hora ? formatHora(item.hora) : '—',
      Observación: item.observaciones || '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia')
    XLSX.writeFile(wb, `Asistencia_${busqueda.fecha}.xlsx`)
  }

  const formatHora = (hora: string | null | undefined) => {
    if (!hora) return '—'
    try {
      return new Date(hora).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch { return '—' }
  }

  const getEstadoClass = (estado: string) => {
    if (estado === 'Presente') return 'estado-presente'
    if (estado === 'Tardanza') return 'estado-tardanza'
    if (estado === 'Falta' || estado === 'FALTO' || estado === 'Faltó') return 'estado-falto'
    return 'estado-inhabilitado'
  }

  const esTardanzaAhora = () => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes() > 8 * 60 + 15
  }

  // Lunes(1)–Sábado(6), 07:00–11:00 | 20:00–24:00 (horario nocturno para pruebas)
  const esDentroHorarioRegistro = () => {
    const now = new Date()
    const dia = now.getDay()          // 0=Dom, 1=Lun, ..., 6=Sáb
    const min = now.getHours() * 60 + now.getMinutes()
    const horarioManana  = min >= 7 * 60 && min < 11 * 60
    const horarioNocturno = min >= 20 * 60 && min < 24 * 60
    return dia >= 1 && dia <= 6 && (horarioManana || horarioNocturno)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#0a9396' }}>Cargando módulo de asistencia...</div>

  return (
    <div className="asis-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="asis-header">
        <div style={{ flex: 1 }}>
          <h2 className="asis-title">
            <span className="asis-title-icon"><i className="bi bi-person-check-fill" /></span>
            <span>
              Control de Asistencia
              <div className="asis-subtitle">Registro y reportes de asistencia diaria</div>
            </span>
          </h2>
        </div>
        <LiveClock />
      </div>

      {/* Banner horario */}
      <div className="asis-schedule-banner">
        <div className="asis-schedule-item">
          <i className="bi bi-calendar3" style={{ fontSize: 18 }} />
          <span>Lunes a Sábado</span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(10,147,150,.3)' }} />
        <div className="asis-schedule-item">
          <i className="bi bi-clock-fill" />
          <span>{HORA_INICIO} – {HORA_FIN_PUNTUAL}:</span>
          <span className="asis-schedule-badge asis-badge-puntual">Puntual</span>
        </div>
        <div className="asis-schedule-item">
          <span>Después de {HORA_FIN_PUNTUAL}:</span>
          <span className="asis-schedule-badge asis-badge-tardanza">Tardanza automática</span>
        </div>
        <div className="asis-schedule-item" style={{ opacity: 0.7 }}>
          <i className="bi bi-moon-fill" style={{ fontSize: 13 }} />
          <span>20:00 – 24:00 (pruebas)</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="asis-tabs">
        <button className={`asis-tab${tab === 'registro' ? ' active' : ''}`} onClick={() => { setTab('registro'); limpiarAlertas() }}>
          <i className="bi bi-person-check" /> Registro
        </button>
        <button className={`asis-tab${tab === 'inhabilitar' ? ' active' : ''}`} onClick={() => { setTab('inhabilitar'); limpiarAlertas() }}>
          <i className="bi bi-calendar-x" /> Inhabilitar
        </button>
        <button className={`asis-tab${tab === 'cierre' ? ' active' : ''}`} onClick={() => { setTab('cierre'); limpiarAlertas() }}>
          <i className="bi bi-door-closed-fill" /> Cierre
        </button>
        <button className={`asis-tab${tab === 'listado' ? ' active' : ''}`} onClick={() => { setTab('listado'); limpiarAlertas() }}>
          <i className="bi bi-table" /> Reportes
        </button>
      </div>

      {error   && <div className="asis-alert asis-alert-error"><i className="bi bi-exclamation-circle-fill" />{error}</div>}
      {success && <div className="asis-alert asis-alert-success"><i className="bi bi-check-circle-fill" />{success}</div>}

      {/* TAB: REGISTRO */}
      {tab === 'registro' && (
        <div className="asis-card">
          {!esDentroHorarioRegistro() ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
                border: '2px solid #fcd34d',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, marginBottom: 16,
              }}>
                <i className="bi bi-clock-history" style={{ color: '#92400e' }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
                Registro de asistencia no disponible
              </p>
              <p style={{ fontSize: 13, color: '#6c757d', maxWidth: 380, margin: '0 auto' }}>
                No es posible registrar asistencia para el día de hoy.<br />
                Si desea registrar asistencia contactar con soporte.
              </p>
              <p style={{ fontSize: 12, color: '#adb5bd', marginTop: 14 }}>
                <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
                Horario disponible: <strong>Lunes a Sábado, 07:00–11:00</strong> y <strong>20:00–24:00</strong>
              </p>
            </div>
          ) : (
            <>
              {/* Toggle modo */}
              {!alumnoValidado && (
                <div className="asis-mode-toggle">
                  <button
                    className={`asis-mode-btn${!modoQr ? ' active' : ''}`}
                    onClick={() => activarModoQr(false)}
                    type="button"
                  >
                    <i className="bi bi-keyboard" /> Código manual
                  </button>
                  <button
                    className={`asis-mode-btn${modoQr ? ' active' : ''}`}
                    onClick={() => activarModoQr(true)}
                    type="button"
                  >
                    <i className="bi bi-qr-code-scan" /> Escanear QR
                  </button>
                </div>
              )}

              {/* Modo QR: escáner activo */}
              {modoQr && !alumnoValidado && (
                <>
                  <QrScanner active={qrActivo} onScan={validarCodigo} />
                  {procesando ? (
                    <p className="qr-hint"><div className="asis-spinner" style={{ borderTopColor: 'var(--teal)', borderColor: 'rgba(10,147,150,.25)' }} /> Buscando alumno...</p>
                  ) : (
                    <p className="qr-hint">
                      <i className="bi bi-camera-fill" style={{ color: 'var(--teal)' }} />
                      Apunta la cámara al QR del carnet del alumno
                    </p>
                  )}
                </>
              )}

              {/* Modo manual: input */}
              {!modoQr && !alumnoValidado && (
                <form onSubmit={handleValidar}>
                  <label className="asis-label">Código o DNI del Alumno</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      ref={dniInputRef}
                      className="asis-input"
                      value={dni}
                      onChange={e => setDni(e.target.value)}
                      placeholder="Ej: CEC-001 o 74859612"
                      style={{ flex: 1 }}
                    />
                    <button className="btn-teal" type="submit" disabled={procesando || !dni.trim()}>
                      {procesando
                        ? <><div className="asis-spinner" /> Buscando...</>
                        : <><i className="bi bi-search" /> Validar</>}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: '#6c757d', marginTop: 10, marginBottom: 0 }}>
                    <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
                    Ingresa el código y presiona <strong>Enter</strong> o Validar.
                  </p>
                </form>
              )}

              {/* Tarjeta alumno encontrado */}
              {alumnoValidado && (
                <>
                  <div className="alumno-card">
                    {alumnoValidado.foto_url ? (
                      <img
                        src={alumnoValidado.foto_url}
                        className="alumno-photo"
                        alt={alumnoValidado.nombres}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alumnoValidado.nombres)}&background=0a9396&color=fff&size=90` }}
                      />
                    ) : (
                      <div className="alumno-photo-placeholder">
                        <i className="bi bi-person-fill" />
                      </div>
                    )}
                    <div className="alumno-info">
                      <div className="alumno-name">{alumnoValidado.nombres} {alumnoValidado.apellidos}</div>
                      <div className="alumno-meta">
                        <span className="alumno-chip"><i className="bi bi-qr-code" />{alumnoValidado.codigo}</span>
                        {alumnoValidado.ciclo && (
                          <span className="alumno-chip"><i className="bi bi-arrow-repeat" />{alumnoValidado.ciclo.nombres}</span>
                        )}
                      </div>
                      <span className={`alumno-estado-badge ${esTardanzaAhora() ? 'alumno-estado-tardanza' : 'alumno-estado-puntual'}`}>
                        <i className={`bi bi-${esTardanzaAhora() ? 'clock-history' : 'check-circle-fill'}`} />
                        {esTardanzaAhora() ? 'Tardanza' : 'Puntual'}
                      </span>
                    </div>
                  </div>
                  <div className="asis-actions">
                    <button className="btn-teal" onClick={handleConfirmarAsistencia} disabled={procesando}>
                      {procesando
                        ? <><div className="asis-spinner" /> Registrando...</>
                        : <><i className="bi bi-check-lg" /> Confirmar ingreso</>}
                    </button>
                    {modoQr && !procesando && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#64748b' }}>
                        <Countdown seconds={4} onDone={handleConfirmarAsistencia} />
                        Auto-confirma en...
                      </div>
                    )}
                    <button className="btn-outline" onClick={() => {
                      setAlumnoValidado(null)
                      setDni('')
                      if (modoQr) setTimeout(() => setQrActivo(true), 100)
                      else setTimeout(() => dniInputRef.current?.focus(), 100)
                    }}>
                      <i className="bi bi-x" /> Cancelar
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: INHABILITAR */}
      {tab === 'inhabilitar' && (
        <div className="asis-card">
          <h6 style={{ color: '#e76f51', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-calendar-x-fill" /> Inhabilitar día (feriados, días libres)
          </h6>
          <form onSubmit={handleInhabilitar}>
            <div className="asis-grid2">
              <div>
                <label className="asis-label">Ciclo</label>
                <select className="asis-input" value={inhForm.cicloId} onChange={e => setInhForm({ ...inhForm, cicloId: e.target.value })}>
                  <option value="">Seleccione ciclo...</option>
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
                </select>
              </div>
              <div>
                <label className="asis-label">Fecha a inhabilitar</label>
                <input type="date" className="asis-input" value={inhForm.fecha} onChange={e => setInhForm({ ...inhForm, fecha: e.target.value })} />
              </div>
            </div>
            <button className="btn-warn" type="submit" disabled={procesando}>
              {procesando ? <><div className="asis-spinner" /> Procesando...</> : <><i className="bi bi-calendar-x" /> Inhabilitar fecha</>}
            </button>
          </form>
        </div>
      )}

      {/* TAB: CIERRE */}
      {tab === 'cierre' && (
        <div className="asis-card">
          <h6 style={{ color: '#e63946', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-door-closed-fill" /> Cierre de día
          </h6>
          <p style={{ fontSize: 13, color: '#6c757d', marginBottom: 16 }}>
            Registra automáticamente <strong>Faltó</strong> a todos los alumnos del ciclo que no marcaron asistencia hoy.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label className="asis-label">Ciclo</label>
            <select className="asis-input" value={cierreCicloId} onChange={e => setCierreCicloId(e.target.value)} style={{ maxWidth: 320 }}>
              <option value="">Seleccione ciclo...</option>
              {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
            </select>
          </div>
          <button className="btn-danger" onClick={handleCierreDia} disabled={procesando}>
            {procesando ? <><div className="asis-spinner" /> Ejecutando...</> : <><i className="bi bi-door-closed-fill" /> Ejecutar cierre de hoy</>}
          </button>
        </div>
      )}

      {/* TAB: REPORTES */}
      {tab === 'listado' && (
        <div className="asis-card">
          <div className="asis-grid2">
            <div>
              <label className="asis-label">Ciclo</label>
              <select className="asis-input" value={busqueda.cicloId} onChange={e => setBusqueda({ ...busqueda, cicloId: e.target.value })}>
                <option value="">Seleccione ciclo...</option>
                {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
              </select>
            </div>
            <div>
              <label className="asis-label">Fecha</label>
              <input type="date" className="asis-input" value={busqueda.fecha} onChange={e => setBusqueda({ ...busqueda, fecha: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button className="btn-teal" onClick={buscarListado} disabled={procesando}>
              {procesando ? <><div className="asis-spinner" /> Buscando...</> : <><i className="bi bi-search" /> Buscar</>}
            </button>
            {listado.length > 0 && (
              <button className="btn-outline" onClick={exportarExcel}>
                <i className="bi bi-file-earmark-excel" /> Exportar Excel
              </button>
            )}
          </div>
          {listado.length > 0 ? (
            <>
              <div style={{ fontSize: 12, color: '#6c757d', marginBottom: 10 }}>
                {listado.length} registros —{' '}
                <span style={{ color: '#065f46', fontWeight: 600 }}>{listado.filter(x => x.estado === 'Presente').length} presentes</span>,{' '}
                <span style={{ color: '#92400e', fontWeight: 600 }}>{listado.filter(x => x.estado === 'Tardanza').length} tardanzas</span>,{' '}
                <span style={{ color: '#991b1b', fontWeight: 600 }}>{listado.filter(x => x.estado === 'Falta' || x.estado === 'FALTO' || x.estado === 'Faltó').length} faltas</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="asis-table">
                  <thead>
                    <tr>
                      <th>Alumno</th><th>Estado</th><th>Hora</th><th>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listado.map((item, i) => (
                      <tr key={i}>
                        <td>{item.nombres} {item.apellidos}</td>
                        <td className={getEstadoClass(item.estado)}>{item.estado}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{formatHora(item.hora)}</td>
                        <td style={{ color: '#6c757d', fontSize: 12 }}>{item.observaciones || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d', fontSize: 14 }}>
              <i className="bi bi-table" style={{ fontSize: 36, display: 'block', marginBottom: 10, opacity: .4 }} />
              Selecciona un ciclo y fecha para ver el reporte.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
