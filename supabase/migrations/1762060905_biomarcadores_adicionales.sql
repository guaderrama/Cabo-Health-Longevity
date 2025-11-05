-- Migration: biomarcadores_adicionales
-- Created at: 1762060905

-- ============================================
-- COMPLETAR BIOMARCADORES DE MEDICINA FUNCIONAL
-- Agregando biomarcadores faltantes prioritarios
-- ============================================

-- 1. RATIOS TIROIDEOS CALCULADOS
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('Ratio FT3:RT3', 'thyroid', 20, 30, 15, 20, 10, 25, 'ratio', false, 'IFM, Rupa Health - Conversión óptima tiroidea'),
('Ratio RT3:FT3', 'thyroid', 0, 0.1, 0.1, 0.15, 0.15, 0.2, 'ratio', false, 'IFM, Functional Medicine - Evaluación conversión T4 a T3');

-- 2. HORMONAS SUPRARRENALES Y SEXUALES (Prioridad alta)
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('Cortisol AM (8 AM)', 'hormonal', 10, 18, 6, 23, 5, 25, 'μg/dL', false, 'IFM, OptimalDX - Ritmo circadiano óptimo'),
('Cortisol PM (4 PM)', 'hormonal', 3, 8, 2, 10, 2, 12, 'μg/dL', false, 'IFM, OptimalDX - Ritmo circadiano óptimo'),
('DHEA-S (Hombres)', 'hormonal', 350, 500, 280, 640, 180, 1250, 'μg/dL', true, 'IFM, Mayo Clinic - Salud suprarrenal'),
('DHEA-S (Mujeres)', 'hormonal', 200, 380, 140, 450, 65, 380, 'μg/dL', true, 'IFM, Mayo Clinic - Salud suprarrenal'),
('Testosterona Total (Hombres)', 'hormonal', 500, 900, 350, 1100, 264, 916, 'ng/dL', true, 'IFM, Endocrine Society - Salud masculina'),
('Testosterona Total (Mujeres)', 'hormonal', 30, 70, 15, 80, 8, 60, 'ng/dL', true, 'IFM, Endocrine Society - Salud femenina'),
('Testosterona Libre (Hombres)', 'hormonal', 9, 26, 5, 30, 4.5, 25, 'pg/mL', true, 'IFM, OptimalDX - Testosterona bioactiva'),
('Testosterona Libre (Mujeres)', 'hormonal', 0.5, 2.5, 0.3, 3.5, 0.2, 5, 'pg/mL', true, 'IFM, OptimalDX - Testosterona bioactiva'),
('Estradiol (Mujeres Premenopáusicas)', 'hormonal', 50, 250, 30, 400, 15, 350, 'pg/mL', true, 'IFM, ACOG - Fase folicular'),
('Estradiol (Mujeres Posmenopáusicas)', 'hormonal', 10, 30, 5, 50, 0, 54, 'pg/mL', true, 'IFM, ACOG - Posmenopausia'),
('Estradiol (Hombres)', 'hormonal', 10, 40, 8, 42, 7.6, 42.6, 'pg/mL', true, 'IFM, Endocrine Society'),
('Progesterona (Mujeres Fase Lútea)', 'hormonal', 5, 20, 2, 25, 1.7, 27, 'ng/mL', true, 'IFM, ACOG - Fase lútea'),
('Progesterona (Mujeres Fase Folicular)', 'hormonal', 0.1, 1.5, 0.1, 3, 0.1, 1.5, 'ng/mL', true, 'IFM, ACOG - Fase folicular'),
('Prolactina', 'hormonal', 2, 15, 2, 20, 4, 23, 'ng/mL', false, 'IFM, Mayo Clinic - Regulación hormonal'),
('IGF-1 (20-30 años)', 'hormonal', 200, 350, 115, 400, 115, 358, 'ng/mL', false, 'IFM, Mayo Clinic - Hormona de crecimiento'),
('IGF-1 (30-40 años)', 'hormonal', 150, 280, 100, 350, 115, 307, 'ng/mL', false, 'IFM, Mayo Clinic - Hormona de crecimiento'),
('IGF-1 (40-50 años)', 'hormonal', 120, 250, 90, 300, 101, 267, 'ng/mL', false, 'IFM, Mayo Clinic - Hormona de crecimiento');

