import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BiomarkerSummary from '@/components/biomarkers/BiomarkerSummary';

// Mock de Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

// Mock de datos de resumen
const mockSummaryData = [
  {
    category: 'Metabólico',
    total: 5,
    optimo: 3,
    aceptable: 1,
    suboptimo: 1,
    anomalo: 0,
  },
  {
    category: 'Lipídico',
    total: 6,
    optimo: 4,
    aceptable: 2,
    suboptimo: 0,
    anomalo: 0,
  },
  {
    category: 'Tiroideo',
    total: 4,
    optimo: 2,
    aceptable: 1,
    suboptimo: 1,
    anomalo: 0,
  }
];

describe('BiomarkerSummary', () => {
  test('renderiza el estado de carga inicialmente', () => {
    render(<BiomarkerSummary reportId="test-report" />);
    
    expect(screen.getByText('Cargando resumen...')).toBeInTheDocument();
  });

  test('renderiza el título del resumen', async () => {
    render(<BiomarkerSummary reportId="test-report" />);
    
    await waitFor(() => {
      expect(screen.getByText('Resumen por Categoría')).toBeInTheDocument();
    });
  });

  test('muestra estadísticas generales', async () => {
    render(<BiomarkerSummary reportId="test-report" />);
    
    await waitFor(() => {
      expect(screen.getByText('15 biomarcadores analizados')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getTextContent(/^60% Óptimo/)).toBeInTheDocument();
    });
  });

  test('renderiza las categorías con sus estadísticas', async () => {
    render(<BiomarkerSummary reportId="test-report" />);
    
    await waitFor(() => {
      // Verificar categorías
      expect(screen.getByText('Metabólico')).toBeInTheDocument();
      expect(screen.getByText('Lipídico')).toBeInTheDocument();
      expect(screen.getByText('Tiroideo')).toBeInTheDocument();
      
      // Verificar totales
      expect(screen.getByText('Total: 5')).toBeInTheDocument();
      expect(screen.getByText('Total: 6')).toBeInTheDocument();
      expect(screen.getByText('Total: 4')).toBeInTheDocument();
    });
  });

  test('muestra los indicadores de estado por categoría', async () => {
    render(<BiomarkerSummary reportId="test-report" />);
    
    await waitFor(() => {
      // Verificar indicadores para categoría Metabólico
      expect(screen.getByText('Óptimo: 3')).toBeInTheDocument();
      expect(screen.getByText('Aceptable: 1')).toBeInTheDocument();
      expect(screen.getByText('Subóptimo: 1')).toBeInTheDocument();
      expect(screen.getByText('Anómalo: 0')).toBeInTheDocument();
    });
  });

  test('calcula correctamente los porcentajes', async () => {
    render(<BiomarkerSummary reportId="test-report" />);
    
    await waitFor(() => {
      // Para Metabólico: 3/5 = 60% óptimo
      const metSection = screen.getByText('Metabólico').closest('div');
      expect(metSection).toHaveTextContent('60%');
    });
  });

  test('maneja el estado de error', async () => {
    // Mock del error de Supabase
    const mockSupabase = require('@/lib/supabase');
    mockSupabase.supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn(() => Promise.resolve({ 
          data: null, 
          error: { message: 'Error de conexión' } 
        }))
      })
    });

    render(<BiomarkerSummary reportId="test-report" />);
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar el resumen')).toBeInTheDocument();
    });
  });

  test('es responsive', () => {
    render(<BiomarkerSummary reportId="test-report" />);
    
    const grid = screen.getByRole('article');
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-4');
  });

  test('incluye iconos de Lucide React', async () => {
    render(<BiomarkerSummary reportId="test-report" />);
    
    await waitFor(() => {
      // Verificar que los iconos se renderizan
      const activityIcons = document.querySelectorAll('svg');
      expect(activityIcons.length).toBeGreaterThan(0);
    });
  });
});
