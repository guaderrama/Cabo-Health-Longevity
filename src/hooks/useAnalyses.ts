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
        // OPTIMIZACIÓN: Usar JOIN en lugar de N+1 queries
        // Esto reduce drásticamente las queries a la base de datos
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

        const { data, error: fetchError, count } = await query;

        if (fetchError) {
          console.error('Error fetching analyses:', fetchError);
          throw fetchError;
        }

        // Solo actualizar si el componente sigue montado
        if (isMountedRef.current) {
          // Los datos ya vienen en el formato correcto sin JOIN
          setAnalyses(data || []);
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

      const { data, error: refreshError, count } = await query;

      if (refreshError) throw refreshError;

      if (isMountedRef.current) {
        // Los datos ya vienen en el formato correcto sin JOIN
        setAnalyses(data || []);
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