/**
 * Generador de carnets (fotochecks) de alumnos — Intranet CEC
 * Tamaño: 85.6 × 54 mm (tarjeta de crédito / fotocheck horizontal)
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

/** Convierte una URL (externa o relativa) a data-URL base64 */
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

/** Obtiene el QR del alumno (PNG) como data-URL, usando el token de sesión */
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

/** Carga el logo CEC desde /public */
let logoCache: string | null = null
async function getLogoDataUrl(): Promise<string> {
  if (logoCache) return logoCache
  logoCache = await urlToDataUrl('/logo-cec.jpg')
  return logoCache
}

/**
 * Genera el PDF de un carnet individual.
 * @returns Blob PDF listo para descargar
 */
export async function generarCarnet(alumno: CarnetAlumno): Promise<Blob> {
  // ── Cargar imágenes en paralelo ──────────────────────────────
  const [logoDataUrl, qrDataUrl, fotoDataUrl] = await Promise.all([
    getLogoDataUrl(),
    getQrDataUrl(alumno.codigo).catch(() => null),
    alumno.fotoUrl ? urlToDataUrl(alumno.fotoUrl).catch(() => null) : Promise.resolve(null),
  ])

  // ── Crear documento ─────────────────────────────────────────
  // Orientación landscape, unidad mm, tamaño fotocheck/tarjeta
  const W = 85.6
  const H = 54
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [H, W] })

  // ── Fondo ───────────────────────────────────────────────────
  // Panel izquierdo oscuro (foto)
  doc.setFillColor(13, 79, 92)       // #0d4f5c
  doc.rect(0, 0, 30, H, 'F')

  // Panel derecho blanco
  doc.setFillColor(255, 255, 255)
  doc.rect(30, 0, W - 30, H, 'F')

  // Barra superior (teal)
  doc.setFillColor(10, 147, 150)     // #0a9396
  doc.rect(30, 0, W - 30, 12, 'F')

  // Línea decorativa inferior
  doc.setFillColor(148, 210, 189)    // #94d2bd (teal-light)
  doc.rect(0, H - 3, W, 3, 'F')

  // ── Logo CEC (barra superior izquierda del panel derecho) ──
  doc.addImage(logoDataUrl, 'JPEG', 31.5, 1.5, 9, 9)

  // ── Texto barra superior ────────────────────────────────────
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('CEC CAMARGO', 42, 5.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.text('Academia Preuniversitaria', 42, 9)

  // Etiqueta "CARNET DE ESTUDIANTE" (esquina superior derecha)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5)
  doc.setTextColor(255, 255, 255)
  const label = 'CARNET DE ESTUDIANTE'
  doc.text(label, W - 2, 9, { align: 'right' })

  // ── Foto del alumno ─────────────────────────────────────────
  const fotoX = 1, fotoY = 8, fotoW = 28, fotoH = 36
  if (fotoDataUrl) {
    doc.addImage(fotoDataUrl, 'JPEG', fotoX, fotoY, fotoW, fotoH)
  } else {
    // Placeholder
    doc.setFillColor(20, 100, 115)
    doc.rect(fotoX, fotoY, fotoW, fotoH, 'F')
    doc.setTextColor(180, 220, 220)
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.text('Sin foto', fotoX + fotoW / 2, fotoY + fotoH / 2, { align: 'center' })
  }

  // ── Datos del alumno ────────────────────────────────────────
  const tx = 32   // x base para texto
  const ty = 16   // y base
  const lineH = 5.2

  doc.setTextColor(13, 79, 92)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const nombreCompleto = `${alumno.nombres} ${alumno.apellidos}`
  // Nombre largo: partir si > 26 chars
  const maxW = W - tx - 24 - 2  // reservar espacio para QR (22mm) + margen
  const nombreLines = doc.splitTextToSize(nombreCompleto, maxW)
  doc.text(nombreLines, tx, ty)

  const afterNombre = ty + nombreLines.length * 4.5

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 147, 150)
  doc.text('CÓDIGO', tx, afterNombre + lineH * 0.6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.text(alumno.codigo, tx + 14, afterNombre + lineH * 0.6)

  if (alumno.dni) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(10, 147, 150)
    doc.text('DNI', tx, afterNombre + lineH * 1.6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    doc.text(alumno.dni, tx + 14, afterNombre + lineH * 1.6)
  }

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(10, 147, 150)
  doc.text('CICLO', tx, afterNombre + lineH * 2.6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  const cicloText = doc.splitTextToSize(alumno.cicloNombre, maxW)
  doc.text(cicloText, tx + 14, afterNombre + lineH * 2.6)

  // ── QR code ─────────────────────────────────────────────────
  const qrSize = 22
  const qrX = W - qrSize - 1.5
  const qrY = H - qrSize - 4
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
  }

  // ── Código bajo el QR ───────────────────────────────────────
  doc.setFontSize(4.5)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(alumno.codigo, qrX + qrSize / 2, H - 3.5, { align: 'center' })

  return doc.output('blob')
}

/** Descarga un carnet individual */
export async function descargarCarnet(alumno: CarnetAlumno) {
  const blob = await generarCarnet(alumno)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `carnet_${alumno.codigo}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
