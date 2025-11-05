import React from 'react';
import { render, screen } from '@testing-library/react';
import BiomarkerCard from '@/components/biomarkers/BiomarkerCard';

// Mock de datos de biomarcador usando la interfaz correcta
const mockBiomarkerData = {
  biomarker: 'Glucosa',
  value: 95,
  units: 'mg/dL',
  classification: 'OPTIMO' as const,
  riskLevel: 'low' as const,
  position: 'normal' as const,
  message: 'Valores dentro del rango óptimo',
  ranges: {
    optimal: { min: 70, max: 90 },
    acceptable: { min: 90, max: 100 },
    conventional: { min: 100, max: 110 }
  },
  interpretation: 'Glucosa en ayunas',
  description: 'Glucosa en ayunas'
};

describe('BiomarkerCard', () => {
  test('renderiza correctamente con datos del biomarcador', () => {
    render(<BiomarkerCard data={mockBiomarkerData} />);
    
    expect(screen.getByText('Glucosa')).toBeInTheDocument();
    expect(screen.getByText('95 mg/dL')).toBeInTheDocument();
    expect(screen.getByText('ÓPTIMO')).toBeInTheDocument();
    expect(screen.getByText('Glucosa en ayunas')).toBeInTheDocument();
  });

  test('muestra el rango óptimo correctamente', () => {
    render(<BiomarkerCard biomarker={mockBiomarker} />);
    
    const rangeText = screen.getByText(/\(70-90/);
    expect(rangeText).toBeInTheDocument();
  });

  test('aplica la clase CSS correcta según el estado', () => {
    const { container } = render(<BiomarkerCard biomarker={mockBiomarker} />);
    
    // Verificar que tiene la clase de estado óptimo (verde)
    expect(container.firstChild).toHaveClass('bg-green-50', 'border-green-200');
  });

  test('renderiza las recomendaciones si están disponibles', () => {
    render(<BiomarkerCard biomarker={mockBiomarker} />);
    
    expect(screen.getByText('Recomendaciones')).toBeInTheDocument();
    expect(screen.getByText('Mantener dieta equilibrada')).toBeInTheDocument();
    expect(screen.getByText('Ejercicio regular')).toBeInTheDocument();
  });

  test('maneja biomarcadores con valores anómalos', () => {
    const abnormalBiomarker = {
      ...mockBiomarker,
      value: 150,
      status: 'ANOMALO' as const
    };

    render(<BiomarkerCard biomarker={abnormalBiomarker} />);
    
    expect(screen.getByText('ANÓMALO')).toBeInTheDocument();
    expect(screen.getByText('150 mg/dL')).toBeInTheDocument();
  });

  test('es accesible', () => {
    render(<BiomarkerCard biomarker={mockBiomarker} />);
    
    // Verificar que tiene roles ARIA apropiados
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