-- 3. MARCADORES CARDIOVASCULARES AVANZADOS (Prioridad alta)
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('Lipoproteína(a) [Lp(a)]', 'cardiovascular', 0, 30, 30, 50, 0, 75, 'mg/dL', false, 'ESC, AHA - Riesgo cardiovascular genético'),
('Partículas LDL (LDL-P)', 'cardiovascular', 0, 1000, 1000, 1300, 0, 2000, 'nmol/L', false, 'NLA, Cleveland Clinic - Número partículas'),
('Fibrinógeno', 'cardiovascular', 200, 300, 300, 400, 200, 450, 'mg/dL', false, 'AHA, ESC - Coagulación y riesgo CV'),
('NT-proBNP', 'cardiovascular', 0, 125, 125, 300, 0, 450, 'pg/mL', false, 'AHA, ESC - Función cardíaca');

-- 4. VITAMINAS ADICIONALES (Prioridad media-alta)
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('Vitamina A (Retinol)', 'nutritional', 50, 80, 38, 98, 30, 120, 'μg/dL', false, 'NIH/ODS, IFM - Salud visual e inmune'),
('Vitamina E (Tocoferol)', 'nutritional', 12, 20, 5.5, 20, 5.5, 17, 'mg/L', false, 'NIH/ODS, IFM - Antioxidante liposoluble'),
('Vitamina K', 'nutritional', 0.4, 3.2, 0.2, 3.2, 0.13, 1.19, 'ng/mL', false, 'NIH/ODS, IFM - Coagulación y huesos'),
('Vitamina B1 (Tiamina)', 'nutritional', 70, 180, 66, 200, 66.5, 200, 'nmol/L', false, 'NIH/ODS - Metabolismo energético'),
('Vitamina B6 (Piridoxina)', 'nutritional', 30, 100, 20, 125, 20, 125, 'nmol/L', false, 'NIH/ODS - Metabolismo proteínas'),
('Vitamina C (Ácido Ascórbico)', 'nutritional', 1.0, 2.0, 0.6, 2.0, 0.4, 2.0, 'mg/dL', false, 'NIH/ODS, IFM - Antioxidante');

-- 5. MINERALES Y OLIGOELEMENTOS ADICIONALES
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('Sodio', 'electrolytes', 138, 142, 136, 145, 136, 145, 'mmol/L', false, 'IFM, Mayo Clinic - Equilibrio electrolítico'),
('Potasio', 'electrolytes', 4.0, 4.5, 3.5, 5.0, 3.5, 5.0, 'mmol/L', false, 'IFM, Mayo Clinic - Función cardíaca'),
('Calcio', 'electrolytes', 9.6, 10.2, 8.5, 10.5, 8.5, 10.5, 'mg/dL', false, 'IFM, Mayo Clinic - Salud ósea'),
('Calcio Iónico', 'electrolytes', 4.8, 5.2, 4.6, 5.4, 4.6, 5.4, 'mg/dL', false, 'IFM - Calcio bioactivo'),
('Fósforo', 'electrolytes', 3.0, 4.0, 2.5, 4.5, 2.5, 4.5, 'mg/dL', false, 'IFM, Mayo Clinic - Metabolismo óseo'),
('Cloruro', 'electrolytes', 100, 106, 96, 106, 96, 106, 'mmol/L', false, 'IFM, Mayo Clinic - Equilibrio ácido-base');

-- 6. MARCADORES METABÓLICOS ADICIONALES
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('Ácido Úrico (Hombres)', 'metabolic', 3.5, 5.5, 3.0, 7.0, 3.4, 7.0, 'mg/dL', true, 'IFM, OptimalDX - Riesgo metabólico'),
('Ácido Úrico (Mujeres)', 'metabolic', 3.0, 5.0, 2.5, 6.0, 2.4, 6.0, 'mg/dL', true, 'IFM, OptimalDX - Riesgo metabólico'),
('Lactato', 'metabolic', 0.5, 1.5, 0.5, 2.2, 0.5, 2.2, 'mmol/L', false, 'IFM - Metabolismo anaeróbico'),
('Cetones (Beta-hidroxibutirato)', 'metabolic', 0.0, 0.5, 0.0, 3.0, 0.0, 0.6, 'mmol/L', false, 'IFM - Cetosis nutricional');

