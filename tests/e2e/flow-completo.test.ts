import { test, expect } from '@playwright/test';

// Test E2E del flujo completo de un doctor analizando un reporte de laboratorio
test.describe('Flujo Completo de Análisis Médico', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar mocks de Supabase
    await page.addInitScript(() => {
      // Mock de Supabase para testing
      window.supabase = {
        auth: {
          getUser: () => Promise.resolve({
            data: { 
              user: { 
                id: 'doctor-123', 
                email: 'doctor@test.com' 
              } 
            },
            error: null
          }),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } }
          }),
          signOut: () => Promise.resolve({ error: null })
        },
        from: () => ({
          select: () => ({
            eq: () => Promise.resolve({
              data: [{ 
                id: 'doctor-123', 
                role: 'doctor', 
                email: 'doctor@test.com',
                full_name: 'Dr. Juan Pérez'
              }],
              error: null
            })
          }),
          insert: () => ({
            select: () => Promise.resolve({
              data: [{ id: 'report-123' }],
              error: null
            })
          })
        }),
        functions: {
          invoke: (functionName: string, options: any) => {
            if (functionName === 'analyze-laboratory-report') {
              // Simular respuesta de análisis
              return Promise.resolve({
                data: {
                  biomarkers: [
                    {
                      id: 'glucose',
                      name: 'Glucosa',
                      value: 95,
                      unit: 'mg/dL',
                      status: 'OPTIMO',
                      category: 'metabolicos',
                      recommendations: ['Mantener dieta equilibrada']
                    },
                    {
                      id: 'cholesterol',
                      name: 'Colesterol Total',
                      value: 220,
                      unit: 'mg/dL',
                      status: 'SUBOPTIMO',
                      category: 'lipidicos',
                      recommendations: ['Reducir grasas saturadas']
                    }
                  ],
                  summary: {
                    total: 2,
                    optimo: 1,
                    aceptable: 0,
                    suboptimo: 1,
                    anomalo: 0
                  }
                },
                error: null
              });
            }
            return Promise.resolve({ data: null, error: null });
          }
        },
        storage: {
          from: () => ({
            upload: () => Promise.resolve({
              data: { path: 'reports/test-report.pdf' },
              error: null
            })
          })
        }
      };
    });
  });

  test('doctor completa flujo de análisis de reporte', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('http://localhost:5173');

    // Verificar que estamos en la página de login
    await expect(page.locator('h1')).toContainText('Iniciar Sesión');

    // Completar login
    await page.fill('[data-testid="email-input"]', 'doctor@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Verificar redirección al dashboard
    await expect(page.locator('h1')).toContainText('Cabo Health');
    await expect(page.locator('text=Panel Médico')).toBeVisible();

    // Navegar a análisis funcional
    await page.click('[data-testid="navigation-analisis"]');

    // Verificar página de análisis
    await expect(page.locator('h1')).toContainText('Análisis de Laboratorio');
    await expect(page.locator('text=Sube tu reporte de laboratorio')).toBeVisible();

    // Simular subida de archivo PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'reporte-laboratorio.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF mock content')
    });

    // Verificar estado de procesamiento
    await expect(page.locator('text=Procesando archivo')).toBeVisible();

    // Esperar resultados del análisis
    await expect(page.locator('text=Resultados del Análisis')).toBeVisible();

    // Verificar que se muestran los biomarcadores
    await expect(page.locator('text=Glucosa')).toBeVisible();
    await expect(page.locator('text=95 mg/dL')).toBeVisible();
    await expect(page.locator('text=ÓPTIMO')).toBeVisible();
    
    await expect(page.locator('text=Colesterol Total')).toBeVisible();
    await expect(page.locator('text=220 mg/dL')).toBeVisible();
    await expect(page.locator('text=SUBÓPTIMO')).toBeVisible();

    // Verificar resumen
    await expect(page.locator('text=2 biomarcadores analizados')).toBeVisible();
    await expect(page.locator('text=50%')).toContainText('50%');

    // Verificar recomendaciones
    await expect(page.locator('text=Recomendaciones')).toBeVisible();
    await expect(page.locator('text=Mantener dieta equilibrada')).toBeVisible();
    await expect(page.locator('text=Reducir grasas saturadas')).toBeVisible();

    // Navegar al dashboard para ver análisis pendientes
    await page.click('[data-testid="navigation-dashboard"]');

    // Verificar que el análisis se guardó
    await expect(page.locator('text=Reportes Pendientes')).toBeVisible();
    await expect(page.locator('text=1 reporte nuevo')).toBeVisible();
  });

  test('paciente ve sus resultados de análisis', async ({ page }) => {
    // Mock de usuario paciente
    await page.addInitScript(() => {
      window.supabase = {
        auth: {
          getUser: () => Promise.resolve({
            data: { 
              user: { 
                id: 'patient-123', 
                email: 'paciente@test.com' 
              } 
            },
            error: null
          }),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } }
          }),
          signOut: () => Promise.resolve({ error: null })
        },
        from: () => ({
          select: () => ({
            eq: () => Promise.resolve({
              data: [{ 
                id: 'patient-123', 
                role: 'patient', 
                email: 'paciente@test.com',
                full_name: 'María González'
              }],
              error: null
            })
          })
        })
      };
    });

    await page.goto('http://localhost:5173');

    // Login como paciente
    await page.fill('[data-testid="email-input"]', 'paciente@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Verificar dashboard de paciente
    await expect(page.locator('text=Portal del Paciente')).toBeVisible();
    await expect(page.locator('text=Mis Resultados')).toBeVisible();

    // Verificar resultados de análisis
    await expect(page.locator('text=Reporte más reciente')).toBeVisible();
    
    // Verificar biomarcadores específicos del paciente
    await expect(page.locator('text=Glucosa')).toBeVisible();
    await expect(page.locator('text=95 mg/dL')).toBeVisible();
    
    // Verificar que ve recomendaciones
    await expect(page.locator('text=Recomendaciones para ti')).toBeVisible();
    await expect(page.locator('text=Continúa con tu plan actual')).toBeVisible();
  });

  test('doctor puede revisar y aprobar análisis pendientes', async ({ page }) => {
    // Mock de análisis pendiente
    await page.addInitScript(() => {
      window.supabase = {
        auth: {
          getUser: () => Promise.resolve({
            data: { 
              user: { 
                id: 'doctor-123', 
                email: 'doctor@test.com' 
              } 
            },
            error: null
          }),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } }
          }),
          signOut: () => Promise.resolve({ error: null })
        },
        from: (table: string) => ({
          select: () => ({
            eq: () => Promise.resolve({
              data: table === 'reports' ? [{
                id: 'report-pending',
                user_id: 'patient-123',
                status: 'pending',
                biomarkers: [{
                  id: 'glucose',
                  name: 'Glucosa',
                  value: 95,
                  status: 'OPTIMO'
                }],
                created_at: '2025-11-03T09:00:00Z'
              }] : [{
                id: 'doctor-123',
                role: 'doctor',
                email: 'doctor@test.com'
              }],
              error: null
            })
          }),
          update: () => ({
            eq: () => Promise.resolve({
              data: [{ id: 'report-pending', status: 'approved' }],
              error: null
            })
          })
        }),
        functions: {
          invoke: () => Promise.resolve({
            data: null,
            error: null
          })
        }
      };
    });

    await page.goto('http://localhost:5173');

    // Login como doctor
    await page.fill('[data-testid="email-input"]', 'doctor@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Ir al dashboard
    await expect(page.locator('text=Panel Médico')).toBeVisible();
    await expect(page.locator('text=1 reporte nuevo')).toBeVisible();

    // Hacer click en revisar análisis
    await page.click('[data-testid="review-analysis-button"]');

    // Verificar página de revisión
    await expect(page.locator('text=Revisión de Análisis')).toBeVisible();
    await expect(page.locator('text=Glucosa')).toBeVisible();
    await expect(page.locator('text=95 mg/dL')).toBeVisible();

    // Aprobar análisis
    await page.click('[data-testid="approve-analysis-button"]');

    // Verificar confirmación
    await expect(page.locator('text=Análisis aprobado exitosamente')).toBeVisible();

    // Regresar al dashboard y verificar que se actualizó
    await page.click('[data-testid="back-to-dashboard"]');
    await expect(page.locator('text=0 reportes pendientes')).toBeVisible();
  });

  test('maneja errores de red correctamente', async ({ page }) => {
    // Mock de error de red
    await page.addInitScript(() => {
      window.supabase = {
        auth: {
          getUser: () => Promise.resolve({
            data: { user: null },
            error: null
          }),
          onAuthStateChange: () => ({
            data: { subscription: { unsubscribe: () => {} } }
          })
        }
      };
    });

    await page.goto('http://localhost:5173');

    // Intentar login con credenciales incorrectas
    await page.fill('[data-testid="email-input"]', 'invalid@test.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Verificar mensaje de error
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible();
    
    // Verificar que permanece en página de login
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
  });

  test('es responsive en móvil', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5173');

    // Verificar que el layout se adapta
    await expect(page.locator('text=Cabo Health')).toBeVisible();
    
    // Verificar navegación móvil
    const mobileMenu = page.locator('[data-testid="mobile-menu-button"]');
    await expect(mobileMenu).toBeVisible();

    // Abrir menú móvil
    await mobileMenu.click();
    
    // Verificar opciones de navegación
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Análisis')).toBeVisible();
  });
});
