/** Tipos usados por la API Intranet CEC */

// --- Alumno
export interface LoginBody {
  usuario: string
  contrasena: string
}

export interface PerfilAlumno {
  nombres: string
  apellidos: string
  ciclo?: string
  fotoUrl?: string
}

export interface HorarioItem {
  curso: string
  profesor?: string
  dia: string
  hora: string
  horaInicio?: string
  horaFin?: string
}

export interface AsistenciaItem {
  fecha: string
  estado: string
  hora?: string
  observaciones?: string
}

export interface CalificacionItem {
  examenId?: number
  fecha: string
  nota: number
  puesto?: number
  tipo?: string
  semana?: number
  cantidadPreguntas?: number
}

export interface RankingDistribucionItem {
  rango: string
  cantidad: number
  incluye: boolean
}

export interface RankingSalonResponse {
  examenId: number
  totalAlumnos: number
  miPuesto: number
  miNota: number
  percentil: number
  distribucion: RankingDistribucionItem[]
}

export interface CursoMatriculado {
  idCurso: number
  nombreCurso: string
  ciclo: string
}

export interface MaterialItem {
  id?: number
  nombre?: string
  url?: string
  semana?: number
}

// --- Recuperar / reset password
export interface RecuperarPasswordBody {
  email: string
}

export interface ResetPasswordBody {
  token: string
  nuevaContrasena: string
  confirmar: string
}

// --- Admin: Ciclos (incluye duracion_meses calculada)
export interface CicloBody {
  nombre: string
  fechaInicio: string
  duracion: number
  fechaFin?: string
}

export interface Ciclo {
  id: number
  nombre?: string
  nombres?: string
  fechaInicio?: string
  fecha_inicio?: string
  duracion?: number
  duracion_meses?: number
  fechaFin?: string
  fecha_fin?: string
}

// --- Admin: Cursos
export interface CursoBody {
  nombre: string
  profesor: string
  cicloId: number
}

export interface Curso {
  id: number
  nombre: string
  profesor: string
  cicloId?: number
  ciclo_id?: number
  Ciclo?: Ciclo
}

// --- Admin: Matrícula (por ciclo; código del alumno)
export interface MatriculaManualBody {
  codigoAlumno: string
  cicloId: number
}

export interface MatriculaMasivaItem {
  codigoAlumno: string
  cicloId: number
}

export interface MatriculaMasivaBody {
  registros: MatriculaMasivaItem[]
}

/** Registrar nuevo alumno con datos y asignar ciclo */
export interface MatriculaNuevoAlumnoBody {
  nombres: string
  apellidos: string
  dni: string
  fechaNacimiento: string
  nombreApoderado: string
  apellidoApoderado: string
  correoApoderado: string
  dniApoderado: string
  celular: string
  cicloId: number
}

// --- Admin: Alumnos (ciclo vigente o listado)
export interface AlumnoListItem {
  id: number
  codigo?: string
  nombres: string
  apellidos: string
  email_alumno?: string
  foto_url?: string
  celular?: string
}

export interface AlumnosByCicloParams {
  cicloId: number
  page?: number
  limit?: number
}

export interface AsistenciaListParams {
  cicloId: number
  fecha: string
}

export interface AsistenciaListItem {
  codigo?: string
  nombres?: string
  apellidos?: string
  estado?: string
  observaciones?: string
  hora?: string | null
}

export interface AsistenciaListResponse {
  fecha: string
  cicloId: number
  listado: AsistenciaListItem[]
}

// --- Admin: Asistencia
export interface AsistenciaRegistroBody {
  dni: string
  fecha?: string
}

export interface AsistenciaInhabilitarBody {
  cicloId: number
  fecha: string
}

// --- Admin: Exámenes
export interface ExamenBody {
  cicloId: number
  semana: number
  tipoExamen: string
  subtipoExamen?: string
  fecha: string
  cantidadPreguntas?: number
  puntajeBuena?: number
  puntajeMala?: number
}

export interface CalificacionExamenItem {
  codigoAlumno: string
  /** Nota directa (cuando no se usa fórmula buenas/malas) */
  nota?: number
  /** Cantidad de respuestas correctas */
  buenas?: number
  /** Cantidad de respuestas incorrectas */
  malas?: number
}

export interface Examen {
  id: number
  cicloId?: number
  ciclo_id?: number
  semana: number
  tipoExamen?: string
  tipo_examen?: string
  subtipoExamen?: string
  subtipo_examen?: string
  fecha: string
  cantidadPreguntas?: number
  cantidad_preguntas?: number
  puntajePreguntaBuena?: number
  puntaje_pregunta_buena?: number
  puntajePreguntaMala?: number
  puntaje_pregunta_mala?: number
}

// --- Admin: Horario de cursos
export interface HorarioAdmin {
  id: number
  cursoId: number
  cursoNombre: string
  cicloId?: number
  cicloNombre?: string
  diaSemana: string
  horaInicio: string
  horaFin: string
}

export interface HorarioBody {
  cursoId: number
  diaSemana: string
  horaInicio: string
  horaFin: string
}

// --- Admin: Alumno por código (incluye matrículas y ciclos)
export interface AlumnoDetail {
  id?: number
  codigo?: string
  nombres?: string
  apellidos?: string
  dni?: string
  email_alumno?: string
  foto_url?: string
  celular?: string
  ciclo?: string
  Matriculas?: unknown[]
}

export interface CicloVigenteAlumnosResponse {
  ciclo: Ciclo
  alumnos: AlumnoListItem[]
}

// --- Admin: Materiales por curso (incluye url_drive)
export interface MaterialAdmin {
  id?: number
  semana: number
  nombre: string
  url_drive?: string | null
  urlDrive?: string | null
  url_archivo?: string | null
  urlArchivo?: string | null
}

