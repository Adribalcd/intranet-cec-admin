import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { AlumnoListItem, Ciclo } from '../../models/types'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .alumnos-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }

  .alumnos-wrap {
    --teal-dark:  #0d4f5c;
    --teal-mid:   #0a9396;
    --teal-light: #94d2bd;
    --teal-pale:  #e8f4f5;
    --accent:     #e9c46a;
    --danger:     #e76f51;
    --text-main:  #212529;
    --text-muted: #6c757d;
    --border:     #dee2e6;
  }

  /* ── Header ── */
  .alumnos-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
  }
  .alumnos-title {
    font-size: 22px; font-weight: 700; color: var(--teal-dark);
    display: flex; align-items: center; gap: 10px; margin: 0;
  }
  .alumnos-title-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 17px; flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(10,147,150,0.3);
  }
  .alumnos-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; font-weight: 400; }

  /* Header actions row */
  .alumnos-header-actions {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .ciclo-select {
    padding: 7px 12px; border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: white; color: var(--text-main);
    outline: none; cursor: pointer; transition: border-color 0.18s;
    min-width: 180px;
  }
  .ciclo-select:focus { border-color: var(--teal-mid); }
  .btn-excel-dl {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px; border: none;
    background: #166534; color: white;
    font-size: 12px; font-weight: 700; font-family: inherit;
    cursor: pointer; transition: background 0.15s; white-space: nowrap;
  }
  .btn-excel-dl:hover { background: #14532d; }
  .btn-excel-dl:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Alert */
  .alumnos-alert {
    display: flex; align-items: center; gap: 10px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 12px 16px; color: #b91c1c; font-size: 13px; margin-bottom: 20px;
  }
  .alumnos-alert-success {
    display: flex; align-items: center; gap: 10px;
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
    padding: 12px 16px; color: #166534; font-size: 13px; margin-bottom: 20px;
  }

  /* Table card */
  .alumnos-table-card {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  }
  .alumnos-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--teal-pale), #fff);
  }
  .alumnos-table-header-left { font-size: 13px; font-weight: 600; color: #374151; }
  .alumnos-count-badge {
    background: var(--teal-mid); color: white;
    font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
  }

  /* Search */
  .alumnos-search-bar {
    padding: 12px 20px; border-bottom: 1px solid var(--border); background: #fafafa;
  }
  .alumnos-search-wrap { position: relative; max-width: 320px; }
  .alumnos-search-wrap i {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); font-size: 14px;
  }
  .alumnos-search-input {
    width: 100%; padding: 7px 12px 7px 32px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: white; outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .alumnos-search-input:focus {
    border-color: var(--teal-mid); box-shadow: 0 0 0 3px rgba(10,147,150,0.12);
  }

  /* Table */
  .alumnos-table { width: 100%; border-collapse: collapse; }
  .alumnos-table thead th {
    padding: 11px 14px; text-align: left;
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: var(--text-muted);
    background: #f8fafc; border-bottom: 1px solid var(--border);
  }
  .alumnos-table thead th:last-child { text-align: right; }
  .alumnos-table tbody tr {
    border-bottom: 1px solid #f1f5f9; transition: background 0.15s;
  }
  .alumnos-table tbody tr:last-child { border-bottom: none; }
  .alumnos-table tbody tr:hover { background: var(--teal-pale); }
  .alumnos-table tbody td {
    padding: 11px 14px; font-size: 13px; color: var(--text-main); vertical-align: middle;
  }
  .alumnos-table tbody td:last-child { text-align: right; }

  /* Avatar cell */
  .alumno-avatar-cell { display: flex; align-items: center; gap: 10px; }
  .alumno-avatar {
    width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--teal-pale), var(--teal-light));
    display: flex; align-items: center; justify-content: center;
    color: var(--teal-dark); font-size: 13px; font-weight: 700;
    border: 2px solid rgba(10,147,150,0.2); overflow: hidden;
  }
  .alumno-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .alumno-nombre-cell .nombre { font-weight: 600; color: var(--teal-dark); font-size: 13px; }
  .alumno-nombre-cell .apellido { font-size: 12px; color: var(--text-muted); }

  /* Code badge */
  .codigo-badge {
    display: inline-block; background: #f1f5f9;
    color: var(--teal-dark); font-size: 11px; font-weight: 700;
    padding: 3px 8px; border-radius: 6px; font-family: monospace;
    border: 1px solid var(--border);
  }

  /* Contact cell */
  .contact-cell { font-size: 12px; color: var(--text-muted); }

  /* Action buttons */
  .btn-qr {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 8px;
    border: 1.5px solid var(--teal-mid); background: transparent;
    color: var(--teal-mid); font-size: 12px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    transition: background 0.15s, color 0.15s; margin-right: 6px;
  }
  .btn-qr:hover { background: var(--teal-mid); color: white; }
  .btn-photo {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 8px;
    border: 1.5px solid var(--accent); background: transparent;
    color: #a07000; font-size: 12px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    transition: background 0.15s, color 0.15s; margin-right: 6px;
  }
  .btn-photo:hover { background: var(--accent); color: #5a3e00; }
  .btn-restore {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 8px;
    border: 1.5px solid var(--danger); background: transparent;
    color: var(--danger); font-size: 12px; font-weight: 600;
    font-family: inherit; cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn-restore:hover { background: var(--danger); color: white; }
  .btn-restore:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Empty / Loading */
  .alumnos-empty { text-align: center; padding: 48px 20px; color: var(--text-muted); }
  .alumnos-empty i { font-size: 40px; color: var(--teal-light); margin-bottom: 12px; display: block; }
  .alumnos-empty p { font-size: 14px; margin: 0; }
  .alumnos-loading {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 60px; color: var(--teal-mid); font-size: 14px; font-weight: 500;
  }
  .alumnos-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2.5px solid var(--teal-light); border-top-color: var(--teal-mid);
    animation: alspin 0.7s linear infinite;
  }
  @keyframes alspin { to { transform: rotate(360deg); } }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 2000; padding: 20px;
  }
  .modal-box {
    background: white; border-radius: 18px; width: 100%; max-width: 420px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25); overflow: hidden;
    animation: modalIn 0.2s ease;
  }
  @keyframes modalIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-header-cec {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--teal-pale), white);
  }
  .modal-header-cec h5 { font-size: 15px; font-weight: 700; color: var(--teal-dark); margin: 0; }
  .modal-close-btn {
    width: 30px; height: 30px; border-radius: 8px; border: none;
    background: #f1f5f9; color: var(--text-muted);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 14px; transition: background 0.15s;
  }
  .modal-close-btn:hover { background: #e2e8f0; color: var(--text-main); }
  .modal-body-cec { padding: 24px 20px; text-align: center; }
  .modal-footer-cec {
    display: flex; gap: 10px; justify-content: flex-end;
    padding: 14px 20px; border-top: 1px solid var(--border); background: #fafafa;
  }
  .btn-modal-primary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 18px; border-radius: 9px; border: none;
    background: var(--teal-mid); color: white;
    font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-modal-primary:hover { background: var(--teal-dark); }
  .btn-modal-secondary {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 9px;
    border: 1.5px solid var(--border); background: white;
    color: var(--text-muted); font-size: 13px; font-weight: 600;
    font-family: inherit; cursor: pointer; transition: border-color 0.15s;
  }
  .btn-modal-secondary:hover { border-color: #adb5bd; }

  /* QR image */
  .qr-img-wrap {
    background: #f8fafc; border-radius: 12px; padding: 20px;
    display: inline-block; border: 1px solid var(--border);
  }
  .qr-img-wrap img { display: block; max-width: 220px; height: auto; }
  .qr-codigo { font-size: 12px; color: var(--text-muted); margin-top: 10px; font-family: monospace; }

  /* Password result box */
  .password-box {
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
    padding: 16px; margin: 12px 0; text-align: center;
  }
  .password-box .pass-label { font-size: 11px; color: #15803d; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
  .password-box .pass-value {
    font-family: monospace; font-size: 20px; font-weight: 700;
    color: #166534; letter-spacing: 1px;
    background: white; border: 1px solid #bbf7d0;
    padding: 8px 16px; border-radius: 8px; display: inline-block;
  }
  .password-box .pass-note { font-size: 11px; color: #15803d; margin-top: 8px; }

  /* Photo upload modal */
  .photo-drop-zone {
    border: 2px dashed var(--teal-light); border-radius: 12px;
    padding: 28px 20px; cursor: pointer; transition: border-color 0.18s, background 0.18s;
    background: #fafafa; text-align: center;
  }
  .photo-drop-zone:hover, .photo-drop-zone.dragover {
    border-color: var(--teal-mid); background: var(--teal-pale);
  }
  .photo-drop-zone i { font-size: 32px; color: var(--teal-light); display: block; margin-bottom: 8px; }
  .photo-drop-zone p { font-size: 13px; color: var(--text-muted); margin: 0; }
  .photo-drop-zone span { font-size: 11px; color: var(--teal-mid); font-weight: 600; display: block; margin-top: 4px; }
  .photo-preview-wrap {
    position: relative; display: inline-block;
    border-radius: 12px; overflow: hidden;
    border: 2px solid var(--teal-light);
  }
  .photo-preview-wrap img { display: block; max-height: 200px; max-width: 100%; }
  .photo-preview-remove {
    position: absolute; top: 6px; right: 6px;
    width: 26px; height: 26px; border-radius: 50%; border: none;
    background: rgba(0,0,0,0.55); color: white; font-size: 12px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }
  .photo-upload-progress {
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; color: var(--teal-mid); font-weight: 500; margin-top: 12px;
  }
  .photo-upload-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid var(--teal-light); border-top-color: var(--teal-mid);
    animation: alspin 0.7s linear infinite; flex-shrink: 0;
  }
  .photo-note { font-size: 11px; color: var(--text-muted); margin-top: 10px; }

  /* Anular / Eliminar */
  .btn-anular {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 8px; border: none; cursor: pointer;
    font-size: 11px; font-weight: 700; font-family: inherit; transition: opacity .15s;
    background: #fff0ed; color: #e76f51; border: 1px solid #fca5a5;
  }
  .btn-anular:hover { background: #ffe0d9; }
  .btn-del-alumno {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 8px; border: none; cursor: pointer;
    font-size: 11px; font-weight: 700; font-family: inherit; transition: opacity .15s;
    background: #fee2e2; color: #c1121f; border: 1px solid #fca5a5;
  }
  .btn-del-alumno:hover { background: #fecaca; }
  .confirm-modal-danger { background: #fff5f5; border: 1px solid #fca5a5; border-radius: 12px; padding: 18px; margin-bottom: 4px; }
  .confirm-modal-danger p { font-size: 13px; color: #7f1d1d; margin: 0; line-height: 1.6; }
`

export function AdminAlumnosView() {
  const [items, setItems] = useState<AlumnoListItem[]>([])
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [selectedCicloId, setSelectedCicloId] = useState<string>('')
  const [cicloNombre, setCicloNombre] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [downloadingExcel, setDownloadingExcel] = useState(false)
  const [restoringCodigo, setRestoringCodigo] = useState<string | null>(null)

  // QR modal
  const [qrModal, setQrModal] = useState<{ url: string; codigo: string } | null>(null)

  // Photo modal
  const [photoModal, setPhotoModal] = useState<{ codigo: string; nombre: string } | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoDragOver, setPhotoDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Restore password result modal
  const [restoreResult, setRestoreResult] = useState<{ alumno: string; password: string } | null>(null)

  // Anular matrícula / Eliminar alumno
  const [confirmAnular, setConfirmAnular] = useState<{ alumno: AlumnoListItem } | null>(null)
  const [confirmEliminar, setConfirmEliminar] = useState<{ alumno: AlumnoListItem } | null>(null)
  const [accionProcesando, setAccionProcesando] = useState(false)

  // Editar alumno
  const [editModal, setEditModal] = useState<AlumnoListItem | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [editGuardando, setEditGuardando] = useState(false)

  // Reenviar credenciales
  const [reenviarCodigo, setReenviarCodigo] = useState<string | null>(null)

  // Load ciclos on mount, then try to load ciclo vigente by default
  useEffect(() => {
    adminApi.getCiclos()
      .then((res) => {
        const list = res.data ?? []
        setCiclos(list)
        // Intentar cargar ciclo vigente como defecto (puede no existir)
        return adminApi.getCicloVigenteAlumnos()
          .then((r) => {
            setItems(r.data?.alumnos ?? [])
            const cv = r.data?.ciclo
            if (cv) {
              setCicloNombre(cv.nombres ?? cv.nombre ?? '')
              const match = list.find((c) =>
                (c.nombres ?? c.nombre) === (cv.nombres ?? cv.nombre)
              )
              if (match) setSelectedCicloId(String(match.id))
            }
          })
          .catch(() => {
            // No hay ciclo vigente activo — es OK, mostrar selector vacío
            setItems([])
          })
      })
      .catch(() => setError('Error al conectar con el servidor.'))
      .finally(() => setLoading(false))
  }, [])

  const cargarAlumnosPorCiclo = (cicloId: string) => {
    if (!cicloId) return
    setLoading(true)
    setError('')
    setSuccess('')
    setSearch('')
    adminApi.getAlumnosPorCiclo(Number(cicloId))
      .then((res) => {
        setItems(res.data?.alumnos ?? [])
        const c = res.data?.ciclo
        setCicloNombre(c ? (c.nombres ?? c.nombre ?? '') : '')
      })
      .catch(() => setError('Error al cargar alumnos del ciclo.'))
      .finally(() => setLoading(false))
  }

  const handleCicloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedCicloId(val)
    cargarAlumnosPorCiclo(val)
  }

  // ── Excel download ──
  const descargarExcel = async () => {
    if (!selectedCicloId) { setError('Seleccione un ciclo primero.'); return }
    setDownloadingExcel(true)
    setError('')
    try {
      const res = await adminApi.reporteAlumnosCiclo(Number(selectedCicloId))
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `alumnos-ciclo-${selectedCicloId}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Error al descargar el Excel.')
    } finally {
      setDownloadingExcel(false)
    }
  }

  // ── Restore password ──
  const restaurarContrasena = async (a: AlumnoListItem) => {
    if (!a.codigo) return
    if (!confirm(`¿Restaurar la contraseña de ${a.nombres} ${a.apellidos} al valor por defecto?`)) return
    setRestoringCodigo(a.codigo)
    setError('')
    setSuccess('')
    try {
      const res = await adminApi.restaurarPassword(a.codigo)
      setRestoreResult({ alumno: `${a.nombres} ${a.apellidos}`, password: res.data.passwordDefault })
    } catch {
      setError('Error al restaurar la contraseña.')
    } finally {
      setRestoringCodigo(null)
    }
  }

  // ── Editar alumno ──
  const abrirEditModal = (a: AlumnoListItem) => {
    setEditModal(a)
    setEditForm({
      nombres:         a.nombres ?? '',
      apellidos:       a.apellidos ?? '',
      email:           (a as any).email_alumno ?? '',
      celular:         a.celular ?? '',
      dni:             (a as any).dni ?? '',
      fechaNacimiento: (a as any).fecha_nacimiento ?? '',
      esEscolar:       !!(a as any).es_escolar,
    })
  }

  const handleGuardarEdicion = async () => {
    if (!editModal?.codigo) return
    setEditGuardando(true)
    setError('')
    try {
      await (adminApi as any).editarDatosAlumno(editModal.codigo, editForm)
      setSuccess(`Datos de ${editForm.nombres} ${editForm.apellidos} actualizados.`)
      setEditModal(null)
      cargarAlumnosPorCiclo(selectedCicloId)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al guardar los cambios.')
    } finally {
      setEditGuardando(false)
    }
  }

  // ── Reenviar credenciales ──
  const handleReenviarCredenciales = async (codigo: string) => {
    setReenviarCodigo(codigo)
    setError('')
    try {
      const res = await (adminApi as any).reenviarCredenciales(codigo)
      setSuccess(res.data.mensaje)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al reenviar credenciales.')
    } finally {
      setReenviarCodigo(null)
    }
  }

  // ── WhatsApp credenciales ──
  const [waCodigo, setWaCodigo] = useState<string | null>(null)

  const handleCredencialesWhatsapp = async (codigo: string) => {
    setWaCodigo(codigo)
    setError('')
    try {
      const res = await (adminApi as any).credencialesWhatsapp(codigo)
      const { mensaje, telefono } = res.data
      const url = telefono
        ? `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
        : `https://wa.me/?text=${encodeURIComponent(mensaje)}`
      window.open(url, '_blank')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al obtener credenciales WhatsApp.')
    } finally {
      setWaCodigo(null)
    }
  }

  // ── QR ──
  const verQr = (codigo: string) => {
    setError('')
    adminApi.getAlumnoQr(codigo)
      .then((res) => {
        const url = URL.createObjectURL(res.data as Blob)
        setQrModal({ url, codigo })
      })
      .catch(() => setError('Error al cargar el QR.'))
  }

  const cerrarQr = () => {
    if (qrModal) URL.revokeObjectURL(qrModal.url)
    setQrModal(null)
  }

  const descargarQr = () => {
    if (!qrModal) return
    const a = document.createElement('a')
    a.href = qrModal.url
    a.download = `qr-${qrModal.codigo}.png`
    a.click()
  }

  // ── Photo upload ──
  const abrirPhotoModal = (a: AlumnoListItem) => {
    setPhotoModal({ codigo: a.codigo!, nombre: `${a.nombres} ${a.apellidos}` })
    setPhotoFile(null)
    setPhotoPreview(null)
    setError('')
    setSuccess('')
  }

  const cerrarPhotoModal = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoModal(null)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const handlePhotoFile = (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) { setError('Solo se permiten imágenes JPG, PNG o WebP.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('La imagen no puede superar 5 MB.'); return }
    setError('')
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault(); setPhotoDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePhotoFile(file)
  }

  const subirFoto = async () => {
    if (!photoFile || !photoModal) return
    setPhotoUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('foto', photoFile)
      await adminApi.subirFotoAlumno(photoModal.codigo, formData)
      setSuccess(`Foto de ${photoModal.nombre} actualizada correctamente.`)
      cerrarPhotoModal()
    } catch {
      setError('Error al subir la foto. Inténtalo de nuevo.')
    } finally {
      setPhotoUploading(false)
    }
  }

  const filtered = items.filter((a) =>
    !search ||
    a.nombres?.toLowerCase().includes(search.toLowerCase()) ||
    a.apellidos?.toLowerCase().includes(search.toLowerCase()) ||
    a.codigo?.toLowerCase().includes(search.toLowerCase()) ||
    a.email_alumno?.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (a: AlumnoListItem) =>
    `${(a.nombres?.[0] ?? '').toUpperCase()}${(a.apellidos?.[0] ?? '').toUpperCase()}`

  // ── Anular matrícula ──
  const handleAnularMatricula = async () => {
    if (!confirmAnular || !selectedCicloId) return
    setAccionProcesando(true)
    setError('')
    try {
      await adminApi.anularMatricula(confirmAnular.alumno.codigo!, selectedCicloId)
      setSuccess(`Matrícula de ${confirmAnular.alumno.nombres} ${confirmAnular.alumno.apellidos} anulada.`)
      setConfirmAnular(null)
      cargarAlumnosPorCiclo(selectedCicloId)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al anular la matrícula.')
    } finally {
      setAccionProcesando(false)
    }
  }

  // ── Eliminar alumno ──
  const handleEliminarAlumno = async () => {
    if (!confirmEliminar) return
    setAccionProcesando(true)
    setError('')
    try {
      await adminApi.eliminarAlumno(confirmEliminar.alumno.codigo!)
      setSuccess(`Alumno ${confirmEliminar.alumno.nombres} ${confirmEliminar.alumno.apellidos} eliminado del sistema.`)
      setConfirmEliminar(null)
      if (selectedCicloId) cargarAlumnosPorCiclo(selectedCicloId)
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al eliminar el alumno.')
    } finally {
      setAccionProcesando(false)
    }
  }

  if (loading && ciclos.length === 0) return (
    <div className="alumnos-wrap">
      <style>{styles}</style>
      <div className="alumnos-loading">
        <div className="alumnos-spinner" /> Cargando alumnos...
      </div>
    </div>
  )

  return (
    <div className="alumnos-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="alumnos-header">
        <div>
          <h2 className="alumnos-title">
            <span className="alumnos-title-icon"><i className="bi bi-people-fill" /></span>
            <span>
              Alumnos
              {cicloNombre && (
                <div className="alumnos-subtitle">{cicloNombre}</div>
              )}
            </span>
          </h2>
        </div>
        <div className="alumnos-header-actions">
          <select className="ciclo-select" value={selectedCicloId} onChange={handleCicloChange}>
            <option value="">Seleccionar ciclo...</option>
            {ciclos.map((c) => (
              <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>
            ))}
          </select>
          <button
            className="btn-excel-dl"
            onClick={descargarExcel}
            disabled={downloadingExcel || !selectedCicloId}
            title="Descargar lista en Excel"
          >
            <i className="bi bi-file-earmark-excel-fill" />
            {downloadingExcel ? 'Descargando...' : 'Excel'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alumnos-alert">
          <i className="bi bi-exclamation-circle-fill" /> {error}
        </div>
      )}
      {success && (
        <div className="alumnos-alert-success">
          <i className="bi bi-check-circle-fill" /> {success}
        </div>
      )}

      {/* Loading overlay while changing ciclo */}
      {loading && ciclos.length > 0 && (
        <div className="alumnos-loading" style={{ padding: '24px' }}>
          <div className="alumnos-spinner" /> Cargando...
        </div>
      )}

      {/* Table card */}
      {!loading && (
        <div className="alumnos-table-card">
          <div className="alumnos-table-header">
            <span className="alumnos-table-header-left">
              <i className="bi bi-person-lines-fill me-2" style={{ color: 'var(--teal-mid)' }} />
              Listado de alumnos
            </span>
            <span className="alumnos-count-badge">{items.length} alumnos</span>
          </div>

          <div className="alumnos-search-bar">
            <div className="alumnos-search-wrap">
              <i className="bi bi-search" />
              <input
                className="alumnos-search-input"
                placeholder="Buscar por nombre, código o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="alumnos-empty">
              <i className="bi bi-person-x" />
              <p>
                {search
                  ? `Sin resultados para "${search}".`
                  : selectedCicloId
                    ? 'No hay alumnos matriculados en este ciclo.'
                    : 'Selecciona un ciclo para ver los alumnos.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="alumnos-table">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Código</th>
                    <th>Email</th>
                    <th>Celular</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div className="alumno-avatar-cell">
                          <div className="alumno-avatar">
                            {a.foto_url
                              ? <img src={a.foto_url} alt={a.nombres} onError={(e) => { e.currentTarget.style.display = 'none' }} />
                              : initials(a)
                            }
                          </div>
                          <div className="alumno-nombre-cell">
                            <div className="nombre">{a.nombres}</div>
                            <div className="apellido">{a.apellidos}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {a.codigo
                          ? <span className="codigo-badge">{a.codigo}</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td className="contact-cell">
                        {a.email_alumno
                          ? <><i className="bi bi-envelope me-1" style={{ color: 'var(--teal-light)' }} />{a.email_alumno}</>
                          : '—'}
                      </td>
                      <td className="contact-cell">
                        {a.celular
                          ? <><i className="bi bi-phone me-1" style={{ color: 'var(--teal-light)' }} />{a.celular}</>
                          : '—'}
                      </td>
                      <td>
                        {a.codigo && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <button className="btn-qr" onClick={() => verQr(a.codigo!)}>
                              <i className="bi bi-qr-code" /> QR
                            </button>
                            <button className="btn-photo" onClick={() => abrirPhotoModal(a)}>
                              <i className="bi bi-camera-fill" /> Foto
                            </button>
                            <button className="btn-restore" onClick={() => abrirEditModal(a)} title="Editar datos del alumno">
                              <i className="bi bi-pencil-fill" /> Editar
                            </button>
                            <button
                              className="btn-restore"
                              onClick={() => restaurarContrasena(a)}
                              disabled={restoringCodigo === a.codigo}
                              title="Restaurar contraseña al valor por defecto"
                            >
                              <i className="bi bi-key-fill" />
                              {restoringCodigo === a.codigo ? '...' : 'Clave'}
                            </button>
                            <button
                              className="btn-restore"
                              onClick={() => handleReenviarCredenciales(a.codigo!)}
                              disabled={reenviarCodigo === a.codigo}
                              title="Reenviar credenciales al correo del alumno"
                            >
                              <i className="bi bi-envelope-fill" />
                              {reenviarCodigo === a.codigo ? '...' : 'Email'}
                            </button>
                            <button
                              className="btn-restore"
                              onClick={() => handleCredencialesWhatsapp(a.codigo!)}
                              disabled={waCodigo === a.codigo}
                              title="Enviar credenciales por WhatsApp"
                              style={{ background: '#25d366', color: 'white', borderColor: '#25d366' }}
                            >
                              <i className="bi bi-whatsapp" />
                              {waCodigo === a.codigo ? '...' : 'WA'}
                            </button>
                            {selectedCicloId && (
                              <button
                                className="btn-anular"
                                onClick={() => setConfirmAnular({ alumno: a })}
                                title="Anular matrícula en este ciclo"
                              >
                                <i className="bi bi-x-circle" /> Anular
                              </button>
                            )}
                            <button
                              className="btn-del-alumno"
                              onClick={() => setConfirmEliminar({ alumno: a })}
                              title="Eliminar alumno del sistema"
                            >
                              <i className="bi bi-trash3" /> Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modal Editar Alumno ── */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-cec">
              <h5><i className="bi bi-pencil-fill me-2" />Editar datos del alumno</h5>
              <button className="modal-close-btn" onClick={() => setEditModal(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body-cec" style={{ textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Nombres', key: 'nombres' },
                  { label: 'Apellidos', key: 'apellidos' },
                  { label: 'Correo electrónico', key: 'email' },
                  { label: 'Celular', key: 'celular' },
                  { label: 'DNI', key: 'dni' },
                  { label: 'Fecha de nacimiento', key: 'fechaNacimiento', type: 'date' },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: f.key === 'email' ? '1 / -1' : undefined }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6c757d', marginBottom: 4 }}>{f.label}</label>
                    <input
                      type={f.type ?? 'text'}
                      value={editForm[f.key] ?? ''}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #dee2e6', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fafafa' }}
                    />
                  </div>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!editForm.esEscolar} onChange={e => setEditForm({ ...editForm, esEscolar: e.target.checked })} />
                Alumno de modalidad Escolar (10 cuotas × S/70)
              </label>
            </div>
            <div className="modal-footer-cec">
              <button className="btn-modal-secondary" onClick={() => setEditModal(null)}>Cancelar</button>
              <button className="btn-modal-primary" onClick={handleGuardarEdicion} disabled={editGuardando}>
                {editGuardando ? 'Guardando...' : <><i className="bi bi-check-lg" /> Guardar cambios</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR Modal ── */}
      {qrModal && (
        <div className="modal-overlay" onClick={cerrarQr}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-cec">
              <h5><i className="bi bi-qr-code me-2" />Código QR</h5>
              <button className="modal-close-btn" onClick={cerrarQr}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body-cec">
              <div className="qr-img-wrap">
                <img src={qrModal.url} alt={`QR ${qrModal.codigo}`} />
              </div>
              <div className="qr-codigo">Código: {qrModal.codigo}</div>
            </div>
            <div className="modal-footer-cec">
              <button className="btn-modal-secondary" onClick={cerrarQr}>
                <i className="bi bi-x" /> Cerrar
              </button>
              <button className="btn-modal-primary" onClick={descargarQr}>
                <i className="bi bi-download" /> Descargar PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Restore Password Result Modal ── */}
      {restoreResult && (
        <div className="modal-overlay" onClick={() => setRestoreResult(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-cec">
              <h5><i className="bi bi-key-fill me-2" />Contraseña Restaurada</h5>
              <button className="modal-close-btn" onClick={() => setRestoreResult(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body-cec">
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                Alumno: <strong style={{ color: 'var(--teal-dark)' }}>{restoreResult.alumno}</strong>
              </p>
              <div className="password-box">
                <div className="pass-label">Nueva contraseña por defecto</div>
                <div className="pass-value">{restoreResult.password}</div>
                <div className="pass-note">Comparte esta clave con el alumno de forma segura.</div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                Formato: <em>año_nacimiento-celular-dni</em> (o código si faltan datos)
              </p>
            </div>
            <div className="modal-footer-cec">
              <button className="btn-modal-primary" onClick={() => setRestoreResult(null)}>
                <i className="bi bi-check" /> Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmar Anular Matrícula ── */}
      {confirmAnular && (
        <div className="modal-overlay" onClick={() => !accionProcesando && setConfirmAnular(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header-cec">
              <h5><i className="bi bi-x-circle-fill me-2" style={{ color: '#e76f51' }} />Anular Matrícula</h5>
              <button className="modal-close-btn" onClick={() => setConfirmAnular(null)} disabled={accionProcesando}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body-cec">
              <div className="confirm-modal-danger">
                <p>
                  ¿Anular la matrícula de <strong>{confirmAnular.alumno.nombres} {confirmAnular.alumno.apellidos}</strong> ({confirmAnular.alumno.codigo}) en el ciclo actual?
                  <br /><br />
                  <span style={{ fontSize: 12 }}>El alumno seguirá en el sistema pero dejará de aparecer en este ciclo. Se eliminarán sus registros de asistencia en este ciclo.</span>
                </p>
              </div>
            </div>
            <div className="modal-footer-cec">
              <button className="btn-modal-secondary" onClick={() => setConfirmAnular(null)} disabled={accionProcesando}>
                <i className="bi bi-x" /> Cancelar
              </button>
              <button
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 9, border: 'none', background: '#e76f51', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: accionProcesando ? .6 : 1 }}
                onClick={handleAnularMatricula}
                disabled={accionProcesando}
              >
                <i className="bi bi-x-circle" /> {accionProcesando ? 'Anulando...' : 'Sí, anular matrícula'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmar Eliminar Alumno ── */}
      {confirmEliminar && (
        <div className="modal-overlay" onClick={() => !accionProcesando && setConfirmEliminar(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header-cec">
              <h5><i className="bi bi-trash3-fill me-2" style={{ color: '#c1121f' }} />Eliminar Alumno</h5>
              <button className="modal-close-btn" onClick={() => setConfirmEliminar(null)} disabled={accionProcesando}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body-cec">
              <div className="confirm-modal-danger">
                <p>
                  ¿Eliminar <strong>permanentemente</strong> a <strong>{confirmEliminar.alumno.nombres} {confirmEliminar.alumno.apellidos}</strong> ({confirmEliminar.alumno.codigo}) del sistema?
                  <br /><br />
                  <strong style={{ color: '#c1121f' }}>Esta acción es irreversible.</strong> Se eliminarán todas sus matrículas, asistencias y calificaciones.
                </p>
              </div>
            </div>
            <div className="modal-footer-cec">
              <button className="btn-modal-secondary" onClick={() => setConfirmEliminar(null)} disabled={accionProcesando}>
                <i className="bi bi-x" /> Cancelar
              </button>
              <button
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 18px', borderRadius: 9, border: 'none', background: '#c1121f', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: accionProcesando ? .6 : 1 }}
                onClick={handleEliminarAlumno}
                disabled={accionProcesando}
              >
                <i className="bi bi-trash3" /> {accionProcesando ? 'Eliminando...' : 'Sí, eliminar alumno'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Upload Modal ── */}
      {photoModal && (
        <div className="modal-overlay" onClick={cerrarPhotoModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-cec">
              <h5><i className="bi bi-camera-fill me-2" />Subir foto</h5>
              <button className="modal-close-btn" onClick={cerrarPhotoModal}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="modal-body-cec" style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                Alumno: <strong style={{ color: 'var(--teal-dark)' }}>{photoModal.nombre}</strong>
                <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 5 }}>
                  {photoModal.codigo}
                </span>
              </p>

              {error && (
                <div className="alumnos-alert" style={{ marginBottom: 14 }}>
                  <i className="bi bi-exclamation-circle-fill" /> {error}
                </div>
              )}

              {/* Drop zone or preview */}
              {!photoPreview ? (
                <div
                  className={`photo-drop-zone${photoDragOver ? ' dragover' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setPhotoDragOver(true) }}
                  onDragLeave={() => setPhotoDragOver(false)}
                  onDrop={handlePhotoDrop}
                >
                  <i className="bi bi-cloud-arrow-up" />
                  <p>Arrastra una imagen aquí</p>
                  <span>o haz clic para seleccionar</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div className="photo-preview-wrap">
                    <img src={photoPreview} alt="preview" />
                    <button
                      className="photo-preview-remove"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}
                    >
                      <i className="bi bi-x" />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef} type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoFile(f) }}
              />

              <p className="photo-note">Formatos: JPG, PNG, WebP · Máximo 5 MB</p>

              {photoUploading && (
                <div className="photo-upload-progress">
                  <div className="photo-upload-spinner" /> Subiendo foto...
                </div>
              )}
            </div>
            <div className="modal-footer-cec">
              <button className="btn-modal-secondary" onClick={cerrarPhotoModal} disabled={photoUploading}>
                <i className="bi bi-x" /> Cancelar
              </button>
              <button
                className="btn-modal-primary"
                onClick={subirFoto}
                disabled={!photoFile || photoUploading}
                style={{ opacity: (!photoFile || photoUploading) ? 0.6 : 1 }}
              >
                <i className="bi bi-upload" /> Subir foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
