import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AnalysisWithReport } from '@/types';

interface UseAnalysesOptions {
  userId?: string | null;
  filter?: 'all' | 'pending' | 'approved' | 'rejected';
  userType?: 'doctor' | 'patient';
  pageSize?: number;
}

export function useAnalyses({
  userId,
  filter = 'all',
  userType = 'patient',
  pageSize = 20
}: UseAnalysesOptions) {
  const [analyses, setAnalyses] = useState<AnalysisWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function fetchAnalyses() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Cargar analyses sin JOINs para evitar problemas de relaciones
        const from = page * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from('analyses')
          .select('*', { count: 'exact' })
          .range(from, to)
          .order('uploaded_at', { ascending: false });

        // Filtros condicionales
        if (userType === 'patient') {
          query = query.eq('patient_id', userId);
        }

        if (filter !== 'all') {
          query = query.eq('status', filter);
        }

        const { data: analysesData, error: fetchError, count } = await query;

        if (fetchError) {
          console.error('Error fetching analyses:', fetchError);
          throw fetchError;
        }

        if (!analysesData || analysesData.length === 0) {
          if (isMountedRef.current) {
            setAnalyses([]);
            setTotalPages(0);
          }
          return;
        }

        // Obtener reports y patients por separado
        const analysisIds = analysesData.map(a => a.id);
        const patientIds = [...new Set(analysesData.map(a => a.patient_id))];

        // Cargar reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('reports')
          .select('*')
          .in('analysis_id', analysisIds);

        if (reportsError) {
          console.error('Error fetching reports:', reportsError);
          throw reportsError;
        }

        // Cargar patients
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, name, email, phone, birth_date, gender')
          .in('id', patientIds);

        if (patientsError) {
          console.error('Error fetching patients:', patientsError);
          throw patientsError;
        }

        // Solo actualizar si el componente sigue montado
        if (isMountedRef.current) {
          // Mapear los datos combinando analyses con sus reports y patients
          const mappedData = analysesData.map(analysis => {
            const report = reportsData?.find(r => r.analysis_id === analysis.id) || null;
            const patient = patientsData?.find(p => p.id === analysis.patient_id) || null;

            return {
              ...analysis,
              report,
              patient,
            };
          });

          setAnalyses(mappedData);
          setTotalPages(Math.ceil((count || 0) / pageSize));
        }
      } catch (err) {
        console.error('Error loading analyses:', err);
        if (isMountedRef.current) {
          setError(err as Error);
          setAnalyses([]);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }

    fetchAnalyses();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [userId, filter, userType, page, pageSize]);

  const refresh = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('analyses')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('uploaded_at', { ascending: false });

      if (userType === 'patient') {
        query = query.eq('patient_id', userId);
      }

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: analysesData, error: refreshError, count } = await query;

      if (refreshError) throw refreshError;

      if (!analysesData || analysesData.length === 0) {
        if (isMountedRef.current) {
          setAnalyses([]);
          setTotalPages(0);
        }
        return;
      }

      // Obtener reports y patients por separado
      const analysisIds = analysesData.map(a => a.id);
      const patientIds = [...new Set(analysesData.map(a => a.patient_id))];

      // Cargar reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .in('analysis_id', analysisIds);

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        throw reportsError;
      }

      // Cargar patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, name, email, phone, birth_date, gender')
        .in('id', patientIds);

      if (patientsError) {
        console.error('Error fetching patients:', patientsError);
        throw patientsError;
      }

      if (isMountedRef.current) {
        // Mapear los datos combinando analyses con sus reports y patients
        const mappedData = analysesData.map(analysis => {
          const report = reportsData?.find(r => r.analysis_id === analysis.id) || null;
          const patient = patientsData?.find(p => p.id === analysis.patient_id) || null;

          return {
            ...analysis,
            report,
            patient,
          };
        });

        setAnalyses(mappedData);
        setTotalPages(Math.ceil((count || 0) / pageSize));
      }
    } catch (err) {
      console.error('Error refreshing analyses:', err);
      if (isMountedRef.current) {
        setError(err as Error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const nextPage = () => {
    if (page < totalPages - 1) {
      setPage(p => p + 1);
    }
  };

  const previousPage = () => {
    if (page > 0) {
      setPage(p => p - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return {
    analyses,
    loading,
    error,
    refresh,
    page,
    totalPages,
    nextPage,
    previousPage,
    goToPage,
    hasNextPage: page < totalPages - 1,
    hasPreviousPage: page > 0
  };
}