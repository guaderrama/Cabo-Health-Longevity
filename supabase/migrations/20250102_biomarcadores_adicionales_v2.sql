-- ============================================
-- COMPLETAR BIOMARCADORES DE MEDICINA FUNCIONAL
-- Agregando biomarcadores faltantes prioritarios
-- ============================================

-- 1. RATIOS TIROIDEOS CALCULADOS
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, description, clinical_significance) VALUES
('FT3_RT3_RATIO', 'Ratio FT3:RT3', 'thyroid', 20, 30, 15, 20, 10, 25, 'ratio', false, 'Ratio de T3 Libre a T3 Reversa para evaluar conversión tiroidea óptima', 'IFM, Rupa Health - Conversión óptima tiroidea. Ratio >20 indica conversión óptima de T4 a T3'),
('RT3_FT3_RATIO', 'Ratio RT3:FT3', 'thyroid', 0, 0.1, 0.1, 0.15, 0.15, 0.2, 'ratio', false, 'Ratio inverso para evaluación de conversión T4 a T3', 'IFM, Functional Medicine - Ratio <0.1 indica conversión óptima');

-- 2. HORMONAS SUPRARRENALES Y SEXUALES (Prioridad alta)
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, description, clinical_significance) VALUES
('CORTISOL_AM', 'Cortisol AM (8 AM)', 'hormonal', 10, 18, 6, 23, 5, 25, 'μg/dL', false, 'Cortisol matutino - pico circadiano normal', 'IFM, OptimalDX - Ritmo circadiano óptimo, función suprarrenal'),
('CORTISOL_PM', 'Cortisol PM (4 PM)', 'hormonal', 3, 8, 2, 10, 2, 12, 'μg/dL', false, 'Cortisol vespertino - evaluación ritmo circadiano', 'IFM, OptimalDX - Debe descender naturalmente durante el día'),
('DHEA_S_M', 'DHEA-S (Hombres)', 'hormonal', 350, 500, 280, 640, 180, 1250, 'μg/dL', true, 'DHEA sulfato en hombres', 'IFM, Mayo Clinic - Salud suprarrenal, precursor hormonal'),
('DHEA_S_F', 'DHEA-S (Mujeres)', 'hormonal', 200, 380, 140, 450, 65, 380, 'μg/dL', true, 'DHEA sulfato en mujeres', 'IFM, Mayo Clinic - Salud suprarrenal, equilibrio hormonal'),
('TESTOSTERONE_TOTAL_M', 'Testosterona Total (Hombres)', 'hormonal', 500, 900, 350, 1100, 264, 916, 'ng/dL', true, 'Testosterona total masculina', 'IFM, Endocrine Society - Salud masculina, masa muscular, libido'),
('TESTOSTERONE_TOTAL_F', 'Testosterona Total (Mujeres)', 'hormonal', 30, 70, 15, 80, 8, 60, 'ng/dL', true, 'Testosterona total femenina', 'IFM, Endocrine Society - Energía, libido, masa muscular'),
('TESTOSTERONE_FREE_M', 'Testosterona Libre (Hombres)', 'hormonal', 9, 26, 5, 30, 4.5, 25, 'pg/mL', true, 'Testosterona bioactiva masculina', 'IFM, OptimalDX - Fracción biológicamente activa'),
('TESTOSTERONE_FREE_F', 'Testosterona Libre (Mujeres)', 'hormonal', 0.5, 2.5, 0.3, 3.5, 0.2, 5, 'pg/mL', true, 'Testosterona bioactiva femenina', 'IFM, OptimalDX - Fracción biológicamente activa'),
('ESTRADIOL_PREMEN', 'Estradiol (Mujeres Premenopáusicas)', 'hormonal', 50, 250, 30, 400, 15, 350, 'pg/mL', true, 'Estradiol en edad reproductiva', 'IFM, ACOG - Fase folicular, salud reproductiva'),
('ESTRADIOL_POSTMEN', 'Estradiol (Mujeres Posmenopáusicas)', 'hormonal', 10, 30, 5, 50, 0, 54, 'pg/mL', true, 'Estradiol posmenopausia', 'IFM, ACOG - Niveles posmenopáusicos normales'),
('ESTRADIOL_M', 'Estradiol (Hombres)', 'hormonal', 10, 40, 8, 42, 7.6, 42.6, 'pg/mL', true, 'Estradiol masculino', 'IFM, Endocrine Society - Salud ósea, cardiovascular'),
('PROGESTERONE_LUTEAL', 'Progesterona (Mujeres Fase Lútea)', 'hormonal', 5, 20, 2, 25, 1.7, 27, 'ng/mL', true, 'Progesterona en fase lútea', 'IFM, ACOG - Ovulación confirmada, fertilidad'),
('PROGESTERONE_FOLLICULAR', 'Progesterona (Mujeres Fase Folicular)', 'hormonal', 0.1, 1.5, 0.1, 3, 0.1, 1.5, 'ng/mL', true, 'Progesterona en fase folicular', 'IFM, ACOG - Valores basales pre-ovulatorios'),
('PROLACTIN', 'Prolactina', 'hormonal', 2, 15, 2, 20, 4, 23, 'ng/mL', false, 'Hormona prolactina', 'IFM, Mayo Clinic - Regulación hormonal, lactancia'),
('IGF1_20_30', 'IGF-1 (20-30 años)', 'hormonal', 200, 350, 115, 400, 115, 358, 'ng/mL', false, 'Factor de crecimiento similar a insulina - adultos jóvenes', 'IFM, Mayo Clinic - Hormona de crecimiento, salud metabólica'),
('IGF1_30_40', 'IGF-1 (30-40 años)', 'hormonal', 150, 280, 100, 350, 115, 307, 'ng/mL', false, 'Factor de crecimiento similar a insulina - adultos', 'IFM, Mayo Clinic - Declina naturalmente con edad'),
('IGF1_40_50', 'IGF-1 (40-50 años)', 'hormonal', 120, 250, 90, 300, 101, 267, 'ng/mL', false, 'Factor de crecimiento similar a insulina - adultos maduros', 'IFM, Mayo Clinic - Mantenimiento tisular');

