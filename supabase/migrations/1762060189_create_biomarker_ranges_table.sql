-- Migration: create_biomarker_ranges_table
-- Created at: 1762060189

-- Crear tabla para rangos de biomarcadores funcionales
CREATE TABLE biomarker_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  biomarker_code TEXT UNIQUE NOT NULL,
  biomarker_name TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Rangos funcionales óptimos
  optimal_min NUMERIC,
  optimal_max NUMERIC,
  
  -- Rangos funcionales aceptables
  acceptable_min NUMERIC,
  acceptable_max NUMERIC,
  
  -- Rangos convencionales
  conventional_min NUMERIC,
  conventional_max NUMERIC,
  
  -- Unidades y especificaciones
  units TEXT NOT NULL,
  gender_specific BOOLEAN DEFAULT false,
  gender TEXT,
  
  -- Información adicional
  description TEXT,
  interpretation_guide TEXT,
  clinical_significance TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_biomarker_code ON biomarker_ranges(biomarker_code);
CREATE INDEX idx_biomarker_category ON biomarker_ranges(category);
CREATE INDEX idx_biomarker_gender ON biomarker_ranges(gender);

-- Habilitar RLS
ALTER TABLE biomarker_ranges ENABLE ROW LEVEL SECURITY;

-- Políticas: Médicos y pacientes pueden leer, solo service_role puede modificar
CREATE POLICY "Allow read access for authenticated users" ON biomarker_ranges
  FOR SELECT USING (true);

CREATE POLICY "Allow insert via edge function" ON biomarker_ranges
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow update via edge function" ON biomarker_ranges
  FOR UPDATE USING (auth.role() = 'service_role');;