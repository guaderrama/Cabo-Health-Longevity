import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { Analysis, Report, Patient, AppError } from '@/shared/types';
import { toast } from '@/shared/lib/toast';
import { ArrowLeft, Check, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Biomarker {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'optimal' | 'acceptable' | 'suboptimal' | 'abnormal';
  category: string;
  optimal_min?: number;
  optimal_max?: number;
}

export default function AnalysisReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const [doctorNotes, setDoctorNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (id) {
      loadAnalysisData();
    }
  }, [id]);

  async function loadAnalysisData() {
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

        if (reportData) {
          setReport(reportData);
          setDoctorNotes(reportData.doctor_notes || '');
          setRecommendations(reportData.recommendations || '');
          setRiskLevel(reportData.risk_level as 'low' | 'medium' | 'high' || 'medium');
        }

        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('id', analysisData.patient_id)
          .maybeSingle();

        setPatient(patientData);

        // Cargar biomarcadores
        const { data: biomarkersData } = await supabase
          .from('biomarkers')
          .select('*')
          .eq('analysis_id', analysisData.id)
          .order('category', { ascending: true });

        if (biomarkersData) {
          setBiomarkers(biomarkersData);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }

  function generatePdfReport() {
    if (!patient || !analysis || biomarkers.length === 0) {
      toast.error('Error', 'No hay datos suficientes para generar el PDF');
      return;
    }

    setGeneratingPdf(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 102, 153);
      doc.text('Cabo Health & Longevity', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text('Reporte de Analisis Funcional', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Patient info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Paciente: ${patient.name}`, 20, yPos);
      yPos += 7;
      doc.text(`Email: ${patient.email || 'N/A'}`, 20, yPos);
      yPos += 7;
      doc.text(`Fecha: ${new Date(analysis.uploaded_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })}`, 20, yPos);
      yPos += 15;

      // Summary counts
      const counts = {
        optimal: biomarkers.filter(b => b.status === 'optimal').length,
        acceptable: biomarkers.filter(b => b.status === 'acceptable').length,
        suboptimal: biomarkers.filter(b => b.status === 'suboptimal').length,
        abnormal: biomarkers.filter(b => b.status === 'abnormal').length,
      };

      doc.setFontSize(14);
      doc.setTextColor(0, 102, 153);
      doc.text('Resumen de Resultados', 20, yPos);
      yPos += 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de biomarcadores: ${biomarkers.length}`, 20, yPos);
      yPos += 6;
      doc.setTextColor(34, 139, 34);
      doc.text(`Optimo: ${counts.optimal} (${Math.round((counts.optimal / biomarkers.length) * 100)}%)`, 20, yPos);
      yPos += 6;
      doc.setTextColor(255, 165, 0);
      doc.text(`Aceptable: ${counts.acceptable} (${Math.round((counts.acceptable / biomarkers.length) * 100)}%)`, 20, yPos);
      yPos += 6;
      doc.setTextColor(255, 140, 0);
      doc.text(`Suboptimo: ${counts.suboptimal} (${Math.round((counts.suboptimal / biomarkers.length) * 100)}%)`, 20, yPos);
      yPos += 6;
      doc.setTextColor(220, 20, 60);
      doc.text(`Anomalo: ${counts.abnormal} (${Math.round((counts.abnormal / biomarkers.length) * 100)}%)`, 20, yPos);
      yPos += 15;

      // Biomarkers list
      doc.setTextColor(0, 102, 153);
      doc.setFontSize(14);
      doc.text('Detalle de Biomarcadores', 20, yPos);
      yPos += 10;

      const statusColors: Record<string, [number, number, number]> = {
        optimal: [34, 139, 34],
        acceptable: [255, 165, 0],
        suboptimal: [255, 140, 0],
        abnormal: [220, 20, 60],
      };

      const statusLabels: Record<string, string> = {
        optimal: 'Optimo',
        acceptable: 'Aceptable',
        suboptimal: 'Suboptimo',
        abnormal: 'Anomalo',
      };

      doc.setFontSize(10);

      biomarkers.forEach((b, index) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const color = statusColors[b.status] || [0, 0, 0];
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${b.name}`, 20, yPos);

        doc.setTextColor(...color);
        const valueText = `${b.value} ${b.unit || ''} - ${statusLabels[b.status] || b.status}`;
        doc.text(valueText, 120, yPos);

        yPos += 6;

        if (b.optimal_min != null && b.optimal_max != null) {
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.text(`Rango optimo: ${b.optimal_min} - ${b.optimal_max} ${b.unit || ''}`, 25, yPos);
          doc.setFontSize(10);
          yPos += 5;
        }
      });

      // Doctor notes if available
      if (doctorNotes) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        yPos += 10;
        doc.setTextColor(0, 102, 153);
        doc.setFontSize(14);
        doc.text('Notas del Medico', 20, yPos);
        yPos += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const notesLines = doc.splitTextToSize(doctorNotes, pageWidth - 40);
        doc.text(notesLines, 20, yPos);
        yPos += notesLines.length * 5 + 10;
      }

      // Recommendations if available
      if (recommendations) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        doc.setTextColor(0, 102, 153);
        doc.setFontSize(14);
        doc.text('Recomendaciones', 20, yPos);
        yPos += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        const recLines = doc.splitTextToSize(recommendations, pageWidth - 40);
        doc.text(recLines, 20, yPos);
      }

      // Footer
      const pageCount = doc.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Cabo Health & Longevity - Pagina ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `analisis_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF Generado', `Archivo ${fileName} descargado`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error', 'No se pudo generar el PDF');
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleApprove() {
    if (!report) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          reportId: report.id,
          doctorNotes,
          recommendations,
          riskLevel,
        },
      });

      if (error) throw error;

      toast.success('Análisis aprobado', 'El reporte ha sido enviado al paciente');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error aprobando análisis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Por favor intente nuevamente';
      toast.error('Error al aprobar análisis', errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

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
        <p className="text-gray-600">Análisis no encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Revisión de Análisis</h1>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Paciente</h3>
            <p className="text-lg font-semibold">{patient?.name || 'Desconocido'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Subida</h3>
            <p className="text-lg">
              {new Date(analysis.uploaded_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
            <p className="text-lg">{patient?.email || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Archivo</h3>
            <a
              href={analysis.pdf_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {analysis.pdf_filename}
            </a>
          </div>
        </div>

        <div className="border-t pt-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Análisis de IA</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 whitespace-pre-wrap">
              {report.ai_analysis || 'Análisis no disponible'}
            </p>
            {report.model_used && (
              <p className="text-sm text-gray-500 mt-4">
                Modelo utilizado: {report.model_used}
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Revisión Médica</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Riesgo
              </label>
              <div className="flex gap-4">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRiskLevel(level)}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      riskLevel === level
                        ? level === 'low'
                          ? 'bg-success text-white'
                          : level === 'medium'
                          ? 'bg-warning text-white'
                          : 'bg-danger text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {level === 'low' ? 'Bajo' : level === 'medium' ? 'Medio' : 'Alto'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas del Médico
              </label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Agregue sus observaciones y comentarios profesionales..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recomendaciones
              </label>
              <textarea
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Indique las recomendaciones médicas, dieta, estilo de vida, pruebas de seguimiento..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={generatePdfReport}
            disabled={generatingPdf || biomarkers.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {generatingPdf ? 'Generando...' : 'Descargar PDF'}
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting || !doctorNotes || !recommendations}
            className="flex items-center gap-2 px-6 py-3 bg-success text-white rounded-lg hover:bg-success-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            {submitting ? 'Aprobando...' : 'Aprobar y Enviar al Paciente'}
          </button>
        </div>
      </div>
    </div>
  );
}