-- 3. MARCADORES CARDIOVASCULARES AVANZADOS (Prioridad alta)
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, description, clinical_significance) VALUES
('LP_A', 'Lipoproteína(a) [Lp(a)]', 'cardiovascular', 0, 30, 30, 50, 0, 75, 'mg/dL', false, 'Marcador de riesgo cardiovascular genético', 'ESC, AHA - Factor de riesgo independiente, genéticamente determinado'),
('LDL_P', 'Partículas LDL (LDL-P)', 'cardiovascular', 0, 1000, 1000, 1300, 0, 2000, 'nmol/L', false, 'Número de partículas LDL', 'NLA, Cleveland Clinic - Mejor predictor que LDL-C'),
('FIBRINOGEN', 'Fibrinógeno', 'cardiovascular', 200, 300, 300, 400, 200, 450, 'mg/dL', false, 'Proteína de coagulación, marcador inflamatorio', 'AHA, ESC - Riesgo trombótico, inflamación'),
('NT_PROBNP', 'NT-proBNP', 'cardiovascular', 0, 125, 125, 300, 0, 450, 'pg/mL', false, 'Péptido natriurético cerebral', 'AHA, ESC - Función cardíaca, insuficiencia');

-- 4. VITAMINAS ADICIONALES (Prioridad media-alta)
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, description, clinical_significance) VALUES
('VIT_A', 'Vitamina A (Retinol)', 'nutritional', 50, 80, 38, 98, 30, 120, 'μg/dL', false, 'Vitamina A - retinol sérico', 'NIH/ODS, IFM - Salud visual, inmune, reproducción'),
('VIT_E', 'Vitamina E (Tocoferol)', 'nutritional', 12, 20, 5.5, 20, 5.5, 17, 'mg/L', false, 'Vitamina E - tocoferol alfa', 'NIH/ODS, IFM - Antioxidante liposoluble'),
('VIT_K', 'Vitamina K', 'nutritional', 0.4, 3.2, 0.2, 3.2, 0.13, 1.19, 'ng/mL', false, 'Vitamina K - filoquinona', 'NIH/ODS, IFM - Coagulación, salud ósea'),
('VIT_B1', 'Vitamina B1 (Tiamina)', 'nutritional', 70, 180, 66, 200, 66.5, 200, 'nmol/L', false, 'Tiamina - vitamina B1', 'NIH/ODS - Metabolismo energético, función nerviosa'),
('VIT_B6', 'Vitamina B6 (Piridoxina)', 'nutritional', 30, 100, 20, 125, 20, 125, 'nmol/L', false, 'Piridoxina - vitamina B6', 'NIH/ODS - Metabolismo proteínas, neurotransmisores'),
('VIT_C', 'Vitamina C (Ácido Ascórbico)', 'nutritional', 1.0, 2.0, 0.6, 2.0, 0.4, 2.0, 'mg/dL', false, 'Ácido ascórbico - vitamina C', 'NIH/ODS, IFM - Antioxidante, síntesis colágeno');

