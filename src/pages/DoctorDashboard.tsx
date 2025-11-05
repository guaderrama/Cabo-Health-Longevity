import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalyses } from '@/hooks/useAnalyses';
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sanitizeText } from '@/lib/sanitize';

export default function DoctorDashboard() {
  const { userId } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const navigate = useNavigate();

  // Usar el hook optimizado que hace una sola query con JOIN
  const {
    analyses,
    loading,
    error,
    refresh,
    page,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage,
    hasPreviousPage
  } = useAnalyses({
    userId,
    filter,
    userType: 'doctor',
    pageSize: 10
  });

  function getStatusBadge(status: string) {
    const badges = {
      pending: { color: 'bg-warning text-warning-dark', text: 'Pendiente', icon: Clock },
      processing: { color: 'bg-primary-100 text-primary-700', text: 'Procesando', icon: Clock },
      approved: { color: 'bg-success text-success-dark', text: 'Aprobado', icon: CheckCircle },
      rejected: { color: 'bg-danger text-danger-dark', text: 'Rechazado', icon: AlertCircle },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  }

  function getRiskBadge(riskLevel?: string) {
    if (!riskLevel) return null;
    
    const badges = {
      low: { color: 'bg-success-light text-success-dark', text: 'Bajo' },
      medium: { color: 'bg-warning-light text-warning-dark', text: 'Medio' },
      high: { color: 'bg-danger-light text-danger-dark', text: 'Alto' },
    };
    
    const badge = badges[riskLevel as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Análisis de Pacientes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'approved'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Aprobados
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error al cargar análisis</h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : analyses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay análisis</h3>
          <p className="text-gray-600">
            {filter === 'pending' ? 'No hay análisis pendientes de revisión' : 'No hay análisis para mostrar'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {analysis.patient?.name || 'Paciente Desconocido'}
                    </h3>
                    {getStatusBadge(analysis.status)}
                    {analysis.report?.risk_level && getRiskBadge(analysis.report.risk_level)}
                  </div>
                  <p className="text-sm text-gray-600">{analysis.patient?.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Subido: {new Date(analysis.uploaded_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/doctor/functional/${analysis.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Análisis Funcional
                  </button>
                  <button
                    onClick={() => navigate(`/doctor/analysis/${analysis.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <Eye className="w-4 h-4" />
                    Revisar
                  </button>
                  {analysis.pdf_url && (
                    <a
                      href={analysis.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </a>
                  )}
                </div>
              </div>

              {analysis.pdf_filename && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FileText className="w-4 h-4" />
                  {analysis.pdf_filename}
                </div>
              )}

              {analysis.report?.ai_analysis && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {sanitizeText(analysis.report.ai_analysis).substring(0, 200)}...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={previousPage}
              disabled={!hasPreviousPage}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{page + 1}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={previousPage}
                  disabled={!hasPreviousPage}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Números de página */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i;
                  } else if (page < 2) {
                    pageNumber = i;
                  } else if (page > totalPages - 3) {
                    pageNumber = totalPages - 5 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === pageNumber
                          ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNumber + 1}
                    </button>
                  );
                })}

                <button
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
