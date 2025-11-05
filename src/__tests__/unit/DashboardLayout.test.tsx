import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock del contexto de autenticación
const mockUseAuth = {
  user: { id: 'user-123', email: 'doctor@example.com' },
  userRole: 'doctor' as const,
  userId: 'user-123',
  loading: false,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn()
};

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => mockUseAuth
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

describe('DashboardLayout', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    const actualReactRouter = jest.requireActual('react-router-dom');
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  test('renderiza correctamente con usuario doctor', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div data-testid="test-content">Contenido de prueba</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verificar header
    expect(screen.getByText('Cabo Health')).toBeInTheDocument();
    expect(screen.getByText('Panel Médico')).toBeInTheDocument();
    expect(screen.getByText('doctor@example.com')).toBeInTheDocument();
    expect(screen.getByText('doctor')).toBeInTheDocument();
    
    // Verificar iconos
    expect(screen.getByTestId('activity-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
    
    // Verificar contenido
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  test('muestra información correcta para paciente', () => {
    const patientAuth = { ...mockUseAuth, userRole: 'patient' as const };
    
    jest.mock('@/contexts/AuthContext', () => ({
      ...jest.requireActual('@/contexts/AuthContext'),
      useAuth: () => patientAuth
    }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div>Contenido paciente</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Portal del Paciente')).toBeInTheDocument();
    expect(screen.getByText('patient')).toBeInTheDocument();
  });

  test('llama a signOut cuando se hace click en logout', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div>Contenido</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    expect(mockUseAuth.signOut).toHaveBeenCalled();
  });

  test('navega al login después del logout', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div>Contenido</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('muestra indicador de notificación activa', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div>Contenido</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    const notificationButton = screen.getByTestId('notification-button');
    expect(notificationButton).toBeInTheDocument();
    
    // Verificar que tiene el punto indicador
    const indicator = notificationButton.querySelector('.bg-danger');
    expect(indicator).toBeInTheDocument();
  });

  test('tiene la estructura CSS correcta', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div>Contenido</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verificar layout principal
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50');
    
    // Verificar header
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-sm');
  });

  test('es responsive en mobile', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div>Contenido</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verificar que usa las clases responsive correctas
    const headerContainer = screen.getByRole('banner').querySelector('.max-w-7xl');
    expect(headerContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
  });

  test('maneja el estado de loading del usuario', () => {
    const loadingAuth = { ...mockUseAuth, loading: true };
    
    jest.mock('@/contexts/AuthContext', () => ({
      ...jest.requireActual('@/contexts/AuthContext'),
      useAuth: () => loadingAuth
    }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div>Contenido</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    // El layout debe renderizarse incluso durante loading
    expect(screen.getByText('Cabo Health')).toBeInTheDocument();
  });

  test('incluye todos los iconos de Lucide React', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <DashboardLayout>
            <div>Contenido</div>
          </DashboardLayout>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verificar que todos los iconos están presentes
    const activityIcon = document.querySelector('svg[data-icon="activity"]');
    const bellIcon = document.querySelector('svg[data-icon="bell"]');
    const logoutIcon = document.querySelector('svg[data-icon="log-out"]');

    expect(activityIcon).toBeInTheDocument();
    expect(bellIcon).toBeInTheDocument();
    expect(logoutIcon).toBeInTheDocument();
  });
});