-- 5. ELECTROLITOS (Prioridad alta)
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, description, clinical_significance) VALUES
('SODIUM', 'Sodio', 'electrolytes', 138, 142, 136, 145, 136, 145, 'mmol/L', false, 'Sodio sérico', 'IFM, Mayo Clinic - Equilibrio hídrico, función nerviosa'),
('POTASSIUM', 'Potasio', 'electrolytes', 4.0, 4.5, 3.5, 5.0, 3.5, 5.0, 'mmol/L', false, 'Potasio sérico', 'IFM, Mayo Clinic - Función cardíaca, muscular'),
('CALCIUM', 'Calcio', 'electrolytes', 9.6, 10.2, 8.5, 10.5, 8.5, 10.5, 'mg/dL', false, 'Calcio total sérico', 'IFM, Mayo Clinic - Salud ósea, función muscular'),
('CALCIUM_IONIZED', 'Calcio Iónico', 'electrolytes', 4.8, 5.2, 4.6, 5.4, 4.6, 5.4, 'mg/dL', false, 'Calcio ionizado - forma activa', 'IFM - Fracción biológicamente activa'),
('PHOSPHORUS', 'Fósforo', 'electrolytes', 3.0, 4.0, 2.5, 4.5, 2.5, 4.5, 'mg/dL', false, 'Fosfato inorgánico', 'IFM, Mayo Clinic - Metabolismo óseo, energético'),
('CHLORIDE', 'Cloruro', 'electrolytes', 100, 106, 96, 106, 96, 106, 'mmol/L', false, 'Cloruro sérico', 'IFM, Mayo Clinic - Equilibrio ácido-base');

-- 6. MARCADORES METABÓLICOS ADICIONALES
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, gender, description, clinical_significance) VALUES
('URIC_ACID_M', 'Ácido Úrico (Hombres)', 'metabolic', 3.5, 5.5, 3.0, 7.0, 3.4, 7.0, 'mg/dL', true, 'M', 'Ácido úrico masculino', 'IFM, OptimalDX - Riesgo metabólico, gota'),
('URIC_ACID_F', 'Ácido Úrico (Mujeres)', 'metabolic', 3.0, 5.0, 2.5, 6.0, 2.4, 6.0, 'mg/dL', true, 'F', 'Ácido úrico femenino', 'IFM, OptimalDX - Riesgo metabólico, gota'),
('LACTATE', 'Lactato', 'metabolic', 0.5, 1.5, 0.5, 2.2, 0.5, 2.2, 'mmol/L', false, null, 'Lactato sérico', 'IFM - Metabolismo anaeróbico, función mitocondrial'),
('BHB', 'Cetones (Beta-hidroxibutirato)', 'metabolic', 0.0, 0.5, 0.0, 3.0, 0.0, 0.6, 'mmol/L', false, null, 'Beta-hidroxibutirato - cetona principal', 'IFM - Cetosis nutricional, ayuno'),
('LDH', 'LDH (Lactato Deshidrogenasa)', 'metabolic', 140, 200, 122, 222, 122, 222, 'U/L', false, null, 'Lactato deshidrogenasa', 'Mayo Clinic - Daño celular, hemólisis'),
('CPK', 'CPK (Creatina Fosfoquinasa)', 'metabolic', 30, 200, 30, 200, 24, 195, 'U/L', false, null, 'Creatina fosfoquinasa', 'Mayo Clinic - Función muscular, daño');

-- 7. HEMATOLOGÍA COMPLETA
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, gender, description, clinical_significance) VALUES
('HCT_M', 'Hematocrito (Hombres)', 'hematology', 42, 48, 38, 50, 38.3, 48.6, '%', true, 'M', 'Porcentaje de volumen eritrocitario masculino', 'WHO, Mayo Clinic - Masa eritrocitaria'),
('HCT_F', 'Hematocrito (Mujeres)', 'hematology', 38, 44, 34, 46, 35.5, 44.9, '%', true, 'F', 'Porcentaje de volumen eritrocitario femenino', 'WHO, Mayo Clinic - Masa eritrocitaria'),
('MCV', 'VCM (Volumen Corpuscular Medio)', 'hematology', 85, 92, 80, 100, 80, 100, 'fL', false, null, 'Tamaño promedio de eritrocitos', 'IFM, Mayo Clinic - Anemia macrocítica/microcítica'),
('MCH', 'HCM (Hemoglobina Corpuscular Media)', 'hematology', 28, 32, 27, 33, 27, 33, 'pg', false, null, 'Hemoglobina promedio por eritrocito', 'IFM, Mayo Clinic - Clasificación anemias'),
('MCHC', 'CHCM (Concentración Hb Corpuscular Media)', 'hematology', 32, 36, 32, 36, 32, 36, 'g/dL', false, null, 'Concentración de hemoglobina en eritrocitos', 'IFM, Mayo Clinic'),
('RDW', 'RDW (Amplitud Distribución Eritrocitaria)', 'hematology', 11.5, 13.5, 11.5, 15.5, 11.5, 14.5, '%', false, null, 'Variabilidad tamaño eritrocitos', 'IFM, OptimalDX - Deficiencias nutricionales'),
('PLATELETS', 'Plaquetas', 'hematology', 175, 250, 150, 400, 150, 400, '×10³/μL', false, null, 'Recuento plaquetario', 'WHO, Mayo Clinic - Coagulación'),
('WBC', 'Leucocitos Totales', 'hematology', 5.0, 7.5, 4.5, 10.0, 4.5, 11.0, '×10³/μL', false, null, 'Recuento total de glóbulos blancos', 'WHO, Mayo Clinic - Sistema inmune'),
('NEUTROPHILS', 'Neutrófilos', 'hematology', 2.5, 5.0, 2.0, 7.5, 1.8, 7.7, '×10³/μL', false, null, 'Neutrófilos absolutos', 'WHO, Mayo Clinic - Primera línea inmune'),
('LYMPHOCYTES', 'Linfocitos', 'hematology', 1.5, 3.0, 1.0, 4.0, 1.0, 4.8, '×10³/μL', false, null, 'Linfocitos absolutos', 'WHO, Mayo Clinic - Inmunidad adaptativa'),
('MONOCYTES', 'Monocitos', 'hematology', 0.2, 0.8, 0.2, 1.0, 0.0, 0.8, '×10³/μL', false, null, 'Monocitos absolutos', 'WHO, Mayo Clinic - Fagocitosis'),
('EOSINOPHILS', 'Eosinófilos', 'hematology', 0.0, 0.4, 0.0, 0.5, 0.0, 0.5, '×10³/μL', false, null, 'Eosinófilos absolutos', 'WHO, Mayo Clinic - Alergias, parásitos'),
('BASOPHILS', 'Basófilos', 'hematology', 0.0, 0.1, 0.0, 0.2, 0.0, 0.2, '×10³/μL', false, null, 'Basófilos absolutos', 'WHO, Mayo Clinic - Reacciones alérgicas');

