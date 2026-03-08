/**
 * Generador de carnets (fotochecks) — Intranet CEC Camargo
 * Tamaño: 85.6 × 54 mm (fotocheck horizontal / tarjeta de crédito)
 */
import { jsPDF } from 'jspdf'
import api from '../config/api'

export interface CarnetAlumno {
  codigo: string
  nombres: string
  apellidos: string
  dni?: string
  cicloNombre: string
  fotoUrl?: string | null
}

async function urlToDataUrl(url: string): Promise<string> {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`fetch ${url} → ${resp.status}`)
  const blob = await resp.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function getQrDataUrl(codigo: string): Promise<string> {
  const resp = await api.get(`/api/admin/alumno/${encodeURIComponent(codigo)}/qr`, {
    responseType: 'blob',
  })
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(resp.data as Blob)
  })
}

let logoCache: string | null = null
async function getLogoDataUrl(): Promise<string> {
  if (logoCache) return logoCache
  logoCache = await urlToDataUrl('/logo-cec.jpg')
  return logoCache
}

// ── Colores ──────────────────────────────────────────────────
const TEAL_DARK  = [13,  79,  92]  as const   // #0d4f5c
const TEAL_MID   = [10, 147, 150]  as const   // #0a9396
const TEAL_LIGHT = [148, 210, 189] as const   // #94d2bd
const WHITE      = [255, 255, 255] as const
const DARK_TEXT  = [25,  40,  45]  as const

export async function generarCarnet(alumno: CarnetAlumno): Promise<Blob> {
  const W = 85.6
  const H = 54

  const [logoDataUrl, qrDataUrl, fotoDataUrl] = await Promise.all([
    getLogoDataUrl(),
    getQrDataUrl(alumno.codigo).catch(() => null),
    alumno.fotoUrl ? urlToDataUrl(alumno.fotoUrl).catch(() => null) : Promise.resolve(null),
  ])

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [H, W] })

  // ── Fondo base blanco ────────────────────────────────────────
  doc.setFillColor(...WHITE)
  doc.rect(0, 0, W, H, 'F')

  // ── Franja izquierda oscura (zona foto) ──────────────────────
  doc.setFillColor(...TEAL_DARK)
  doc.rect(0, 0, 30, H, 'F')

  // ── Header: barra teal en zona derecha ───────────────────────
  doc.setFillColor(...TEAL_MID)
  doc.rect(30, 0, W - 30, 13, 'F')

  // ── Logo sobre fondo blanco (cuadrito blanco dentro del header) ─
  doc.setFillColor(...WHITE)
  doc.rect(31.5, 0.8, 11.5, 11.5, 'F')
  doc.addImage(logoDataUrl, 'JPEG', 31.8, 1, 11, 11)

  // ── Texto header ─────────────────────────────────────────────
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('CÍRCULO DE ESTUDIOS CAMARGO', 44.5, 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.2)
  doc.text('Academia Preuniversitaria', 44.5, 9)

  // "CARNET DE ESTUDIANTE" alineado a la derecha del header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(4.8)
  doc.setTextColor(...TEAL_LIGHT)
  doc.text('CARNET DE ESTUDIANTE', W - 1.5, 11.5, { align: 'right' })

  // Línea divisora bajo header (zona derecha)
  doc.setDrawColor(...TEAL_LIGHT)
  doc.setLineWidth(0.4)
  doc.line(30, 13, W, 13)

  // ── Foto del alumno ──────────────────────────────────────────
  const fX = 1.5, fY = 1, fW = 27, fH = 50
  if (fotoDataUrl) {
    doc.addImage(fotoDataUrl, 'JPEG', fX, fY, fW, fH)
  } else {
    doc.setFillColor(20, 95, 110)
    doc.rect(fX, fY, fW, fH, 'F')
    doc.setTextColor(180, 220, 220)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text('Sin foto', fX + fW / 2, fY + fH / 2 + 1, { align: 'center' })
  }

  // ── Nombre completo (ancho total de la zona de contenido) ────
  const CONTENT_X   = 31.5
  const CONTENT_W   = W - CONTENT_X - 1.5   // ~52.6 mm — ancho completo disponible
  const nombreCompleto = `${alumno.nombres} ${alumno.apellidos}`
  doc.setTextColor(...TEAL_DARK)
  doc.setFont('helvetica', 'bold')

  // Auto-escala: empieza en 9pt, reduce hasta que quepa en ≤3 líneas
  let nombreFontSize = 9
  let nombreLines = doc.setFontSize(nombreFontSize).splitTextToSize(nombreCompleto, CONTENT_W)
  if (nombreLines.length > 3) {
    nombreFontSize = 7.5
    nombreLines = doc.setFontSize(nombreFontSize).splitTextToSize(nombreCompleto, CONTENT_W)
  }
  if (nombreLines.length > 3) {
    nombreFontSize = 6.5
    nombreLines = doc.setFontSize(nombreFontSize).splitTextToSize(nombreCompleto, CONTENT_W)
  }
  doc.setFontSize(nombreFontSize)
  doc.text(nombreLines.slice(0, 3), CONTENT_X, 18)

  // ── Línea separadora bajo nombre ─────────────────────────────
  // sepY fijo para que el resto del layout no salte
  const sepY = 27
  doc.setDrawColor(...TEAL_LIGHT)
  doc.setLineWidth(0.25)
  doc.line(CONTENT_X, sepY, W - 1.5, sepY)

  // ── QR (esquina inferior derecha, bajo la línea) ──────────────
  const qrSize = 19
  const qrX    = W - qrSize - 1.5
  const qrY    = sepY + 2
  if (qrDataUrl) {
    doc.setFillColor(...WHITE)
    doc.rect(qrX - 0.5, qrY - 0.5, qrSize + 1, qrSize + 1, 'F')
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
  }

  // DNI bajo el QR (código legible)
  doc.setFontSize(4.2)
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'normal')
  doc.text(alumno.dni ?? alumno.codigo, qrX + qrSize / 2, qrY + qrSize + 2, { align: 'center' })

  // ── Datos: DNI y CICLO (columna izquierda, bajo separador) ───
  const labelX  = CONTENT_X
  const valueX  = labelX + 10
  const maxValW = qrX - valueX - 1.5   // ancho hasta el QR

  // DNI
  const row1Y = sepY + 8
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEAL_MID)
  doc.text('DNI', labelX, row1Y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK_TEXT)
  doc.setFontSize(6)
  doc.text(alumno.dni ?? alumno.codigo, valueX, row1Y)

  // CICLO
  const row2Y = row1Y + 7
  doc.setFontSize(5.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEAL_MID)
  doc.text('CICLO', labelX, row2Y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK_TEXT)
  doc.setFontSize(5.5)
  const cicloLines = doc.splitTextToSize(alumno.cicloNombre, maxValW)
  doc.text(cicloLines.slice(0, 2), valueX, row2Y)

  // ── Franja inferior de color ──────────────────────────────────
  doc.setFillColor(...TEAL_LIGHT)
  doc.rect(0, H - 2.5, W, 2.5, 'F')

  return doc.output('blob')
}

export async function descargarCarnet(alumno: CarnetAlumno) {
  const blob = await generarCarnet(alumno)
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `carnet_${alumno.dni ?? alumno.codigo}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
