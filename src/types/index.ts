// Re-export existing types from supabase
export type {
  Doctor,
  Patient,
  Analysis,
  Report,
  Notification,
} from '@/lib/supabase';

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  stack?: string;
}

// Biomarker types
export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  reference_range: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  category: string;
  created_at: string;
}

// Functional Analysis types
export interface FunctionalAnalysis {
  id: string;
  analysis_id: string;
  biomarkers: Biomarker[];
  summary: string;
  recommendations: string;
  created_at: string;
}

// Extended Patient with relationships
export interface PatientWithAnalyses extends Patient {
  analyses?: Analysis[];
  reports?: Report[];
}

// Extended Analysis with relationships
export interface AnalysisWithReport extends Analysis {
  report?: Report;
  patient?: Patient;
  doctor?: Doctor;
}

// Form Data types
export interface PatientFormData {
  name: string;
  email: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
}

export interface DoctorFormData {
  name: string;
  email: string;
  specialty?: string;
  license_number?: string;
  clinic_name?: string;
  phone?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: AppError;
  success: boolean;
}

// Supabase Function Response types
export interface ProcessPdfResponse {
  success: boolean;
  analysisId?: string;
  error?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  reportUrl?: string;
  error?: string;
}

// Chart Data types
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[] | number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}

// Dashboard Stats types
export interface DashboardStats {
  totalPatients?: number;
  totalAnalyses?: number;
  pendingReviews?: number;
  completedToday?: number;
}

// Auth types
export interface AuthError {
  message: string;
  status?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  role: 'doctor' | 'patient';
  additionalData: DoctorFormData | PatientFormData;
}

// Filter and Sort types
export type SortOrder = 'asc' | 'desc';
export type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export interface FilterOptions {
  status?: StatusFilter;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}