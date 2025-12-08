import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { Analysis, Report } from '@/shared/types';
import { ArrowLeft, Download, FileText, AlertCircle, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { useSanitizedHTML } from '@/shared/lib/sanitize';
import BiomarkerCard, { BiomarkerClassification } from '@/features/analysis/components/BiomarkerCard';

export default function PatientReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [biomarkers, setBiomarkers] = useState<BiomarkerClassification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (id) {
      loadReportData();
    }
  }, [id]);

  async function loadReportData() {
    setLoading(true);
    try {
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (analysisError) throw analysisError;
      setAnalysis(analysisData);

      if (analysisData) {
        const { data: reportData } = await supabase
          .from('reports')
          .select('*')
          .eq('analysis_id', analysisData.id)
          .maybeSingle();

        setReport(reportData);

        // Cargar biomarcadores (en producción vendrían del procesamiento del PDF)
        loadBiomarkers();
      }
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      setLoading(false);
    }
  }

  function loadBiomarkers() {
    // Datos de ejemplo - en producción vendrían del análisis del PDF
    const exampleBiomarkers: BiomarkerClassification[] = [
      {
        biomarker: 'Glucosa en Ayunas',
        value: 95,
        units: 'mg/dL',
        classification: 'SUBOPTIMO',
        riskLevel: 'medium',
        position: 'above_optimal',
        message: 'Valor subóptimo. Requiere optimización para alcanzar rango funcional óptimo (75-86 mg/dL)',
        ranges: {
          optimal: { min: 75, max: 86 },
          acceptable: { min: 70, max: 99 },
          conventional: { min: 65, max: 99 },
        },
        interpretation: 'Óptimo: 75-86 mg/dL para prevención metabólica',
        description: 'Marcador clave de metabolismo de glucosa y riesgo de diabetes',
        category: 'metabolic',
      },
      {
        biomarker: 'Insulina en Ayunas',
        value: 4,
        units: 'μIU/mL',
        classification: 'OPTIMO',
        riskLevel: 'low',
        position: 'normal',
        message: 'Valor óptimo según medicina funcional (2-5 μIU/mL)',
        ranges: {
          optimal: { min: 2, max: 5 },
          acceptable: { min: 2, max: 6 },
          conventional: { min: 2, max: 19 },
        },
        interpretation: 'Óptimo: 2-5 μIU/mL indica sensibilidad insulínica óptima',
        description: 'Marcador temprano de resistencia a la insulina',
        category: 'metabolic',
      },
      {
        biomarker: 'Hemoglobina A1c',
        value: 5.4,
        units: '%',
        classification: 'OPTIMO',
        riskLevel: 'low',
        position: 'normal',
        message: 'Valor óptimo para control glucémico a largo plazo',
        ranges: {
          optimal: { min: 4.8, max: 5.4 },
          acceptable: { min: 4.8, max: 5.6 },
          conventional: { min: 4.0, max: 5.7 },
        },
        interpretation: 'Óptimo: <5.4% para prevención de diabetes',
        description: 'Promedio de glucosa en los últimos 3 meses',
        category: 'metabolic',
      },
      {
        biomarker: 'Colesterol Total',
        value: 190,
        units: 'mg/dL',
        classification: 'ACEPTABLE',
        riskLevel: 'low',
        position: 'above_optimal',
        message: 'Valor aceptable pero fuera del rango óptimo. Rango óptimo: 120-180 mg/dL',
        ranges: {
          optimal: { min: 120, max: 180 },
          acceptable: { min: 120, max: 200 },
          conventional: { min: 0, max: 200 },
        },
        interpretation: 'Óptimo: <180 mg/dL para prevención cardiovascular',
        description: 'Marcador de riesgo cardiovascular',
        category: 'lipid',
      },
      {
        biomarker: 'LDL Colesterol',
        value: 65,
        units: 'mg/dL',
        classification: 'OPTIMO',
        riskLevel: 'low',
        position: 'normal',
        message: 'Valor óptimo según medicina funcional (40-70 mg/dL)',
        ranges: {
          optimal: { min: 40, max: 70 },
          acceptable: { min: 40, max: 100 },
          conventional: { min: 0, max: 100 },
        },
        interpretation: 'Óptimo: <70 mg/dL, <55 mg/dL para alto riesgo',
        description: 'Colesterol malo - principal predictor CV',
        category: 'lipid',
      },
      {
        biomarker: 'HDL Colesterol',
        value: 58,
        units: 'mg/dL',
        classification: 'OPTIMO',
        riskLevel: 'low',
        position: 'normal',
        message: 'Valor óptimo según medicina funcional (>55 mg/dL)',
        ranges: {
          optimal: { min: 55, max: 100 },
          acceptable: { min: 40, max: 55 },
          conventional: { min: 40, max: 100 },
        },
        interpretation: 'Óptimo: >55 mg/dL para protección cardiovascular',
        description: 'Colesterol bueno - cardioprotector',
        category: 'lipid',
      },
      {
        biomarker: 'Triglicéridos',
        value: 85,
        units: 'mg/dL',
        classification: 'OPTIMO',
        riskLevel: 'low',
        position: 'normal',
        message: 'Valor óptimo según medicina funcional (<100 mg/dL)',
        ranges: {
          optimal: { min: 40, max: 100 },
          acceptable: { min: 40, max: 150 },
          conventional: { min: 0, max: 150 },
        },
        interpretation: 'Óptimo: <100 mg/dL para salud metabólica',
        description: 'Marcador de metabolismo de grasas',
        category: 'lipid',
      },
      {
        biomarker: 'TSH',
        value: 3.2,
        units: 'mIU/L',
        classification: 'SUBOPTIMO',
        riskLevel: 'medium',
        position: 'above_optimal',
        message: 'Valor subóptimo. Requiere optimización para alcanzar rango funcional óptimo (0.5-2.0 mIU/L)',
        ranges: {
          optimal: { min: 0.5, max: 2.0 },
          acceptable: { min: 0.5, max: 2.5 },
          conventional: { min: 0.4, max: 4.0 },
        },
        interpretation: 'Óptimo: 0.5-2.0 mIU/L, meta terapéutica 1.0-2.0',
        description: 'Regulador principal de función tiroidea',
        category: 'thyroid',
      },
      {
        biomarker: 'T4 Libre',
        value: 1.2,
        units: 'ng/dL',
        classification: 'OPTIMO',
        riskLevel: 'low',
        position: 'normal',
        message: 'Valor óptimo según medicina funcional',
        ranges: {
          optimal: { min: 1.0, max: 1.5 },
          acceptable: { min: 0.8, max: 1.8 },
          conventional: { min: 0.8, max: 1.8 },
        },
        interpretation: 'Óptimo: 1.0-1.5 ng/dL para función tiroidea ideal',
        description: 'Hormona tiroidea activa',
        category: 'thyroid',
      },
      {
        biomarker: 'Vitamina D (25-OH)',
        value: 28,
        units: 'ng/mL',
        classification: 'SUBOPTIMO',
        riskLevel: 'medium',
        position: 'below_optimal',
        message: 'Valor subóptimo. Requiere optimización para alcanzar rango funcional óptimo (36-60 ng/mL)',
        ranges: {
          optimal: { min: 36, max: 60 },
          acceptable: { min: 30, max: 70 },
          conventional: { min: 30, max: 100 },
        },
        interpretation: 'Óptimo: 36-60 ng/mL, ideal 40-50 ng/mL',
        description: 'Vitamina D almacenada - esencial para inmunidad y huesos',
        category: 'nutritional',
      },
      {
        biomarker: 'Vitamina B12',
        value: 650,
        units: 'pg/mL',
        classification: 'OPTIMO',
        riskLevel: 'low',
        position: 'normal',
        message: 'Valor óptimo según medicina funcional (>600 pg/mL)',
        ranges: {
          optimal: { min: 600, max: 1000 },
          acceptable: { min: 400, max: 600 },
          conventional: { min: 200, max: 1000 },
        },
        interpretation: 'Óptimo: >600 pg/mL para función neurológica ideal',
        description: 'Esencial para energía y función neurológica',
        category: 'nutritional',
      },
      {
        biomarker: 'Ferritina',
        value: 75,
        units: 'ng/mL',
        classification: 'OPTIMO',
        riskLevel: 'low',
        position: 'normal',
        message: 'Valor óptimo según medicina funcional',
        ranges: {
          optimal: { min: 50, max: 150 },
          acceptable: { min: 30, max: 200 },
          conventional: { min: 12, max: 300 },
        },
        interpretation: 'Óptimo: 50-150 ng/mL para reservas de hierro adecuadas',
        description: 'Reserva de hierro del cuerpo',
        category: 'nutritional',
      },
    ];

    setBiomarkers(exampleBiomarkers);
  }

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'metabolic', label: 'Metabólico' },
    { value: 'lipid', label: 'Lipídico' },
    { value: 'thyroid', label: 'Tiroideo' },
    { value: 'nutritional', label: 'Nutricional' },
  ];

  const filteredBiomarkers =
    selectedCategory === 'all'
      ? biomarkers
      : biomarkers.filter((b) => b.category === selectedCategory);

  const counts = {
    optimo: biomarkers.filter((b) => b.classification === 'OPTIMO').length,
    aceptable: biomarkers.filter((b) => b.classification === 'ACEPTABLE').length,
    suboptimo: biomarkers.filter((b) => b.classification === 'SUBOPTIMO').length,
    anomalo: biomarkers.filter((b) => b.classification === 'ANOMALO').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analysis || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Reporte no encontrado</p>
      </div>
    );
  }

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low':
        return 'text-success bg-success-light';
      case 'medium':
        return 'text-warning-dark bg-warning-light';
      case 'high':
        return 'text-danger-dark bg-danger-light';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'low':
        return <CheckCircle2 className="w-12 h-12" />;
      case 'medium':
        return <AlertTriangle className="w-12 h-12" />;
      case 'high':
        return <AlertCircle className="w-12 h-12" />;
      default:
        return <FileText className="w-12 h-12" />;
    }
  };

  const getRiskText = (level?: string) => {
    switch (level) {
      case 'low':
        return 'Riesgo Bajo';
      case 'medium':
        return 'Riesgo Moderado';
      case 'high':
        return 'Riesgo Alto';
      default:
        return 'Sin Clasificar';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Mi Portal
      </button>

      {/* Header con título y descarga */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Activity className="w-12 h-12 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Análisis Funcional Completo</h1>
              <p className="text-gray-600">
                Fecha: {new Date(analysis.uploaded_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          {analysis.pdf_url && (
            <a
              href={analysis.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Download className="w-5 h-5" />
              Descargar PDF Original
            </a>
          )}
        </div>

        {/* Indicador de Riesgo compacto */}
        <div className={`rounded-lg p-4 mb-6 ${getRiskColor(report.risk_level)}`}>
          <div className="flex items-center justify-center gap-4">
            {getRiskIcon(report.risk_level)}
            <div>
              <h2 className="text-xl font-bold">
                {getRiskText(report.risk_level)}
              </h2>
              <p className="text-sm opacity-75">
                Según la revisión médica de sus análisis
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de biomarcadores */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-success-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-success-dark">{counts.optimo}</div>
            <div className="text-sm text-success-dark opacity-75">Óptimo</div>
          </div>
          <div className="bg-warning-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-warning-dark">{counts.aceptable}</div>
            <div className="text-sm text-warning-dark opacity-75">Aceptable</div>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-800">{counts.suboptimo}</div>
            <div className="text-sm text-orange-800 opacity-75">Subóptimo</div>
          </div>
          <div className="bg-danger-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-danger-dark">{counts.anomalo}</div>
            <div className="text-sm text-danger-dark opacity-75">Anómalo</div>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === cat.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Biomarcadores */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Biomarcadores Analizados</h2>
          {filteredBiomarkers.map((biomarker, index) => (
            <BiomarkerCard key={index} data={biomarker} />
          ))}
        </div>

        {/* Columna derecha - Notas del doctor y recomendaciones */}
        <div className="space-y-4">
          {/* Notas del Médico */}
          {report.doctor_notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Revisión Médica
              </h3>
              <div className="bg-primary-50 border-l-4 border-primary-600 rounded-lg p-4">
                <div
                  className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm"
                  dangerouslySetInnerHTML={useSanitizedHTML(report.doctor_notes, true)}
                />
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {report.recommendations && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Recomendaciones
              </h3>
              <div className="bg-warning-light border-l-4 border-warning rounded-lg p-4">
                <div
                  className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm"
                  dangerouslySetInnerHTML={useSanitizedHTML(report.recommendations, true)}
                />
              </div>
            </div>
          )}

          {/* Información del análisis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Información
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Estado:</span>
                <span className="text-success font-medium">Revisado y Aprobado</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha de subida:</span>
                <span>{new Date(analysis.uploaded_at).toLocaleDateString('es-ES')}</span>
              </div>
              {analysis.reviewed_at && (
                <div className="flex justify-between">
                  <span>Fecha de revisión:</span>
                  <span>{new Date(analysis.reviewed_at).toLocaleDateString('es-ES')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Nota sobre medicina funcional */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Medicina Funcional</h3>
            <p className="text-sm text-gray-600">
              Los rangos óptimos están basados en medicina funcional, que busca la optimización
              de la salud más allá de la ausencia de enfermedad. Los valores en rango óptimo
              indican funcionamiento metabólico ideal.
            </p>
          </div>
        </div>
      </div>

      {/* Nota Legal */}
      <div className="bg-gray-100 rounded-lg p-4">
        <p className="text-xs text-gray-600 text-center">
          Este reporte ha sido revisado por un profesional médico. Los resultados y recomendaciones
          deben ser discutidos con su médico tratante. No utilice esta información como único
          criterio para decisiones médicas importantes.
        </p>
      </div>
    </div>
  );
}