-- 8. MARCADORES INFLAMATORIOS ADICIONALES
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, description, clinical_significance) VALUES
('IL6', 'IL-6 (Interleucina-6)', 'inflammatory', 0, 1.8, 0, 5.0, 0, 5.0, 'pg/mL', false, 'Citocina proinflamatoria', 'IFM, NCBI - Inflamación sistémica aguda y crónica'),
('TNF_ALPHA', 'TNF-alfa (Factor Necrosis Tumoral)', 'inflammatory', 0, 5.6, 0, 8.1, 0, 8.1, 'pg/mL', false, 'Citocina proinflamatoria', 'IFM, NCBI - Inflamación crónica, autoinmunidad');

-- 9. PROTEINAS Y MARCADORES HEPÁTICOS ADICIONALES
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, description, clinical_significance) VALUES
('TOTAL_PROTEIN', 'Proteína Total', 'hepatic', 6.6, 8.0, 6.0, 8.3, 6.0, 8.3, 'g/dL', false, 'Proteínas séricas totales', 'Mayo Clinic - Función hepática, estado nutricional'),
('GLOBULIN', 'Globulinas', 'hepatic', 2.0, 3.5, 2.0, 4.0, 2.0, 3.5, 'g/dL', false, 'Globulinas séricas', 'Mayo Clinic - Sistema inmune, inflamación'),
('AG_RATIO', 'Ratio Albúmina/Globulina', 'hepatic', 1.2, 2.2, 1.0, 2.5, 1.0, 2.5, 'ratio', false, 'Ratio A/G', 'IFM - Equilibrio proteico, función hepática'),
('GGT', 'GGT (Gamma Glutamil Transferasa)', 'hepatic', 0, 30, 0, 51, 0, 51, 'U/L', false, 'Gamma glutamil transferasa', 'IFM, OptimalDX - Función hepática, alcohol'),
('ALP', 'Fosfatasa Alcalina', 'hepatic', 30, 90, 30, 120, 30, 120, 'U/L', false, 'Fosfatasa alcalina', 'IFM - Función hepática y ósea');

-- 10. MARCADORES TIROIDEOS ADICIONALES
INSERT INTO biomarker_ranges (biomarker_code, biomarker_name, category, optimal_min, optimal_max, acceptable_min, acceptable_max, conventional_min, conventional_max, units, gender_specific, description, clinical_significance) VALUES
('T3_TOTAL', 'T3 Total', 'thyroid', 100, 180, 80, 200, 80, 200, 'ng/dL', false, 'Triiodotironina total', 'IFM, ATA - Hormona tiroidea activa total'),
('T4_TOTAL', 'T4 Total', 'thyroid', 6.0, 10.0, 4.5, 12.0, 4.5, 12.0, 'μg/dL', false, 'Tiroxina total', 'IFM, ATA - Hormona tiroidea principal total'),
('THYROGLOBULIN', 'Tiroglobulina', 'thyroid', 1.4, 30, 0, 35, 1.4, 78, 'ng/mL', false, 'Proteína tiroglobulina', 'ATA - Marcador tiroideo, seguimiento cáncer');

COMMIT;
