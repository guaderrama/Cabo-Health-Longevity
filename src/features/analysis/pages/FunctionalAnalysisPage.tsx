import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { Analysis, Report, Patient } from '@/shared/types';
import { ArrowLeft, Activity, FileText, Download } from 'lucide-react';
import BiomarkerCard, { BiomarkerClassification } from '@/features/analysis/components/BiomarkerCard';
import BiomarkerSummary from '@/features/analysis/components/BiomarkerSummary';

export default function FunctionalAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [biomarkers, setBiomarkers] = useState<BiomarkerClassification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (id) {
      loadFunctionalAnalysis();
    }
  }, [id]);

  async function loadFunctionalAnalysis() {
    setLoading(true);
    try {
      // Cargar análisis
      const { data: analysisData } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (analysisData) {
        setAnalysis(analysisData);

        // Cargar reporte
        const { data: reportData } = await supabase
          .from('reports')
          .select('*')
          .eq('analysis_id', analysisData.id)
          .maybeSingle();

        setReport(reportData);

        // Cargar paciente
        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('id', analysisData.patient_id)
          .maybeSingle();

        setPatient(patientData);

        // Cargar biomarcadores REALES de la base de datos
        await loadBiomarkersFromDB();
      }
    } catch (error) {
      console.error('Error cargando análisis funcional:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadBiomarkersFromDB() {
    try {
      // Cargar biomarcadores reales de la base de datos
      const { data, error } = await supabase
        .from('biomarkers')
        .select('*')
        .eq('analysis_id', id)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error cargando biomarcadores:', error);
        setBiomarkers([]);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No hay biomarcadores extraídos para este análisis');
        setBiomarkers([]);
        return;
      }

      // Transformar datos de DB al formato de BiomarkerCard
      const formattedBiomarkers: BiomarkerClassification[] = data.map(b => {
        // Mapear status de DB a classification de UI
        const classificationMap: Record<string, 'OPTIMO' | 'ACEPTABLE' | 'SUBOPTIMO' | 'ANOMALO'> = {
          'optimal': 'OPTIMO',
          'acceptable': 'ACEPTABLE',
          'suboptimal': 'SUBOPTIMO',
          'abnormal': 'ANOMALO'
        };

        // Mapear status a riskLevel
        const riskLevelMap: Record<string, 'low' | 'medium' | 'high'> = {
          'optimal': 'low',
          'acceptable': 'low',
          'suboptimal': 'medium',
          'abnormal': 'high'
        };

        // Determinar posición del valor respecto a rangos óptimos
        const numValue = parseFloat(b.value);
        let position: 'normal' | 'above_optimal' | 'below_optimal' = 'normal';
        if (b.optimal_min != null && b.optimal_max != null) {
          if (numValue < b.optimal_min) position = 'below_optimal';
          else if (numValue > b.optimal_max) position = 'above_optimal';
        }

        // Generar mensaje basado en status
        const statusMessages: Record<string, string> = {
          'optimal': `Valor óptimo según medicina funcional`,
          'acceptable': `Valor aceptable pero fuera del rango óptimo`,
          'suboptimal': `Valor subóptimo. Requiere optimización`,
          'abnormal': `Valor anómalo. Requiere atención médica`
        };

        return {
          biomarker: b.name,
          value: numValue,
          units: b.unit || '',
          classification: classificationMap[b.status] || 'ACEPTABLE',
          riskLevel: riskLevelMap[b.status] || 'low',
          position,
          message: statusMessages[b.status] || 'Valor en revisión',
          ranges: {
            optimal: {
              min: b.optimal_min ?? 0,
              max: b.optimal_max ?? 100
            },
            acceptable: {
              min: b.acceptable_min ?? 0,
              max: b.acceptable_max ?? 100
            },
            conventional: {
              min: b.conventional_min ?? 0,
              max: b.conventional_max ?? 100
            },
          },
          interpretation: b.interpretation || '',
          description: b.description || '',
          category: b.category || 'metabolic',
        };
      });

      setBiomarkers(formattedBiomarkers);
    } catch (error) {
      console.error('Error en loadBiomarkersFromDB:', error);
      setBiomarkers([]);
    }
  }

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'metabolic', label: 'Metabólico' },
    { value: 'lipid', label: 'Lipídico' },
    { value: 'thyroid', label: 'Tiroideo' },
    { value: 'nutritional', label: 'Nutricional' },
    { value: 'hepatic', label: 'Hepático' },
    { value: 'renal', label: 'Renal' },
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Análisis Funcional Completo
            </h1>
            <p className="text-gray-600">Paciente: {patient?.name || 'Desconocido'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="w-12 h-12 text-primary-600" />
          </div>
        </div>

        {/* Total de biomarcadores */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold text-primary-900">Total de Biomarcadores Analizados:</span>
              <span className="ml-2 text-3xl font-bold text-primary-600">{biomarkers.length}</span>
            </div>
            <div className="text-sm text-primary-700">
              Extraídos con IA (Groq - Llama)
            </div>
          </div>
        </div>

        {/* Distribución por clasificación */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-success-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-success-dark">{counts.optimo}</div>
            <div className="text-sm text-success-dark opacity-75">Óptimo</div>
            <div className="text-xs text-success-dark opacity-50 mt-1">
              {biomarkers.length > 0 ? Math.round((counts.optimo / biomarkers.length) * 100) : 0}%
            </div>
          </div>
          <div className="bg-warning-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-warning-dark">{counts.aceptable}</div>
            <div className="text-sm text-warning-dark opacity-75">Aceptable</div>
            <div className="text-xs text-warning-dark opacity-50 mt-1">
              {biomarkers.length > 0 ? Math.round((counts.aceptable / biomarkers.length) * 100) : 0}%
            </div>
          </div>
          <div className="bg-orange-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-800">{counts.suboptimo}</div>
            <div className="text-sm text-orange-800 opacity-75">Subóptimo</div>
            <div className="text-xs text-orange-800 opacity-50 mt-1">
              {biomarkers.length > 0 ? Math.round((counts.suboptimo / biomarkers.length) * 100) : 0}%
            </div>
          </div>
          <div className="bg-danger-light rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-danger-dark">{counts.anomalo}</div>
            <div className="text-sm text-danger-dark opacity-75">Anómalo</div>
            <div className="text-xs text-danger-dark opacity-50 mt-1">
              {biomarkers.length > 0 ? Math.round((counts.anomalo / biomarkers.length) * 100) : 0}%
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Biomarcadores Analizados</h2>
          {filteredBiomarkers.map((biomarker, index) => (
            <BiomarkerCard key={index} data={biomarker} />
          ))}
        </div>

        <div className="space-y-4">
          <BiomarkerSummary reportId={id || ''} />

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Acciones
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/doctor/analysis/${id}`)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Revisar y Aprobar
              </button>
              {analysis?.pdf_url && (
                <a
                  href={analysis.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF Original
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