-- 7. HEMATOLOGÍA COMPLETA
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('Hematocrito (Hombres)', 'hematology', 42, 48, 38, 50, 38.3, 48.6, '%', true, 'WHO, Mayo Clinic'),
('Hematocrito (Mujeres)', 'hematology', 38, 44, 34, 46, 35.5, 44.9, '%', true, 'WHO, Mayo Clinic'),
('VCM (Volumen Corpuscular Medio)', 'hematology', 85, 92, 80, 100, 80, 100, 'fL', false, 'IFM, Mayo Clinic - Tamaño eritrocitos'),
('HCM (Hemoglobina Corpuscular Media)', 'hematology', 28, 32, 27, 33, 27, 33, 'pg', false, 'IFM, Mayo Clinic'),
('CHCM (Concentración Hb Corpuscular Media)', 'hematology', 32, 36, 32, 36, 32, 36, 'g/dL', false, 'IFM, Mayo Clinic'),
('RDW (Amplitud Distribución Eritrocitaria)', 'hematology', 11.5, 13.5, 11.5, 15.5, 11.5, 14.5, '%', false, 'IFM, OptimalDX - Heterogeneidad eritrocitos'),
('Plaquetas', 'hematology', 175, 250, 150, 400, 150, 400, '×10³/μL', false, 'WHO, Mayo Clinic - Coagulación'),
('Leucocitos Totales', 'hematology', 5.0, 7.5, 4.5, 10.0, 4.5, 11.0, '×10³/μL', false, 'WHO, Mayo Clinic - Sistema inmune'),
('Neutrófilos', 'hematology', 2.5, 5.0, 2.0, 7.5, 1.8, 7.7, '×10³/μL', false, 'WHO, Mayo Clinic'),
('Linfocitos', 'hematology', 1.5, 3.0, 1.0, 4.0, 1.0, 4.8, '×10³/μL', false, 'WHO, Mayo Clinic'),
('Monocitos', 'hematology', 0.2, 0.8, 0.2, 1.0, 0.0, 0.8, '×10³/μL', false, 'WHO, Mayo Clinic'),
('Eosinófilos', 'hematology', 0.0, 0.4, 0.0, 0.5, 0.0, 0.5, '×10³/μL', false, 'WHO, Mayo Clinic'),
('Basófilos', 'hematology', 0.0, 0.1, 0.0, 0.2, 0.0, 0.2, '×10³/μL', false, 'WHO, Mayo Clinic');

-- 8. MARCADORES INFLAMATORIOS ADICIONALES
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('IL-6 (Interleucina-6)', 'inflammatory', 0, 1.8, 0, 5.0, 0, 5.0, 'pg/mL', false, 'IFM, NCBI - Inflamación sistémica'),
('TNF-alfa (Factor Necrosis Tumoral)', 'inflammatory', 0, 5.6, 0, 8.1, 0, 8.1, 'pg/mL', false, 'IFM, NCBI - Inflamación crónica');

-- 9. PROTEINAS Y MARCADORES ADICIONALES
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('Proteína Total', 'hepatic', 6.6, 8.0, 6.0, 8.3, 6.0, 8.3, 'g/dL', false, 'Mayo Clinic - Función hepática'),
('Globulinas', 'hepatic', 2.0, 3.5, 2.0, 4.0, 2.0, 3.5, 'g/dL', false, 'Mayo Clinic - Sistema inmune'),
('Ratio Albúmina/Globulina', 'hepatic', 1.2, 2.2, 1.0, 2.5, 1.0, 2.5, 'ratio', false, 'IFM - Función proteica'),
('GGT (Gamma Glutamil Transferasa)', 'hepatic', 0, 30, 0, 51, 0, 51, 'U/L', false, 'IFM, OptimalDX - Función hepática'),
('Fosfatasa Alcalina', 'hepatic', 30, 90, 30, 120, 30, 120, 'U/L', false, 'IFM - Función hepática y ósea'),
('LDH (Lactato Deshidrogenasa)', 'metabolic', 140, 200, 122, 222, 122, 222, 'U/L', false, 'Mayo Clinic - Daño celular'),
('CPK (Creatina Fosfoquinasa)', 'metabolic', 30, 200, 30, 200, 24, 195, 'U/L', false, 'Mayo Clinic - Función muscular');

-- 10. MARCADORES HORMONALES TIROIDEOS ADICIONALES
INSERT INTO biomarker_ranges (biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, reference_source) VALUES
('T3 Total', 'thyroid', 100, 180, 80, 200, 80, 200, 'ng/dL', false, 'IFM, ATA - Hormona tiroidea total'),
('T4 Total', 'thyroid', 6.0, 10.0, 4.5, 12.0, 4.5, 12.0, 'μg/dL', false, 'IFM, ATA - Hormona tiroidea total'),
('Tiroglobulina', 'thyroid', 1.4, 30, 0, 35, 1.4, 78, 'ng/mL', false, 'ATA - Marcador tiroideo');;