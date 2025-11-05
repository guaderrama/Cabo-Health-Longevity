import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FunctionalAnalysisPage from '@/pages/FunctionalAnalysisPage';
import { AuthProvider } from '@/contexts/AuthContext';


// Mock del contexto de autenticación para doctor
const mockAuth = {
  user: { id: 'doctor-123', email: 'doctor@example.com' },
  userRole: 'doctor',
  userId: 'doctor-123',
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn()
};

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => mockAuth
}));

describe('Proceso de Clasificación de Biomarcadores - Integración', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock del archivo PDF simulado
    const mockFile = new File(['PDF content'], 'reporte-laboratorio.pdf', {
      type: 'application/pdf'
    });

    global.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  test('flujo completo de subida y análisis de PDF', async () => {
    // Mock de respuesta de Edge Function para análisis
    const mockAnalysisResult = {
      biomarkers: [
        {
          id: 'glucose',
          name: 'Glucosa',
          value: 95,
          unit: 'mg/dL',
          status: 'OPTIMO',
          category: 'metabolicos'
        },
        {
          id: 'cholesterol',
          name: 'Colesterol Total',
          value: 220,
          unit: 'mg/dL',
          status: 'SUBOPTIMO',
          category: 'lipidicos'
        },
        {
          id: 'tsh',
          name: 'TSH',
          value: 0.5,
          unit: 'mIU/L',
          status: 'ANOMALO',
          category: 'tiroideos'
        }
      ],
      summary: {
        total: 3,
        optimo: 1,
        aceptable: 0,
        suboptimo: 1,
        anomalo: 1
      }
    };

    const mockSupabase = require('@/lib/supabase');
    
    // Mock de storage para subir archivo
    mockSupabase.supabase.storage.from.mockReturnValue({
      upload: jest.fn(() => Promise.resolve({ 
        data: { path: 'reports/report-123.pdf' }, 
        error: null 
      }))
    });

    // Mock de edge function para análisis
    mockSupabase.supabase.functions.invoke.mockResolvedValueOnce({
      data: mockAnalysisResult,
      error: null
    });

    // Mock de inserción en base de datos
    mockSupabase.supabase.from.mockReturnValue({
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ 
          data: [{ id: 'report-123' }], 
          error: null 
        }))
      }))
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <FunctionalAnalysisPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verificar estado inicial
    expect(screen.getByText('Análisis de Laboratorio')).toBeInTheDocument();
    expect(screen.getByText('Sube tu reporte de laboratorio en PDF')).toBeInTheDocument();

    // Simular subida de archivo
    const fileInput = screen.getByLabelText(/Seleccionar archivo PDF/);
    
    const mockFile = new File(['PDF content'], 'reporte-laboratorio.pdf', {
      type: 'application/pdf'
    });

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false
    });

    fireEvent.change(fileInput);

    // Verificar que se muestra el estado de procesamiento
    await waitFor(() => {
      expect(screen.getByText('Procesando archivo...')).toBeInTheDocument();
    });

    // Verificar que se llama a la edge function
    await waitFor(() => {
      expect(mockSupabase.supabase.functions.invoke).toHaveBeenCalledWith(
        'analyze-laboratory-report',
        expect.objectContaining({
          body: expect.objectContaining({
            action: 'analyze'
          })
        })
      );
    });

    // Verificar resultados del análisis
    await waitFor(() => {
      expect(screen.getByText('Resultados del Análisis')).toBeInTheDocument();
      expect(screen.getByText('Glucosa')).toBeInTheDocument();
      expect(screen.getByText('95 mg/dL')).toBeInTheDocument();
      expect(screen.getByText('ÓPTIMO')).toBeInTheDocument();
    });
  });

  test('maneja errores de análisis correctamente', async () => {
    const mockSupabase = require('@/lib/supabase');
    
    // Mock de error en edge function
    mockSupabase.supabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error al procesar el archivo PDF' }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <FunctionalAnalysisPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/Seleccionar archivo PDF/);
    const mockFile = new File(['Invalid PDF'], 'error.pdf', {
      type: 'application/pdf'
    });

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Error al procesar el archivo/)).toBeInTheDocument();
    });
  });

  test('clasifica biomarcadores correctamente según rangos funcionales', async () => {
    const mockAnalysisResult = {
      biomarkers: [
        {
          id: 'vitamin_d',
          name: 'Vitamina D',
          value: 25, // Rango óptimo: 30-50
          unit: 'ng/mL',
          status: 'SUBOPTIMO',
          category: 'vitaminicos'
        },
        {
          id: 'insulin',
          name: 'Insulina',
          value: 8, // Rango óptimo: 2-5
          unit: 'μIU/mL',
          status: 'ANOMALO',
          category: 'metabolicos'
        },
        {
          id: 'magnesium',
          name: 'Magnesio',
          value: 2.1, // Rango óptimo: 1.8-2.4
          unit: 'mg/dL',
          status: 'OPTIMO',
          category: 'minerales'
        }
      ]
    };

    const mockSupabase = require('@/lib/supabase');
    mockSupabase.supabase.functions.invoke.mockResolvedValueOnce({
      data: mockAnalysisResult,
      error: null
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <FunctionalAnalysisPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/Seleccionar archivo PDF/);
    const mockFile = new File(['PDF content'], 'reporte-vitaminas.pdf', {
      type: 'application/pdf'
    });

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      // Verificar clasificaciones específicas
      expect(screen.getByText('SUBÓPTIMO')).toBeInTheDocument(); // Vitamina D
      expect(screen.getByText('ANÓMALO')).toBeInTheDocument();   // Insulina
      expect(screen.getByText('ÓPTIMO')).toBeInTheDocument();    // Magnesio
    });
  });

  test('genera reporte con recomendaciones personalizadas', async () => {
    const mockAnalysisResult = {
      biomarkers: [
        {
          id: 'homocysteine',
          name: 'Homocisteína',
          value: 15, // Alto
          unit: 'μmol/L',
          status: 'ANOMALO',
          category: 'aminoacidos',
          recommendations: [
            'Aumentar consumo de ácido fólico',
            'Considerar suplementación con B12',
            'Evaluar función renal'
          ]
        }
      ],
      summary: {
        total: 1,
        optimo: 0,
        aceptable: 0,
        suboptimo: 0,
        anomalo: 1
      }
    };

    const mockSupabase = require('@/lib/supabase');
    mockSupabase.supabase.functions.invoke.mockResolvedValueOnce({
      data: mockAnalysisResult,
      error: null
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <FunctionalAnalysisPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/Seleccionar archivo PDF/);
    const mockFile = new File(['PDF content'], 'reporte-homocisteina.pdf', {
      type: 'application/pdf'
    });

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Recomendaciones')).toBeInTheDocument();
      expect(screen.getByText('Aumentar consumo de ácido fólico')).toBeInTheDocument();
      expect(screen.getByText('Considerar suplementación con B12')).toBeInTheDocument();
      expect(screen.getByText('Evaluar función renal')).toBeInTheDocument();
    });
  });

  test('guarda el análisis en la base de datos', async () => {
    const mockAnalysisResult = {
      biomarkers: [
        {
          id: 'glucose',
          name: 'Glucosa',
          value: 95,
          unit: 'mg/dL',
          status: 'OPTIMO',
          category: 'metabolicos'
        }
      ]
    };

    const mockSupabase = require('@/lib/supabase');
    mockSupabase.supabase.functions.invoke.mockResolvedValueOnce({
      data: mockAnalysisResult,
      error: null
    });

    const mockInsert = jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({
        data: [{ id: 'report-456' }],
        error: null
      }))
    }));

    mockSupabase.supabase.from.mockReturnValue({
      insert: mockInsert
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <FunctionalAnalysisPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const fileInput = screen.getByLabelText(/Seleccionar archivo PDF/);
    const mockFile = new File(['PDF content'], 'reporte-guardado.pdf', {
      type: 'application/pdf'
    });

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'doctor-123',
          biomarkers: expect.arrayContaining([
            expect.objectContaining({
              name: 'Glucosa',
              value: 95
            })
          ]),
          status: 'completed'
        })
      );
    });
  });
});
