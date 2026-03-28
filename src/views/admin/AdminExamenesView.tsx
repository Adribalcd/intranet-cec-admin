import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { Ciclo, Examen, CalificacionExamenItem, PlantillaExamen, ConfigCursoExamen } from '../../models/types'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .exam-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }

  .exam-wrap {
    --teal-dark:  #0d4f5c;
    --teal-mid:   #0a9396;
    --teal-light: #94d2bd;
    --teal-pale:  #e8f4f5;
    --accent:     #e9c46a;
    --danger:     #e76f51;
    --blue-dark:  #1d3557;
    --blue-mid:   #457b9d;
    --green-dark: #1a7a6e;
    --green-mid:  #2a9d8f;
    --text-main:  #212529;
    --text-muted: #6c757d;
    --border:     #dee2e6;
  }

  /* Header */
  .exam-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 12px; flex-wrap: wrap; }
  .exam-title { font-size: 22px; font-weight: 700; color: var(--teal-dark); display: flex; align-items: center; gap: 10px; margin: 0; }
  .exam-title-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 17px; flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(10,147,150,0.3);
  }
  .exam-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; font-weight: 400; }

  /* Alerts */
  .exam-alert-error {
    display: flex; align-items: flex-start; gap: 10px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 12px 16px; color: #b91c1c; font-size: 13px; margin-bottom: 16px;
  }
  .exam-alert-success {
    display: flex; align-items: flex-start; gap: 10px;
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
    padding: 12px 16px; color: #166534; font-size: 13px; margin-bottom: 16px;
  }

  /* Layout grid */
  .exam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
  @media (max-width: 900px) { .exam-grid { grid-template-columns: 1fr; } }

  /* Cards */
  .exam-card {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07); margin-bottom: 0;
  }
  .exam-card-header {
    display: flex; align-items: center; gap: 12px;
    padding: 15px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--teal-pale), #fff);
  }
  .exam-card-header-icon {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: white;
  }
  .exam-card-header-icon.crear   { background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark)); }
  .exam-card-header-icon.notas   { background: linear-gradient(135deg, var(--green-mid), var(--green-dark)); }
  .exam-card-header-icon.excel   { background: linear-gradient(135deg, #457b9d, #1d3557); }
  .exam-card-title { font-size: 14px; font-weight: 700; color: var(--teal-dark); margin: 0; }
  .exam-card-desc  { font-size: 12px; color: var(--text-muted); margin: 0; }
  .exam-card-body  { padding: 20px; }

  /* Examen activo chip */
  .exam-active-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, var(--teal-pale), #e0f2f1);
    border: 1px solid var(--teal-light); color: var(--teal-dark);
    font-size: 12px; font-weight: 700; padding: 6px 14px;
    border-radius: 20px; margin-bottom: 16px;
  }
  .exam-active-chip i { color: var(--teal-mid); }

  /* Fields */
  .exam-field { margin-bottom: 14px; }
  .exam-field label {
    display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;
  }
  .exam-field input, .exam-field select {
    width: 100%; padding: 9px 12px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: #fafafa;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
    appearance: none; -webkit-appearance: none;
  }
  .exam-field input:focus, .exam-field select:focus {
    border-color: var(--teal-mid); background: white;
    box-shadow: 0 0 0 3px rgba(10,147,150,0.12);
  }
  .exam-select-wrap { position: relative; }
  .exam-select-wrap::after {
    content: '\\f282'; font-family: 'Bootstrap Icons';
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none; font-size: 12px;
  }
  .exam-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .exam-field-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

  /* Buttons */
  .btn-crear-examen {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    color: white; font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(10,147,150,0.25);
    transition: opacity 0.18s, transform 0.12s; width: 100%; justify-content: center;
  }
  .btn-crear-examen:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-crear-examen:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-registrar-notas {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, var(--green-mid), var(--green-dark));
    color: white; font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(42,157,143,0.25);
    transition: opacity 0.18s, transform 0.12s;
  }
  .btn-registrar-notas:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-registrar-notas:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-add-fila {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    border: 1.5px dashed var(--teal-light); background: var(--teal-pale);
    color: var(--teal-dark); font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer;
    transition: border-color 0.18s, background 0.18s;
  }
  .btn-add-fila:hover { border-color: var(--teal-mid); background: #d4eced; }

  .btn-remove-fila {
    width: 30px; height: 30px; border-radius: 7px; border: none;
    background: #fff0ed; color: var(--danger); font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.15s; flex-shrink: 0;
  }
  .btn-remove-fila:hover { background: #ffe0d9; }

  .btn-excel-dl {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, #457b9d, #1d3557);
    color: white; font-size: 12px; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(29,53,87,0.2);
    transition: opacity 0.18s, transform 0.12s;
  }
  .btn-excel-dl:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-excel-dl:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-excel-up {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 9px;
    border: 1.5px solid var(--blue-mid); background: white;
    color: var(--blue-mid); font-size: 12px; font-weight: 700; font-family: inherit;
    cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .btn-excel-up:hover:not(:disabled) { background: var(--blue-mid); color: white; }
  .btn-excel-up:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Calificaciones rows */
  .calif-rows { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .calif-row {
    display: grid; grid-template-columns: 1fr 0.7fr 30px;
    gap: 8px; align-items: center;
    background: #f8fafc; border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 12px; transition: border-color 0.15s;
  }
  .calif-row:hover { border-color: var(--teal-light); }
  .calif-row-num { font-size: 9px; font-weight: 700; color: var(--teal-mid); margin-bottom: 3px; }
  .calif-row input {
    width: 100%; padding: 7px 10px;
    border: 1.5px solid var(--border); border-radius: 8px;
    font-size: 12px; font-family: inherit; background: white; outline: none;
    transition: border-color 0.18s; appearance: none; -webkit-appearance: none;
  }
  .calif-row input:focus { border-color: var(--green-mid); }
  .calif-empty {
    text-align: center; padding: 22px; color: var(--text-muted); font-size: 13px;
    background: #f8fafc; border-radius: 10px; border: 1.5px dashed var(--border); margin-bottom: 14px;
  }
  .calif-empty i { font-size: 26px; color: var(--teal-light); display: block; margin-bottom: 6px; }

  /* ── Contenedor scrolleable de filas ── */
  .calif-scroll-wrap {
    border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 14px;
    overflow-x: auto;
  }
  .calif-scroll-header {
    display: grid; grid-template-columns: 1fr 0.7fr 30px;
    gap: 8px; padding: 7px 12px;
    background: var(--teal-dark);
    font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em;
    color: rgba(255,255,255,0.75);
    min-width: max-content; width: 100%;
  }
  .calif-scroll-body {
    max-height: 460px; overflow-y: auto;
    display: flex; flex-direction: column; gap: 0; background: white;
    min-width: max-content;
  }
  .calif-scroll-body::-webkit-scrollbar { width: 4px; }
  .calif-scroll-body::-webkit-scrollbar-track { background: #f1f5f9; }
  .calif-scroll-body::-webkit-scrollbar-thumb { background: var(--teal-light); border-radius: 10px; }
  .calif-scroll-body .calif-row {
    border-radius: 0; border-left: 3px solid transparent;
    border-right: none; border-top: none; border-bottom: 1px solid #f0f4f5;
    background: white;
  }
  .calif-scroll-body .calif-row:last-child { border-bottom: none; }
  .calif-scroll-body .calif-row:hover { background: var(--teal-pale); border-left-color: var(--teal-light); }
  /* Fila con nota ya registrada */
  .calif-row-existente {
    border-left-color: var(--green-mid) !important;
    background: linear-gradient(90deg, #f0fdf9 0%, white 60%) !important;
  }
  .calif-row-existente:hover { background: linear-gradient(90deg, #e6faf5 0%, var(--teal-pale) 60%) !important; }
  /* Etiqueta "registrada" en el campo de nota */
  .nota-reg-label {
    font-size: 8px; font-weight: 800; color: var(--green-dark);
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;
    display: flex; align-items: center; gap: 3px;
  }

  /* Examen selector list */
  .exam-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .exam-list-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid var(--border); background: #f8fafc;
    cursor: pointer; transition: border-color 0.18s, background 0.18s;
  }
  .exam-list-item:hover { border-color: var(--teal-light); background: var(--teal-pale); }
  .exam-list-item.selected { border-color: var(--teal-mid); background: var(--teal-pale); }
  .exam-list-item-left { flex: 1; }
  .exam-list-item-tipo { font-size: 13px; font-weight: 700; color: var(--teal-dark); }
  .exam-list-item-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .exam-list-item-check {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
    background: var(--teal-mid); color: white; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
  }
  .exam-notas-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700;
    background: #dcfce7; color: #166534; border: 1px solid #86efac;
    white-space: nowrap; flex-shrink: 0;
  }
  .exam-notas-badge-none {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600;
    background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0;
    white-space: nowrap; flex-shrink: 0;
  }

  /* Divider */
  .exam-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 16px; }
  .exam-divider-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); white-space: nowrap; }
  .exam-divider-line { flex: 1; height: 1px; background: var(--border); }

  /* Excel panel */
  .excel-panel { background: #f0f6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; }
  .excel-panel-title { font-size: 12px; font-weight: 700; color: var(--blue-dark); margin-bottom: 4px; }
  .excel-panel-desc  { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
  .excel-panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* Simulacro OMR panel */
  .simulacro-panel {
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 16px; margin-top: 12px;
  }
  .simulacro-panel-title { font-size: 12px; font-weight: 700; color: var(--green-dark); margin-bottom: 4px; }
  .simulacro-panel-desc  { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
  .btn-simulacro-up {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--green-dark); color: white; border: none; border-radius: 8px;
    padding: 8px 16px; font-size: 12px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: background 0.15s;
  }
  .btn-simulacro-up:hover:not(:disabled) { background: var(--green-mid); }
  .btn-simulacro-up:disabled { opacity: 0.55; cursor: not-allowed; }
  .simulacro-resumen {
    margin-top: 10px; background: white; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 14px;
  }
  .simulacro-resumen-row { display: flex; align-items: center; gap: 8px; font-size: 12px; margin-bottom: 4px; }
  .simulacro-tag { display: inline-block; padding: 1px 8px; border-radius: 5px; font-weight: 700; font-size: 11px; }
  .simulacro-tag-area { background: #dcfce7; color: #166534; }
  .simulacro-tag-warn { background: #fef9c3; color: #854d0e; }
  .simulacro-tag-err  { background: #fee2e2; color: #b91c1c; }

  /* Nota badge */
  .nota-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: monospace; }
  .nota-alta  { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .nota-media { background: #fef9c3; color: #854d0e; border: 1px solid #fcd34d; }
  .nota-baja  { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

  /* Loading */
  .exam-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: var(--teal-mid); font-size: 14px; font-weight: 500; }
  .exam-spinner { width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid var(--teal-light); border-top-color: var(--teal-mid); animation: exspin 0.7s linear infinite; }
  .exam-spinner-sm { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; animation: exspin 0.7s linear infinite; }
  @keyframes exspin { to { transform: rotate(360deg); } }

  /* ── Ranking ── */
  .ranking-section {
    background: white; border: 1px solid var(--border); border-radius: 16px;
    overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    margin-top: 24px; animation: fadeInUp 0.3s ease;
  }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .ranking-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, #fff9e6, #fff);
  }
  .ranking-header-left {
    display: flex; align-items: center; gap: 10px;
  }
  .ranking-header-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 16px; flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(245,158,11,0.35);
  }
  .ranking-title { font-size: 14px; font-weight: 700; color: #92400e; margin: 0; }
  .ranking-subtitle { font-size: 11px; color: var(--text-muted); margin: 0; }
  .ranking-close {
    width: 28px; height: 28px; border-radius: 7px; border: none;
    background: #f1f5f9; color: var(--text-muted); cursor: pointer; font-size: 13px;
    display: flex; align-items: center; justify-content: center;
  }
  .ranking-close:hover { background: #e2e8f0; }

  /* Podium */
  .ranking-podium {
    display: flex; align-items: flex-end; justify-content: center; gap: 12px;
    padding: 28px 20px 8px; background: linear-gradient(180deg, #fffbeb 0%, #fff 100%);
  }
  .podium-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .podium-medal {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; border: 3px solid;
    position: relative;
  }
  .podium-medal.gold   { background: linear-gradient(135deg,#fef3c7,#fde68a); border-color: #f59e0b; box-shadow: 0 4px 14px rgba(245,158,11,0.4); }
  .podium-medal.silver { background: linear-gradient(135deg,#f1f5f9,#e2e8f0); border-color: #94a3b8; box-shadow: 0 3px 10px rgba(148,163,184,0.3); }
  .podium-medal.bronze { background: linear-gradient(135deg,#fef3e2,#fed7aa); border-color: #f97316; box-shadow: 0 3px 10px rgba(249,115,22,0.3); }
  .podium-code { font-size: 12px; font-weight: 700; color: #374151; max-width: 80px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .podium-nota {
    font-size: 15px; font-weight: 800;
    padding: 3px 12px; border-radius: 20px; border: 1.5px solid;
  }
  .podium-nota.gold   { background: #fef3c7; border-color: #f59e0b; color: #78350f; }
  .podium-nota.silver { background: #f1f5f9;  border-color: #94a3b8; color: #1e293b; }
  .podium-nota.bronze { background: #fef3e2;  border-color: #f97316; color: #7c2d12; }
  .podium-base {
    border-radius: 10px 10px 0 0; width: 80px; display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: white; padding: 8px;
  }
  .podium-base.gold   { height: 70px; background: linear-gradient(180deg, #f59e0b, #d97706); }
  .podium-base.silver { height: 50px; background: linear-gradient(180deg, #94a3b8, #64748b); }
  .podium-base.bronze { height: 36px; background: linear-gradient(180deg, #f97316, #ea580c); }

  /* Ranking table */
  .ranking-table { width: 100%; border-collapse: collapse; }
  .ranking-table th {
    padding: 9px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--text-muted); text-align: left;
    border-bottom: 1px solid var(--border); background: #fafafa;
  }
  .ranking-table td {
    padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #f0f4f5;
    vertical-align: middle;
  }
  .ranking-table tr:last-child td { border-bottom: none; }
  .ranking-table tr:hover td { background: #f8fafc; }

  .rank-pos {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 50%; font-size: 12px; font-weight: 800;
    background: var(--teal-pale); color: var(--teal-dark);
  }
  .rank-pos.p1 { background: linear-gradient(135deg,#fef3c7,#fde68a); color: #78350f; border: 1.5px solid #f59e0b; }
  .rank-pos.p2 { background: linear-gradient(135deg,#f1f5f9,#e2e8f0); color: #1e293b; border: 1.5px solid #94a3b8; }
  .rank-pos.p3 { background: linear-gradient(135deg,#fef3e2,#fed7aa); color: #7c2d12; border: 1.5px solid #f97316; }

  .rank-bar-wrap { flex: 1; background: #f1f5f9; border-radius: 20px; height: 8px; overflow: hidden; min-width: 80px; }
  .rank-bar { height: 100%; border-radius: 20px; transition: width 0.5s ease; }
  .rank-bar.high   { background: linear-gradient(90deg, #34d399, #059669); }
  .rank-bar.mid    { background: linear-gradient(90deg, #facc15, #ca8a04); }
  .rank-bar.low    { background: linear-gradient(90deg, #f87171, #dc2626); }

  /* Ciclo selector banner */
  .exam-ciclo-selector {
    background: white; border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 20px; margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  }
  .exam-ciclo-selector label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); white-space: nowrap; }
  .exam-ciclo-select-wrap { position: relative; flex: 1; min-width: 200px; }
  .exam-ciclo-select-wrap::after { content: '\\f282'; font-family: 'Bootstrap Icons'; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; font-size: 12px; }
  .exam-ciclo-select-wrap select {
    width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: #fafafa; outline: none; appearance: none; -webkit-appearance: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .exam-ciclo-select-wrap select:focus { border-color: var(--teal-mid); background: white; box-shadow: 0 0 0 3px rgba(10,147,150,0.12); }

  .exam-no-ciclo { text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 13px; }
  .exam-no-ciclo i { font-size: 36px; color: var(--teal-light); display: block; margin-bottom: 10px; }

  @media (max-width: 500px) { .exam-field-row { grid-template-columns: 1fr; } .exam-field-row3 { grid-template-columns: 1fr; } }

  /* ── Consultar sección ── */
  .consultar-card {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    margin-top: 24px;
  }
  .consultar-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 15px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, #fff9e6, #fff);
    gap: 12px; flex-wrap: wrap;
  }
  .consultar-header-left { display: flex; align-items: center; gap: 12px; }
  .consultar-header-icon {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: white;
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }
  .consultar-body { padding: 20px; }
  .consultar-exam-list { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
  .consultar-exam-item {
    display: grid; grid-template-columns: 1fr auto auto;
    align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 10px;
    border: 1.5px solid var(--border); background: #f8fafc;
    transition: border-color 0.18s;
  }
  .consultar-exam-item:hover { border-color: var(--teal-light); background: var(--teal-pale); }
  .consultar-exam-tipo { font-size: 13px; font-weight: 700; color: var(--teal-dark); }
  .consultar-exam-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .btn-ver-ranking {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px; border: none;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white; font-size: 11px; font-weight: 700; font-family: inherit;
    cursor: pointer; white-space: nowrap; transition: opacity 0.15s;
  }
  .btn-ver-ranking:hover { opacity: 0.85; }
  .btn-dl-ranking {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    border: 1.5px solid #166534; background: white;
    color: #166534; font-size: 11px; font-weight: 700; font-family: inherit;
    cursor: pointer; white-space: nowrap; transition: background 0.15s, color 0.15s;
  }
  .btn-dl-ranking:hover { background: #166534; color: white; }
  .ranking-loading {
    display: flex; align-items: center; gap: 8px;
    padding: 16px; color: var(--teal-mid); font-size: 13px;
  }

  /* ── Tabs notas ── */
  .notas-tabs {
    display: flex; border-bottom: 2px solid var(--border);
    margin: 0 0 16px; gap: 2px;
  }
  .notas-tab-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border: none; background: transparent;
    font-size: 12px; font-weight: 700; font-family: inherit;
    color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: color 0.15s, border-color 0.15s;
    border-radius: 8px 8px 0 0;
  }
  .notas-tab-btn:hover { color: var(--teal-dark); background: var(--teal-pale); }
  .notas-tab-btn.active { color: var(--teal-dark); border-bottom-color: var(--teal-mid); background: var(--teal-pale); }

  /* ── Excel upload grid ── */
  .excel-upload-grid { display: flex; flex-direction: column; gap: 12px; }
  .excel-upload-card {
    border-radius: 12px; padding: 14px 16px; border: 1.5px solid;
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  }
  .excel-upload-card-info { flex: 1; min-width: 160px; }
  .excel-upload-card-title { font-size: 13px; font-weight: 700; margin-bottom: 2px; }
  .excel-upload-card-desc  { font-size: 11px; color: var(--text-muted); }
  .excel-upload-card-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

  .excel-upload-card.plantilla { background: #f0f6ff; border-color: #bfdbfe; }
  .excel-upload-card.plantilla .excel-upload-card-title { color: #1d3557; }
  .excel-upload-card.plantilla .excel-upload-card-icon { color: #1d3557; }

  .excel-upload-card.simulacro { background: #f0fdf4; border-color: #86efac; }
  .excel-upload-card.simulacro .excel-upload-card-title { color: var(--green-dark); }
  .excel-upload-card.simulacro .excel-upload-card-icon { color: var(--green-dark); }

  .excel-upload-card.resultados { background: #eef2ff; border-color: #c7d2fe; }
  .excel-upload-card.resultados .excel-upload-card-title { color: #3730a3; }
  .excel-upload-card.resultados .excel-upload-card-icon { color: #3730a3; }

  .excel-upload-card-icon { font-size: 24px; flex-shrink: 0; }
`

export function AdminExamenesView() {
  const [ciclos, setCiclos]           = useState<Ciclo[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  // Ciclo seleccionado para crear examen
  const [cicloCrearId, setCicloCrearId] = useState<number | ''>('')
  const [creando, setCreando]         = useState(false)
  const [examenForm, setExamenForm]   = useState({ semana: '', fecha: '' })
  // Plantilla y config de cursos para el nuevo examen
  const [plantillas, setPlantillas]         = useState<PlantillaExamen[]>([])
  const [plantillaId, setPlantillaId]       = useState<number | ''>('')
  const [plantillaActual, setPlantillaActual] = useState<PlantillaExamen | null>(null)
  const [configCursos, setConfigCursos]     = useState<ConfigCursoExamen[]>([])

  // Ciclo + examen seleccionado para registrar notas
  const [cicloNotasId, setCicloNotasId] = useState<number | ''>('')
  const [examenesLista, setExamenesLista] = useState<Examen[]>([])
  const [loadingExamenes, setLoadingExamenes] = useState(false)
  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null)
  const [registrando, setRegistrando] = useState(false)
  const [califFilas, setCalifFilas]   = useState<Array<{ codigoAlumno: string; nombre: string; nota: string; buenas: string; malas: string; cursos: Record<string, { buenas: string; malas: string }> }>>([{ codigoAlumno: '', nombre: '', nota: '', buenas: '', malas: '', cursos: {} }])
  const [alumnosDelCiclo, setAlumnosDelCiclo] = useState<Array<{ codigo: string; nombres: string; apellidos: string }>>([])
  const [loadingAlumnos, setLoadingAlumnos]   = useState(false)
  const [loadingNotasExamen, setLoadingNotasExamen] = useState(false)

  const [ranking, setRanking]           = useState<CalificacionExamenItem[]>([])
  const [rankingExamen, setRankingExamen] = useState<Examen | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileSimulacroRef = useRef<HTMLInputElement>(null)
  const [subiendoSimulacro, setSubiendoSimulacro] = useState(false)
  const [simulacroResumen, setSimulacroResumen] = useState<{
    area: string; procesados: number; noEncontrados: string[]; errores: Array<{ dni: string; error: string }>
  } | null>(null)

  const fileResultadosRef = useRef<HTMLInputElement>(null)
  const [subiendoResultados, setSubiendoResultados] = useState(false)
  const [confirmandoResultados, setConfirmandoResultados] = useState(false)
  const [resultadosResumen, setResultadosResumen] = useState<{
    procesados: number; noEncontradosEnExcel?: string[]; noEncontrados?: string[]; errores: Array<{ alumno?: string; alumnoId?: number; error: string }>
  } | null>(null)
  type PreviewItem = {
    alumnoId: number; dni: string; codigo: string; nombres: string; apellidos: string
    encontradoEnExcel: boolean
    global: { total: number; aciertos: number; fallos: number; blanco: number; puntaje: number } | null
    cursos: Array<{ curso: string; aciertos: number; fallos: number; blanco: number; puntaje: number }>
  }
  const [previewResultados, setPreviewResultados] = useState<PreviewItem[] | null>(null)

  // Tab activo en el panel de notas: manual o excel
  const [notasTab, setNotasTab] = useState<'manual' | 'excel'>('manual')

  // ── Consulta de exámenes ──
  const [consultaCicloId, setConsultaCicloId] = useState<number | ''>('')
  const [consultaExamenes, setConsultaExamenes] = useState<Examen[]>([])
  const [loadingConsulta, setLoadingConsulta] = useState(false)
  const [consultaRanking, setConsultaRanking] = useState<{
    examen: any
    notas: Array<{ puesto: number; nota: number; codigo: string; nombres: string; apellidos: string }>
  } | null>(null)
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [dlRankingId, setDlRankingId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      adminApi.getCiclos(),
      adminApi.getPlantillasExamen(),
    ])
      .then(([ciclosRes, plantillasRes]) => {
        setCiclos(Array.isArray(ciclosRes.data) ? ciclosRes.data : [])
        setPlantillas(Array.isArray(plantillasRes.data) ? plantillasRes.data : [])
      })
      .catch(() => setError('No se pudieron cargar los datos iniciales.'))
      .finally(() => setLoading(false))
  }, [])

  // Cargar exámenes y alumnos cuando cambia cicloNotasId
  useEffect(() => {
    if (!cicloNotasId) {
      setExamenesLista([]); setSelectedExamen(null)
      setAlumnosDelCiclo([]); setCalifFilas([{ codigoAlumno: '', nombre: '', nota: '', buenas: '', malas: '', cursos: {} }])
      return
    }
    setLoadingExamenes(true)
    setLoadingAlumnos(true)
    Promise.all([
      adminApi.getExamenesPorCiclo(cicloNotasId as number),
      adminApi.getAlumnosPorCiclo(cicloNotasId as number),
    ])
      .then(([exRes, alRes]) => {
        setExamenesLista(Array.isArray(exRes.data) ? exRes.data : [])
        const alumnos = Array.isArray(alRes.data?.alumnos) ? alRes.data.alumnos : []
        setAlumnosDelCiclo(alumnos)
        setSelectedExamen(null)
        setCalifFilas(
          alumnos.length > 0
            ? alumnos.map((a: any) => ({ codigoAlumno: a.codigo ?? '', nombre: `${a.nombres ?? ''} ${a.apellidos ?? ''}`.trim(), nota: '', buenas: '', malas: '', cursos: {} }))
            : [{ codigoAlumno: '', nombre: '', nota: '', buenas: '', malas: '', cursos: {} }]
        )
      })
      .catch(() => setError('Error al cargar exámenes o alumnos del ciclo.'))
      .finally(() => { setLoadingExamenes(false); setLoadingAlumnos(false) })
  }, [cicloNotasId])

  // Auto-poblar filas cuando se selecciona un examen
  useEffect(() => {
    if (!selectedExamen) return
    const cantNotas = parseInt((selectedExamen as any).cantidadNotas ?? '0', 10)
    if (cantNotas > 0) {
      setLoadingNotasExamen(true)
      adminApi.getNotasExamen(selectedExamen.id)
        .then((res) => {
          const notas: any[] = res.data?.notas ?? []
          if (notas.length > 0) {
            setCalifFilas(notas.map((n) => ({
              codigoAlumno: n.codigo ?? '',
              nombre: `${n.nombres ?? ''} ${n.apellidos ?? ''}`.trim(),
              nota: String(n.valor ?? n.nota ?? ''),
              buenas: String(n.buenas ?? ''),
              malas: String(n.malas ?? ''),
              cursos: {},
            })))
          }
        })
        .catch(() => {/* mantiene las filas actuales */})
        .finally(() => setLoadingNotasExamen(false))
    } else {
      // Sin notas previas → pre-llenar con los alumnos del ciclo
      setCalifFilas(
        alumnosDelCiclo.length > 0
          ? alumnosDelCiclo.map((a) => ({ codigoAlumno: a.codigo ?? '', nombre: `${a.nombres ?? ''} ${a.apellidos ?? ''}`.trim(), nota: '', buenas: '', malas: '', cursos: {} }))
          : [{ codigoAlumno: '', nombre: '', nota: '', buenas: '', malas: '', cursos: {} }]
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExamen?.id])

  const clearAlerts = () => { setError(''); setSuccess('') }

  // Cursos del examen seleccionado (desde su Plantilla incluida)
  const examenCursos: Array<{ nombre: string; puntajeBuena: number; puntajeMala: number }> = (() => {
    const p = (selectedExamen as any)?.Plantilla
    if (!p) return []
    const lista: Array<{ nombre: string; puntajeBuena: number; puntajeMala: number }> = []
    if (p.tiene_secciones) {
      for (const sec of (p.Secciones ?? [])) {
        for (const cur of (sec.Cursos ?? [])) {
          lista.push({ nombre: cur.nombre, puntajeBuena: Number(cur.puntaje_buena ?? cur.puntajeBuena ?? 4), puntajeMala: Number(cur.puntaje_mala ?? cur.puntajeMala ?? 1) })
        }
      }
    } else {
      for (const cur of (p.Cursos ?? [])) {
        lista.push({ nombre: cur.nombre, puntajeBuena: Number(cur.puntaje_buena ?? cur.puntajeBuena ?? 4), puntajeMala: Number(cur.puntaje_mala ?? cur.puntajeMala ?? 1) })
      }
    }
    return lista
  })()

  const buildFilaVacia = (codigo = '', nombre = '') => ({
    codigoAlumno: codigo,
    nombre,
    nota: '',
    buenas: '',
    malas: '',
    cursos: Object.fromEntries(examenCursos.map(c => [c.nombre, { buenas: '', malas: '' }])),
  })

  // Seleccionar plantilla → cargar cursos en configCursos
  const handleSelectPlantilla = (id: number | '') => {
    setPlantillaId(id)
    if (!id) { setPlantillaActual(null); setConfigCursos([]); return }
    const p = plantillas.find(x => x.id === id) ?? null
    setPlantillaActual(p)
    if (!p) { setConfigCursos([]); return }

    // Aplanar secciones/cursos en una lista de ConfigCursoExamen
    const lista: ConfigCursoExamen[] = []
    const curToConfig = (cur: any, seccionNombre: string | null, i: number): ConfigCursoExamen => ({
      nombre:            cur.nombre,
      seccionNombre,
      cantidadPreguntas: cur.cantidadPreguntas ?? cur.cantidad_preguntas ?? null,
      puntajeBuena:      Number(cur.puntajeBuena  ?? cur.puntaje_buena  ?? 4),
      puntajeMala:       Number(cur.puntajeMala   ?? cur.puntaje_mala   ?? 1),
      orden:             cur.orden ?? i,
    })
    if (p.tiene_secciones) {
      for (const sec of (p as any).Secciones ?? []) {
        for (let i = 0; i < (sec.Cursos ?? []).length; i++) {
          lista.push(curToConfig(sec.Cursos[i], sec.nombre, i))
        }
      }
    } else {
      for (let i = 0; i < ((p as any).Cursos ?? []).length; i++) {
        lista.push(curToConfig((p as any).Cursos[i], null, i))
      }
    }
    setConfigCursos(lista)
  }

  const updateConfigCurso = (i: number, field: keyof ConfigCursoExamen, val: string | number | null) => {
    setConfigCursos(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: val }; return n })
  }

  // Crear examen
  const handleCrearExamen = async (e: React.FormEvent) => {
    e.preventDefault(); clearAlerts()
    if (!cicloCrearId || !examenForm.semana || !examenForm.fecha || !plantillaId) {
      setError('Completa todos los campos obligatorios (ciclo, número de examen, fecha y plantilla).'); return
    }
    setCreando(true)
    try {
      await adminApi.crearExamen({
        cicloId:      cicloCrearId as number,
        semana:       parseInt(examenForm.semana, 10),
        fecha:        examenForm.fecha,
        plantillaId:  plantillaId as number,
        configCursos: configCursos.length > 0 ? configCursos : undefined,
      })
      setSuccess('Examen creado correctamente.')
      setExamenForm({ semana: '', fecha: '' })
      setPlantillaId(''); setPlantillaActual(null); setConfigCursos([])
      // Refrescar lista si está en el mismo ciclo
      if (cicloNotasId === cicloCrearId) {
        const res = await adminApi.getExamenesPorCiclo(cicloCrearId as number)
        setExamenesLista(Array.isArray(res.data) ? res.data : [])
      }
    } catch {
      setError('Error al crear el examen.')
    } finally {
      setCreando(false)
    }
  }

  // Registrar calificaciones — soporta nota directa O buenas/malas
  const usaBuenasMalas = Boolean(
    selectedExamen &&
    (selectedExamen.puntaje_pregunta_buena ?? selectedExamen.puntajePreguntaBuena)
  )

  const handleRegistrarCalificaciones = async (e: React.FormEvent) => {
    e.preventDefault(); clearAlerts()
    if (!selectedExamen) { setError('Selecciona un examen primero.'); return }

    const usaCursos = examenCursos.length > 0 && usaBuenasMalas
    const calificaciones: CalificacionExamenItem[] = usaCursos
      ? califFilas
          .filter((f) => f.codigoAlumno.trim() && examenCursos.some(c => f.cursos[c.nombre]?.buenas !== ''))
          .map((f) => ({
            codigoAlumno: f.codigoAlumno.trim(),
            cursos: examenCursos.map(c => ({
              nombre: c.nombre,
              buenas: parseInt(f.cursos[c.nombre]?.buenas || '0', 10),
              malas:  parseInt(f.cursos[c.nombre]?.malas  || '0', 10),
            })),
          }))
      : usaBuenasMalas
        ? califFilas
            .filter((f) => f.codigoAlumno.trim() && f.buenas !== '' && f.malas !== '')
            .map((f) => ({ codigoAlumno: f.codigoAlumno.trim(), buenas: parseInt(f.buenas, 10), malas: parseInt(f.malas, 10) }))
        : califFilas
            .filter((f) => f.codigoAlumno.trim() && f.nota !== '')
            .map((f) => ({ codigoAlumno: f.codigoAlumno.trim(), nota: parseFloat(f.nota) }))

    if (calificaciones.length === 0) { setError('Ingresa al menos una calificación.'); return }
    setRegistrando(true)
    try {
      await adminApi.registrarCalificaciones(selectedExamen.id, calificaciones)
      setSuccess(`${calificaciones.length} calificación(es) registradas con orden de mérito.`)
      const sorted = [...calificaciones].sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0))
      setRanking(sorted)
      setRankingExamen(selectedExamen)
      setCalifFilas([buildFilaVacia()])
      if (cicloNotasId) {
        adminApi.getExamenesPorCiclo(cicloNotasId as number).then((r) => setExamenesLista(Array.isArray(r.data) ? r.data : []))
      }
    } catch {
      setError('Error al registrar calificaciones.')
    } finally {
      setRegistrando(false)
    }
  }

  const addFila    = () => setCalifFilas([...califFilas, buildFilaVacia()])
  const removeFila = (i: number) => setCalifFilas(califFilas.filter((_, idx) => idx !== i))
  const updateFila = (i: number, field: 'codigoAlumno' | 'nombre' | 'nota' | 'buenas' | 'malas', val: string) => {
    const next = [...califFilas]; next[i] = { ...next[i], [field]: val }
    setCalifFilas(next)
  }
  const updateFilaCurso = (filaIdx: number, cursoNombre: string, campo: 'buenas' | 'malas', val: string) => {
    setCalifFilas(prev => {
      const next = [...prev]
      next[filaIdx] = { ...next[filaIdx], cursos: { ...next[filaIdx].cursos, [cursoNombre]: { ...next[filaIdx].cursos[cursoNombre], [campo]: val } } }
      return next
    })
  }

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const descargarPlantilla = () => {
    if (!selectedExamen) { setError('Selecciona un examen primero.'); return }
    clearAlerts()
    adminApi.getExamenPlantillaNotas(selectedExamen.id)
      .then((res) => { triggerDownload(res.data as Blob, `plantilla-notas-examen-${selectedExamen.id}.xlsx`); setSuccess('Plantilla descargada.') })
      .catch(() => setError('Error al descargar la plantilla.'))
  }

  const subirNotasExcel = (file: File) => {
    if (!selectedExamen) { setError('Selecciona un examen primero.'); return }
    clearAlerts()
    adminApi.postExamenNotasExcel(selectedExamen.id, file)
      .then(() => {
        setSuccess('Notas cargadas desde Excel con orden de mérito.')
        if (cicloNotasId) {
          adminApi.getExamenesPorCiclo(cicloNotasId as number).then((r) => setExamenesLista(Array.isArray(r.data) ? r.data : []))
        }
      })
      .catch(() => setError('Error al subir el Excel.'))
  }

  const subirSimulacroExcel = (file: File) => {
    if (!selectedExamen) { setError('Selecciona un examen primero.'); return }
    clearAlerts()
    setSimulacroResumen(null)
    setSubiendoSimulacro(true)
    adminApi.subirExcelSimulacro(selectedExamen.id, file)
      .then((r) => {
        const { area, resumen } = r.data
        setSimulacroResumen({ area, ...resumen })
        setSuccess(
          `Excel de Simulacro (Área ${area}) procesado. ` +
          `${resumen.procesados} alumno(s) registrados.` +
          (resumen.noEncontrados.length ? ` ${resumen.noEncontrados.length} DNI(s) no encontrados.` : '')
        )
        if (cicloNotasId) {
          adminApi.getExamenesPorCiclo(cicloNotasId as number).then((r2) => setExamenesLista(Array.isArray(r2.data) ? r2.data : []))
        }
      })
      .catch((e) => setError('Error al procesar el Excel de simulacro: ' + (e?.response?.data?.error ?? e?.message ?? 'Error desconocido')))
      .finally(() => setSubiendoSimulacro(false))
  }

  const cargarPreviewResultados = (file: File) => {
    if (!selectedExamen) { setError('Selecciona un examen primero.'); return }
    clearAlerts()
    setResultadosResumen(null)
    setPreviewResultados(null)
    setSubiendoResultados(true)
    adminApi.previewExcelResultados(selectedExamen.id, file)
      .then((r) => {
        setPreviewResultados(r.data.preview)
        const enc = r.data.encontrados
        const tot = r.data.total
        if (enc === 0) setError(`No se encontró ningún alumno en el Excel (${tot} matriculados buscados). Verifica el archivo.`)
      })
      .catch((e) => setError('Error al leer el Excel: ' + (e?.response?.data?.error ?? e?.message ?? 'Error desconocido')))
      .finally(() => setSubiendoResultados(false))
  }

  const confirmarResultados = () => {
    if (!selectedExamen || !previewResultados) return
    const notasAGuardar = previewResultados
      .filter(p => p.encontradoEnExcel && p.global)
      .map(p => ({ alumnoId: p.alumnoId, global: p.global, cursos: p.cursos }))
    if (notasAGuardar.length === 0) { setError('No hay notas encontradas para guardar.'); return }
    clearAlerts()
    setConfirmandoResultados(true)
    adminApi.confirmarExcelResultados(selectedExamen.id, notasAGuardar)
      .then((r) => {
        const { resumen } = r.data
        setResultadosResumen(resumen)
        setPreviewResultados(null)
        setSuccess(`${resumen.procesados} nota(s) guardadas correctamente.`)
        if (cicloNotasId) {
          adminApi.getExamenesPorCiclo(cicloNotasId as number).then((r2) => setExamenesLista(Array.isArray(r2.data) ? r2.data : []))
        }
      })
      .catch((e) => setError('Error al guardar notas: ' + (e?.response?.data?.error ?? e?.message ?? 'Error desconocido')))
      .finally(() => setConfirmandoResultados(false))
  }

  // ── Handlers de consulta ──
  const handleConsultaCiclo = (cicloId: number | '') => {
    setConsultaCicloId(cicloId)
    setConsultaExamenes([])
    setConsultaRanking(null)
    if (!cicloId) return
    setLoadingConsulta(true)
    adminApi.getExamenesPorCiclo(cicloId as number)
      .then((res) => setConsultaExamenes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Error al cargar exámenes del ciclo.'))
      .finally(() => setLoadingConsulta(false))
  }

  const verRanking = async (ex: Examen) => {
    setLoadingRanking(true)
    setConsultaRanking(null)
    try {
      const res = await adminApi.getNotasExamen(ex.id)
      setConsultaRanking(res.data)
    } catch {
      setError('Error al cargar el ranking de este examen.')
    } finally {
      setLoadingRanking(false)
    }
  }

  const descargarRanking = async (examenId: number) => {
    setDlRankingId(examenId)
    try {
      const res = await adminApi.reporteOrdenMerito(examenId)
      triggerDownload(res.data as Blob, `ranking-examen-${examenId}.xlsx`)
    } catch {
      setError('Error al descargar el ranking.')
    } finally {
      setDlRankingId(null)
    }
  }

  const notaBadge = (nota: string) => {
    const n = parseFloat(nota)
    if (isNaN(n)) return null
    if (n >= 14) return <span className="nota-badge nota-alta">{nota}</span>
    if (n >= 11) return <span className="nota-badge nota-media">{nota}</span>
    return <span className="nota-badge nota-baja">{nota}</span>
  }

  const fmtFecha = (f: string) => {
    if (!f) return ''
    const [y, m, d] = f.split('-')
    return `${d}/${m}/${y}`
  }

  if (loading) return (
    <div className="exam-wrap">
      <style>{styles}</style>
      <div className="exam-loading"><div className="exam-spinner" /> Cargando...</div>
    </div>
  )

  return (
    <div className="exam-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="exam-header">
        <h2 className="exam-title">
          <span className="exam-title-icon"><i className="bi bi-file-earmark-text-fill" /></span>
          <span>
            Exámenes y notas
            <div className="exam-subtitle">Crea exámenes y registra calificaciones por ciclo</div>
          </span>
        </h2>
      </div>

      {/* Alerts */}
      {error   && <div className="exam-alert-error">  <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} /> {error}</div>}
      {success && <div className="exam-alert-success"><i className="bi bi-check-circle-fill"       style={{ flexShrink: 0 }} /> {success}</div>}

      <div className="exam-grid">

        {/* ── CREAR EXAMEN ── */}
        <div className="exam-card">
          <div className="exam-card-header">
            <span className="exam-card-header-icon crear"><i className="bi bi-plus-circle-fill" /></span>
            <div>
              <p className="exam-card-title">Crear examen</p>
              <p className="exam-card-desc">Define el ciclo, número de examen y fecha</p>
            </div>
          </div>
          <div className="exam-card-body">
            <form onSubmit={handleCrearExamen}>
              <div className="exam-field">
                <label>Ciclo</label>
                <div className="exam-select-wrap">
                  <select value={cicloCrearId} onChange={(e) => setCicloCrearId(e.target.value ? parseInt(e.target.value) : '')} required>
                    <option value="">-- Seleccionar ciclo --</option>
                    {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="exam-field-row">
                <div className="exam-field">
                  <label>N° Examen</label>
                  <input type="number" placeholder="Ej: 1" min={1}
                    value={examenForm.semana}
                    onChange={(e) => setExamenForm({ ...examenForm, semana: e.target.value })} required />
                </div>
                <div className="exam-field">
                  <label>Fecha</label>
                  <input type="date" value={examenForm.fecha}
                    onChange={(e) => setExamenForm({ ...examenForm, fecha: e.target.value })} required />
                </div>
              </div>

              {/* ── Plantilla ── */}
              <div className="exam-field">
                <label>Plantilla de examen <span style={{ color: '#e76f51', fontWeight: 400 }}>*</span></label>
                {plantillas.length === 0 ? (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: '10px 14px', fontSize: 12, color: '#92400e' }}>
                    <i className="bi bi-exclamation-triangle" /> No hay plantillas disponibles.{' '}
                    <a href="/admin/plantillas-examen" style={{ color: '#b45309', fontWeight: 700 }}>Crear plantillas →</a>
                  </div>
                ) : (
                  <div className="exam-select-wrap">
                    <select
                      value={plantillaId}
                      onChange={(e) => handleSelectPlantilla(e.target.value ? parseInt(e.target.value) : '')}
                      required
                    >
                      <option value="">-- Seleccionar plantilla --</option>
                      {plantillas.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}{p.tipo_calculo === 'nota_directa' ? ' (nota directa)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ── Config de cursos (editable) ── */}
              {plantillaActual && configCursos.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                    Cursos del examen — ajusta la cantidad de preguntas si es necesario
                  </label>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ background: 'var(--teal-dark)', padding: '7px 12px', display: 'grid', gridTemplateColumns: plantillaActual.tipo_calculo === 'buenas_malas' ? '2fr 1fr 1fr 1fr' : '2fr 1fr', gap: 8 }}>
                      {['Curso', 'N° preg.', ...(plantillaActual.tipo_calculo === 'buenas_malas' ? ['Pts. buena', 'Pts. mala'] : [])].map(h => (
                        <span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.75)' }}>{h}</span>
                      ))}
                    </div>
                    <div style={{ maxHeight: 260, overflowY: 'auto', background: '#fff' }}>
                      {(() => {
                        let lastSec = ''
                        return configCursos.map((cur, i) => {
                          const showSec = plantillaActual.tiene_secciones && cur.seccionNombre && cur.seccionNombre !== lastSec
                          if (showSec) lastSec = cur.seccionNombre!
                          return (
                            <div key={i}>
                              {showSec && (
                                <div style={{ background: '#eff6ff', padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#1d3557', borderBottom: '1px solid #bfdbfe' }}>
                                  <i className="bi bi-collection" style={{ marginRight: 6 }} />{cur.seccionNombre}
                                </div>
                              )}
                              <div style={{ display: 'grid', gridTemplateColumns: plantillaActual.tipo_calculo === 'buenas_malas' ? '2fr 1fr 1fr 1fr' : '2fr 1fr', gap: 8, padding: '6px 12px', borderBottom: '1px solid #f0f4f5', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 500 }}>{cur.nombre}</span>
                                <input
                                  type="number" min={0} placeholder="—"
                                  value={cur.cantidadPreguntas ?? ''}
                                  onChange={e => updateConfigCurso(i, 'cantidadPreguntas', e.target.value ? parseInt(e.target.value) : null)}
                                  style={{ width: '100%', padding: '4px 8px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', outline: 'none' }}
                                />
                                {plantillaActual.tipo_calculo === 'buenas_malas' && <>
                                  <input
                                    type="number" step="0.001" min={0}
                                    value={cur.puntajeBuena}
                                    onChange={e => updateConfigCurso(i, 'puntajeBuena', parseFloat(e.target.value) || 4)}
                                    style={{ width: '100%', padding: '4px 8px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', outline: 'none' }}
                                  />
                                  <input
                                    type="number" step="0.001" min={0}
                                    value={cur.puntajeMala}
                                    onChange={e => updateConfigCurso(i, 'puntajeMala', parseFloat(e.target.value) || 1)}
                                    style={{ width: '100%', padding: '4px 8px', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', outline: 'none' }}
                                  />
                                </>}
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-crear-examen" disabled={creando}>
                {creando
                  ? <><div className="exam-spinner-sm" /> Creando...</>
                  : <><i className="bi bi-plus-circle" /> Crear examen</>}
              </button>
            </form>
          </div>
        </div>

        {/* ── REGISTRAR CALIFICACIONES ── */}
        <div className="exam-card">
          <div className="exam-card-header">
            <span className="exam-card-header-icon notas"><i className="bi bi-bar-chart-line-fill" /></span>
            <div>
              <p className="exam-card-title">Registrar calificaciones</p>
              <p className="exam-card-desc">Selecciona el ciclo y el examen, luego ingresa notas</p>
            </div>
          </div>
          <div className="exam-card-body">

            {/* Selector de ciclo */}
            <div className="exam-field" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ margin: 0 }}>Ciclo para buscar examen</label>
                {loadingAlumnos && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--teal-mid)' }}>
                    <div className="exam-spinner-sm" style={{ borderColor: 'var(--teal-light)', borderTopColor: 'var(--teal-mid)', width: 13, height: 13 }} />
                    Cargando alumnos...
                  </span>
                )}
                {!loadingAlumnos && alumnosDelCiclo.length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <i className="bi bi-people-fill me-1" style={{ color: 'var(--teal-mid)' }} />{alumnosDelCiclo.length} matriculados
                  </span>
                )}
              </div>
              <div className="exam-select-wrap">
                <select value={cicloNotasId} onChange={(e) => setCicloNotasId(e.target.value ? parseInt(e.target.value) : '')}>
                  <option value="">-- Seleccionar ciclo --</option>
                  {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* Lista de exámenes del ciclo */}
            {cicloNotasId && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Examen
                </label>
                {loadingExamenes ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: 'var(--teal-mid)', fontSize: 13 }}>
                    <div className="exam-spinner-sm" style={{ borderColor: 'var(--teal-light)', borderTopColor: 'var(--teal-mid)' }} /> Cargando exámenes...
                  </div>
                ) : examenesLista.length === 0 ? (
                  <div className="calif-empty" style={{ marginBottom: 0 }}>
                    <i className="bi bi-file-earmark-x" />
                    No hay exámenes en este ciclo.
                  </div>
                ) : (
                  <div className="exam-list">
                    {examenesLista.map((ex) => (
                      <div
                        key={ex.id}
                        className={`exam-list-item${selectedExamen?.id === ex.id ? ' selected' : ''}`}
                        onClick={() => setSelectedExamen(ex)}
                      >
                        <div className="exam-list-item-left">
                          <div className="exam-list-item-tipo">{ex.subtipo_examen ?? ex.subtipoExamen ?? ex.tipo_examen ?? ex.tipoExamen} — Examen N° {ex.semana}</div>
                          <div className="exam-list-item-meta">
                            {fmtFecha(ex.fecha)}
                            {(ex.cantidad_preguntas ?? ex.cantidadPreguntas) && <span style={{ marginLeft: 8 }}><i className="bi bi-question-circle me-1" />{ex.cantidad_preguntas ?? ex.cantidadPreguntas} preg.</span>}
                            <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 10 }}>#{ex.id}</span>
                          </div>
                        </div>
                        {(() => {
                          const n = parseInt((ex as any).cantidadNotas ?? '0', 10)
                          return n > 0
                            ? <span className="exam-notas-badge"><i className="bi bi-check-circle-fill" />{n} notas</span>
                            : <span className="exam-notas-badge-none"><i className="bi bi-dash-circle" />Sin notas</span>
                        })()}
                        {selectedExamen?.id === ex.id && (
                          <div className="exam-list-item-check"><i className="bi bi-check-lg" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Examen activo chip */}
            {selectedExamen && (
              <div className="exam-active-chip" style={{ marginBottom: 12 }}>
                <i className="bi bi-bookmark-check-fill" />
                Examen: <strong>{selectedExamen.tipo_examen ?? selectedExamen.tipoExamen}</strong>
                <span style={{ fontWeight: 400, marginLeft: 4, color: 'var(--text-muted)' }}>#{selectedExamen.id}</span>
              </div>
            )}

            {/* Aviso modo actualización */}
            {selectedExamen && parseInt((selectedExamen as any).cantidadNotas ?? '0', 10) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#92400e' }}>
                <i className="bi bi-pencil-square" style={{ fontSize: 14, flexShrink: 0 }} />
                <span>Este examen ya tiene <strong>{(selectedExamen as any).cantidadNotas} notas</strong> registradas. Puedes ingresar los mismos códigos para actualizarlas — no se crearán duplicados.</span>
              </div>
            )}

            {/* Filas de notas manuales */}
            {/* ── Tabs ── */}
            <div className="notas-tabs">
              <button type="button" className={`notas-tab-btn${notasTab === 'manual' ? ' active' : ''}`} onClick={() => setNotasTab('manual')}>
                <i className="bi bi-pencil-square" /> Ingreso manual
              </button>
              <button type="button" className={`notas-tab-btn${notasTab === 'excel' ? ' active' : ''}`} onClick={() => setNotasTab('excel')}>
                <i className="bi bi-file-earmark-excel-fill" style={{ color: '#1d6f42' }} /> Carga por Excel
              </button>
            </div>

            {/* ── Tab: Manual ── */}
            {notasTab === 'manual' && selectedExamen && (
              <form onSubmit={handleRegistrarCalificaciones}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: 0 }}>
                    {examenCursos.length > 0 && usaBuenasMalas
                      ? `Por curso — fórmula: (B×${selectedExamen.puntaje_pregunta_buena ?? 4}) − (M×${selectedExamen.puntaje_pregunta_mala ?? 1})`
                      : usaBuenasMalas
                        ? `Buenas / Malas — fórmula: (B×${selectedExamen.puntaje_pregunta_buena ?? 4}) − (M×${selectedExamen.puntaje_pregunta_mala ?? 1})`
                        : 'Nota directa'}
                  </label>
                  {loadingNotasExamen && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--teal-mid)' }}>
                      <div className="exam-spinner-sm" style={{ borderColor: 'var(--teal-light)', borderTopColor: 'var(--teal-mid)', width: 13, height: 13 }} />
                      Cargando notas...
                    </span>
                  )}
                  {!loadingNotasExamen && alumnosDelCiclo.length > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      <i className="bi bi-people-fill me-1" style={{ color: 'var(--teal-mid)' }} />
                      {califFilas.length} alumno(s)
                    </span>
                  )}
                </div>

                {califFilas.length === 0 ? (
                  <div className="calif-empty">
                    <i className="bi bi-table" />
                    Agrega filas para ingresar notas.
                  </div>
                ) : (
                  (() => {
                    const cursoColW = 130
                    const gridCursos = examenCursos.length > 0 && usaBuenasMalas
                      ? `190px repeat(${examenCursos.length}, ${cursoColW}px) 36px`
                      : undefined
                    return (
                  <div className="calif-scroll-wrap">
                    {/* Cabecera de columnas */}
                    <div className="calif-scroll-header" style={gridCursos ? { gridTemplateColumns: gridCursos } : undefined}>
                      <span>Alumno</span>
                      {examenCursos.length > 0 && usaBuenasMalas
                        ? examenCursos.map(c => (
                            <span key={c.nombre} style={{ textAlign: 'center', fontSize: 10, padding: '0 4px', lineHeight: 1.2 }}>{c.nombre}</span>
                          ))
                        : <span>{usaBuenasMalas ? 'Buenas / Malas' : 'Nota'}</span>
                      }
                      <span />
                    </div>
                    <div className="calif-scroll-body">
                      {califFilas.map((f, i) => {
                        const tieneRegistrada = f.nota !== '' || (f.buenas !== '' && f.malas !== '') ||
                          examenCursos.some(c => f.cursos[c.nombre]?.buenas !== '')
                        return (
                          <div key={i} className={`calif-row${tieneRegistrada ? ' calif-row-existente' : ''}`}
                            style={gridCursos ? { gridTemplateColumns: gridCursos } : undefined}>
                            <div>
                              {f.nombre
                                ? <div className="calif-row-num" style={{ textTransform: 'none', fontSize: 10, color: 'var(--teal-dark)', fontWeight: 700, letterSpacing: 0, marginBottom: 4 }}>{f.nombre}</div>
                                : <div className="calif-row-num">ALUMNO #{i + 1}</div>
                              }
                              <input type="text" placeholder="Código"
                                value={f.codigoAlumno}
                                onChange={(e) => updateFila(i, 'codigoAlumno', e.target.value)} />
                            </div>

                            {examenCursos.length > 0 && usaBuenasMalas ? (
                              examenCursos.map(c => (
                                <div key={c.nombre} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 4px' }}>
                                  <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Buenas</div>
                                    <input type="number" min={0} placeholder="0"
                                      value={f.cursos[c.nombre]?.buenas ?? ''}
                                      onChange={(e) => updateFilaCurso(i, c.nombre, 'buenas', e.target.value)} />
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Malas</div>
                                    <input type="number" min={0} placeholder="0"
                                      value={f.cursos[c.nombre]?.malas ?? ''}
                                      onChange={(e) => updateFilaCurso(i, c.nombre, 'malas', e.target.value)} />
                                  </div>
                                </div>
                              ))
                            ) : usaBuenasMalas ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                <div>
                                  {tieneRegistrada && <div className="nota-reg-label"><i className="bi bi-check-circle-fill" style={{ fontSize: 7 }} />actual</div>}
                                  <div className="calif-row-num" style={{ marginBottom: 2 }}>BUENAS</div>
                                  <input type="number" min={0} placeholder="0"
                                    value={f.buenas}
                                    onChange={(e) => updateFila(i, 'buenas', e.target.value)} />
                                </div>
                                <div>
                                  {tieneRegistrada && <div className="nota-reg-label" style={{ visibility: 'hidden' }}>-</div>}
                                  <div className="calif-row-num" style={{ marginBottom: 2 }}>MALAS</div>
                                  <input type="number" min={0} placeholder="0"
                                    value={f.malas}
                                    onChange={(e) => updateFila(i, 'malas', e.target.value)} />
                                </div>
                              </div>
                            ) : (
                              <div>
                                {tieneRegistrada
                                  ? <div className="nota-reg-label"><i className="bi bi-check-circle-fill" style={{ fontSize: 7 }} />registrada — modifica si es necesario</div>
                                  : <div className="calif-row-num">NOTA</div>
                                }
                                <input type="number" step="0.01" min={0} max={20} placeholder="0.00"
                                  value={f.nota}
                                  onChange={(e) => updateFila(i, 'nota', e.target.value)} />
                                {f.nota && <div style={{ marginTop: 3 }}>{notaBadge(f.nota)}</div>}
                              </div>
                            )}

                            <button type="button" className="btn-remove-fila" onClick={() => removeFila(i)}>
                              <i className="bi bi-trash3-fill" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                    )
                  })()
                )}

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                  <button type="button" className="btn-add-fila" onClick={addFila}>
                    <i className="bi bi-plus-circle" /> Agregar fila
                  </button>
                  {(() => {
                    const filasValidas = califFilas.filter(f =>
                      f.codigoAlumno.trim() && (
                        f.nota !== '' ||
                        (f.buenas !== '' && f.malas !== '') ||
                        (examenCursos.length > 0 && examenCursos.some(c => f.cursos[c.nombre]?.buenas !== ''))
                      )
                    ).length
                    const tieneExistentes = parseInt((selectedExamen as any).cantidadNotas ?? '0', 10) > 0
                    if (filasValidas === 0) return null
                    return (
                      <button type="submit" className="btn-registrar-notas" disabled={registrando}>
                        {registrando
                          ? <><div className="exam-spinner-sm" /> Guardando...</>
                          : tieneExistentes
                            ? <><i className="bi bi-arrow-repeat" /> Actualizar {filasValidas} nota(s)</>
                            : <><i className="bi bi-check2-all" /> Registrar {filasValidas} nota(s)</>}
                      </button>
                    )
                  })()}
                </div>
              </form>
            )}

            {notasTab === 'manual' && !selectedExamen && (
              <div className="exam-no-ciclo" style={{ padding: '24px 20px' }}>
                <i className="bi bi-pencil-square" />
                Selecciona un examen de la lista para ingresar notas.
              </div>
            )}

            {/* ── Tab: Excel ── */}
            {notasTab === 'excel' && (
              <div className="excel-upload-grid">
                {!selectedExamen && (
                  <div className="exam-no-ciclo" style={{ padding: '24px 20px' }}>
                    <i className="bi bi-file-earmark-excel" />
                    Selecciona un examen para cargar notas por Excel.
                  </div>
                )}

                {/* 1 — Plantilla simple */}
                <div className="excel-upload-card plantilla">
                  <i className="bi bi-file-earmark-spreadsheet excel-upload-card-icon" />
                  <div className="excel-upload-card-info">
                    <div className="excel-upload-card-title">Plantilla de notas</div>
                    <div className="excel-upload-card-desc">Descarga la plantilla, completa las notas y vuelve a subir el archivo.</div>
                  </div>
                  <div className="excel-upload-card-actions">
                    <button type="button" className="btn-excel-dl" onClick={descargarPlantilla} disabled={!selectedExamen}>
                      <i className="bi bi-download" /> Descargar
                    </button>
                    <button type="button" className="btn-excel-up" onClick={() => fileInputRef.current?.click()} disabled={!selectedExamen}>
                      <i className="bi bi-upload" /> Subir
                    </button>
                    <input ref={fileInputRef} type="file" accept=".xlsx" style={{ display: 'none' }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) subirNotasExcel(f); e.target.value = '' }} />
                  </div>
                </div>

                {/* 2 — Simulacro OMR */}
                <div className="excel-upload-card simulacro">
                  <i className="bi bi-grid-3x3-gap-fill excel-upload-card-icon" />
                  <div className="excel-upload-card-info">
                    <div className="excel-upload-card-title">Simulacro OMR por Área</div>
                    <div className="excel-upload-card-desc">Excel del lector OMR. El sistema detecta el área automáticamente y guarda los puntajes por curso.</div>
                  </div>
                  <div className="excel-upload-card-actions">
                    <button type="button" className="btn-simulacro-up" onClick={() => fileSimulacroRef.current?.click()} disabled={!selectedExamen || subiendoSimulacro}>
                      {subiendoSimulacro ? <><div className="exam-spinner-sm" />Procesando...</> : <><i className="bi bi-upload" />Subir</>}
                    </button>
                    <input ref={fileSimulacroRef} type="file" accept=".xlsx" style={{ display: 'none' }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) subirSimulacroExcel(f); e.target.value = '' }} />
                  </div>
                  {simulacroResumen && (
                    <div style={{ width: '100%', marginTop: 8 }}>
                      <div className="simulacro-resumen">
                        <div className="simulacro-resumen-row"><span className="simulacro-tag simulacro-tag-area">Área {simulacroResumen.area}</span><span style={{ color: '#166534', fontWeight: 600 }}>{simulacroResumen.procesados} alumno(s)</span></div>
                        {simulacroResumen.noEncontrados.length > 0 && <div className="simulacro-resumen-row"><span className="simulacro-tag simulacro-tag-warn">Sin DNI</span><span style={{ color: '#854d0e' }}>{simulacroResumen.noEncontrados.join(', ')}</span></div>}
                        {simulacroResumen.errores.length > 0 && <div className="simulacro-resumen-row"><span className="simulacro-tag simulacro-tag-err">Errores</span><span style={{ color: '#b91c1c' }}>{simulacroResumen.errores.map(e => e.dni).join(', ')}</span></div>}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3 — Resultados por alumno */}
                <div className="excel-upload-card resultados">
                  <i className="bi bi-bar-chart-fill excel-upload-card-icon" />
                  <div className="excel-upload-card-info">
                    <div className="excel-upload-card-title">Resultados por alumno</div>
                    <div className="excel-upload-card-desc">Excel con hoja <strong>ESTADÍSTICA INDIVIDUAL</strong>. Previsualiza y confirma antes de guardar.</div>
                  </div>
                  <div className="excel-upload-card-actions">
                    <button type="button" style={{ background: '#4f46e5' }} className="btn-simulacro-up"
                      onClick={() => fileResultadosRef.current?.click()}
                      disabled={!selectedExamen || subiendoResultados || !!previewResultados}>
                      {subiendoResultados ? <><div className="exam-spinner-sm" />Leyendo...</> : <><i className="bi bi-upload" />Subir Excel</>}
                    </button>
                    <input ref={fileResultadosRef} type="file" accept=".xlsx" style={{ display: 'none' }}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) cargarPreviewResultados(f); e.target.value = '' }} />
                  </div>
                  {resultadosResumen && !previewResultados && (
                    <div style={{ width: '100%', marginTop: 8 }}>
                      <div className="simulacro-resumen">
                        <div className="simulacro-resumen-row">
                          <span className="simulacro-tag" style={{ background: '#e0e7ff', color: '#3730a3' }}>Guardado</span>
                          <span style={{ color: '#3730a3', fontWeight: 600 }}>{resultadosResumen.procesados} nota(s) registradas</span>
                        </div>
                        {resultadosResumen.errores.length > 0 && (
                          <div className="simulacro-resumen-row">
                            <span className="simulacro-tag simulacro-tag-err">Errores</span>
                            <span style={{ color: '#b91c1c' }}>{resultadosResumen.errores.length} error(es)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview de resultados */}
                {previewResultados && (
                  <div style={{ width: '100%', background: '#f8fafc', border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '16px 18px', marginTop: 4 }}>
                    {(() => {
                      const encontrados = previewResultados.filter(p => p.encontradoEnExcel)
                      const noEncontrados = previewResultados.filter(p => !p.encontradoEnExcel)
                      return (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontWeight: 700, fontSize: 13, color: '#3730a3' }}>
                                <i className="bi bi-eye-fill me-1" />Vista previa
                              </span>
                              <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 8, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>
                                {encontrados.length} encontrados
                              </span>
                              {noEncontrados.length > 0 && (
                                <span style={{ background: '#fef9c3', color: '#854d0e', borderRadius: 8, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>
                                  {noEncontrados.length} sin datos
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="button"
                                style={{ background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 7, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => { setPreviewResultados(null); setResultadosResumen(null) }}>
                                <i className="bi bi-x-lg me-1" />Cancelar
                              </button>
                              <button type="button"
                                style={{ background: confirmandoResultados ? '#818cf8' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 7, padding: '5px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                disabled={confirmandoResultados || encontrados.length === 0}
                                onClick={confirmarResultados}>
                                {confirmandoResultados
                                  ? <><div className="exam-spinner-sm" style={{ borderColor: '#c7d2fe', borderTopColor: '#fff' }} />Guardando...</>
                                  : <><i className="bi bi-check2-all" />Guardar {encontrados.length} nota(s)</>}
                              </button>
                            </div>
                          </div>

                          <div style={{ overflowX: 'auto', maxHeight: 340, overflowY: 'auto', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                              <thead>
                                <tr style={{ background: '#e0e7ff', position: 'sticky', top: 0 }}>
                                  <th style={{ textAlign: 'left', padding: '7px 10px', fontWeight: 700, color: '#3730a3', whiteSpace: 'nowrap' }}>Alumno</th>
                                  <th style={{ textAlign: 'center', padding: '7px 8px', fontWeight: 700, color: '#3730a3' }}>DNI</th>
                                  <th style={{ textAlign: 'center', padding: '7px 8px', fontWeight: 700, color: '#3730a3' }}>Puntaje</th>
                                  <th style={{ textAlign: 'center', padding: '7px 8px', fontWeight: 700, color: '#059669' }}>Aciertos</th>
                                  <th style={{ textAlign: 'center', padding: '7px 8px', fontWeight: 700, color: '#dc2626' }}>Fallos</th>
                                  <th style={{ textAlign: 'center', padding: '7px 8px', fontWeight: 700, color: '#6b7280' }}>Blanco</th>
                                  <th style={{ textAlign: 'center', padding: '7px 8px', fontWeight: 700, color: '#6b7280' }}>Cursos</th>
                                </tr>
                              </thead>
                              <tbody>
                                {previewResultados.map((p, i) => (
                                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: p.encontradoEnExcel ? '#fff' : '#fef2f2' }}>
                                    <td style={{ padding: '6px 10px', fontWeight: 600, color: p.encontradoEnExcel ? '#1e293b' : '#9ca3af' }}>
                                      {p.apellidos} {p.nombres}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '6px 8px', color: '#64748b' }}>{p.dni || p.codigo}</td>
                                    {p.encontradoEnExcel && p.global ? (
                                      <>
                                        <td style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: '#3730a3' }}>{p.global.puntaje?.toFixed(2)}</td>
                                        <td style={{ textAlign: 'center', padding: '6px 8px', color: '#059669', fontWeight: 600 }}>{p.global.aciertos}</td>
                                        <td style={{ textAlign: 'center', padding: '6px 8px', color: '#dc2626', fontWeight: 600 }}>{p.global.fallos}</td>
                                        <td style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7280' }}>{p.global.blanco}</td>
                                        <td style={{ textAlign: 'center', padding: '6px 8px', color: '#6b7280', fontSize: 11 }}>
                                          {p.cursos.length > 0 ? p.cursos.map(c => c.curso).join(', ') : '—'}
                                        </td>
                                      </>
                                    ) : (
                                      <td colSpan={5} style={{ textAlign: 'center', padding: '6px 8px', color: '#f87171', fontSize: 11, fontStyle: 'italic' }}>
                                        No encontrado en el Excel
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Consultar Exámenes del Ciclo ── */}
      <div className="consultar-card">
        <div className="consultar-header">
          <div className="consultar-header-left">
            <span className="consultar-header-icon"><i className="bi bi-trophy-fill" /></span>
            <div>
              <p className="exam-card-title" style={{ margin: 0 }}>Consultar exámenes por ciclo</p>
              <p className="exam-card-desc" style={{ margin: 0 }}>Ver notas, fechas y ranking de exámenes registrados</p>
            </div>
          </div>
          <div className="exam-select-wrap" style={{ minWidth: 200, flex: '0 0 auto' }}>
            <select
              value={consultaCicloId}
              onChange={(e) => handleConsultaCiclo(e.target.value ? parseInt(e.target.value) : '')}
            >
              <option value="">-- Seleccionar ciclo --</option>
              {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
            </select>
          </div>
        </div>

        <div className="consultar-body">
          {!consultaCicloId ? (
            <div className="exam-no-ciclo">
              <i className="bi bi-arrow-up-circle" />
              Selecciona un ciclo para ver sus exámenes
            </div>
          ) : loadingConsulta ? (
            <div className="ranking-loading"><div className="exam-spinner-sm" style={{ borderColor: 'var(--teal-light)', borderTopColor: 'var(--teal-mid)' }} /> Cargando exámenes...</div>
          ) : consultaExamenes.length === 0 ? (
            <div className="exam-no-ciclo">
              <i className="bi bi-file-earmark-x" />
              No hay exámenes registrados en este ciclo.
            </div>
          ) : (
            <div className="consultar-exam-list">
              {consultaExamenes.map((ex) => (
                <div key={ex.id} className="consultar-exam-item">
                  <div>
                    <div className="consultar-exam-tipo">{ex.tipo_examen ?? ex.tipoExamen} — Examen N° {ex.semana}</div>
                    <div className="consultar-exam-meta">
                      <i className="bi bi-calendar-event me-1" />
                      {fmtFecha(ex.fecha)}
                      {(ex.cantidad_preguntas ?? ex.cantidadPreguntas) && (
                        <span style={{ marginLeft: 10 }}>
                          <i className="bi bi-question-circle me-1" />{ex.cantidad_preguntas ?? ex.cantidadPreguntas} preg.
                        </span>
                      )}
                      <span style={{ marginLeft: 10, fontFamily: 'monospace', fontSize: 10 }}>#{ex.id}</span>
                    </div>
                  </div>
                  <button className="btn-ver-ranking" onClick={() => verRanking(ex)}>
                    <i className="bi bi-eye-fill" /> Ver ranking
                  </button>
                  <button
                    className="btn-dl-ranking"
                    onClick={() => descargarRanking(ex.id)}
                    disabled={dlRankingId === ex.id}
                  >
                    <i className="bi bi-file-earmark-excel-fill" />
                    {dlRankingId === ex.id ? '...' : 'Excel'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Ranking inline del examen seleccionado */}
          {loadingRanking && (
            <div className="ranking-loading" style={{ marginTop: 16 }}>
              <div className="exam-spinner-sm" style={{ borderColor: 'var(--teal-light)', borderTopColor: 'var(--teal-mid)' }} />
              Cargando ranking...
            </div>
          )}

          {consultaRanking && !loadingRanking && (
            <div className="ranking-section" style={{ marginTop: 20 }}>
              <div className="ranking-header">
                <div className="ranking-header-left">
                  <div className="ranking-header-icon"><i className="bi bi-trophy-fill" /></div>
                  <div>
                    <p className="ranking-title">
                      {consultaRanking.examen?.tipo_examen ?? consultaRanking.examen?.tipoExamen} — Examen N° {consultaRanking.examen?.semana}
                    </p>
                    <p className="ranking-subtitle">
                      {fmtFecha(consultaRanking.examen?.fecha)} &nbsp;·&nbsp; {consultaRanking.notas.length} alumnos
                    </p>
                  </div>
                </div>
                <button className="ranking-close" onClick={() => setConsultaRanking(null)}><i className="bi bi-x-lg" /></button>
              </div>

              {/* Podium top 3 */}
              {consultaRanking.notas.length >= 2 && (
                <div className="ranking-podium">
                  {consultaRanking.notas[1] && (
                    <div className="podium-item">
                      <div className="podium-medal silver">🥈</div>
                      <div className="podium-code" title={consultaRanking.notas[1].codigo}>{consultaRanking.notas[1].apellidos}</div>
                      <div className="podium-nota silver">{consultaRanking.notas[1].nota}</div>
                      <div className="podium-base silver">2°</div>
                    </div>
                  )}
                  {consultaRanking.notas[0] && (
                    <div className="podium-item">
                      <div className="podium-medal gold">🥇</div>
                      <div className="podium-code" title={consultaRanking.notas[0].codigo}>{consultaRanking.notas[0].apellidos}</div>
                      <div className="podium-nota gold">{consultaRanking.notas[0].nota}</div>
                      <div className="podium-base gold">1°</div>
                    </div>
                  )}
                  {consultaRanking.notas[2] && (
                    <div className="podium-item">
                      <div className="podium-medal bronze">🥉</div>
                      <div className="podium-code" title={consultaRanking.notas[2].codigo}>{consultaRanking.notas[2].apellidos}</div>
                      <div className="podium-nota bronze">{consultaRanking.notas[2].nota}</div>
                      <div className="podium-base bronze">3°</div>
                    </div>
                  )}
                </div>
              )}

              {consultaRanking.notas.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <i className="bi bi-inbox" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                  No hay notas registradas para este examen aún.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ranking-table">
                    <thead>
                      <tr>
                        <th style={{ width: 50 }}>Pos.</th>
                        <th>Alumno</th>
                        <th>Código</th>
                        <th>Nota</th>
                        <th>Distribución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultaRanking.notas.map((r, i) => {
                        const posClass = i === 0 ? 'p1' : i === 1 ? 'p2' : i === 2 ? 'p3' : ''
                        const pct = (r.nota / 20) * 100
                        const barClass = r.nota >= 14 ? 'high' : r.nota >= 11 ? 'mid' : 'low'
                        return (
                          <tr key={i}>
                            <td><span className={`rank-pos ${posClass}`}>{r.puesto}</span></td>
                            <td style={{ fontWeight: 600 }}>{r.apellidos}, {r.nombres}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.codigo}</td>
                            <td>
                              <span className={`nota-badge ${r.nota >= 14 ? 'nota-alta' : r.nota >= 11 ? 'nota-media' : 'nota-baja'}`}>
                                {r.nota}
                              </span>
                            </td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="rank-bar-wrap">
                                <div className={`rank-bar ${barClass}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{pct.toFixed(0)}%</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Ranking visual (tras registrar) ── */}
      {ranking.length > 0 && rankingExamen && (
        <div className="ranking-section">
          <div className="ranking-header">
            <div className="ranking-header-left">
              <div className="ranking-header-icon"><i className="bi bi-trophy-fill" /></div>
              <div>
                <p className="ranking-title">Orden de mérito</p>
                <p className="ranking-subtitle">
                  {rankingExamen.tipo_examen ?? rankingExamen.tipoExamen} — Examen N° {rankingExamen.semana} &nbsp;·&nbsp; {ranking.length} alumnos
                </p>
              </div>
            </div>
            <button className="ranking-close" onClick={() => setRanking([])} title="Cerrar">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Podium for top 3 */}
          {ranking.length >= 2 && (
            <div className="ranking-podium">
              {/* 2nd */}
              {ranking[1] && (
                <div className="podium-item">
                  <div className="podium-medal silver">🥈</div>
                  <div className="podium-code" title={ranking[1].codigoAlumno}>{ranking[1].codigoAlumno}</div>
                  <div className="podium-nota silver">{ranking[1].nota}</div>
                  <div className="podium-base silver">2°</div>
                </div>
              )}
              {/* 1st */}
              {ranking[0] && (
                <div className="podium-item">
                  <div className="podium-medal gold">🥇</div>
                  <div className="podium-code" title={ranking[0].codigoAlumno}>{ranking[0].codigoAlumno}</div>
                  <div className="podium-nota gold">{ranking[0].nota}</div>
                  <div className="podium-base gold">1°</div>
                </div>
              )}
              {/* 3rd */}
              {ranking[2] && (
                <div className="podium-item">
                  <div className="podium-medal bronze">🥉</div>
                  <div className="podium-code" title={ranking[2].codigoAlumno}>{ranking[2].codigoAlumno}</div>
                  <div className="podium-nota bronze">{ranking[2].nota}</div>
                  <div className="podium-base bronze">3°</div>
                </div>
              )}
            </div>
          )}

          {/* Full table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>Pos.</th>
                  <th>Código alumno</th>
                  <th>Nota</th>
                  <th>Distribución</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => {
                  const posClass = i === 0 ? 'p1' : i === 1 ? 'p2' : i === 2 ? 'p3' : ''
                  const pct = ranking[0].nota > 0 ? (r.nota / 20) * 100 : 0
                  const barClass = r.nota >= 14 ? 'high' : r.nota >= 11 ? 'mid' : 'low'
                  return (
                    <tr key={i}>
                      <td><span className={`rank-pos ${posClass}`}>{i + 1}</span></td>
                      <td style={{ fontWeight: 600 }}>{r.codigoAlumno}</td>
                      <td>
                        <span className={`nota-badge ${r.nota >= 14 ? 'nota-alta' : r.nota >= 11 ? 'nota-media' : 'nota-baja'}`}>
                          {r.nota}
                        </span>
                      </td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="rank-bar-wrap">
                          <div className={`rank-bar ${barClass}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
