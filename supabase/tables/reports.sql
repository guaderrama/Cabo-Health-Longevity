CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL,
    ai_analysis TEXT,
    doctor_notes TEXT,
    recommendations TEXT,
    risk_level TEXT,
    approved_by_doctor BOOLEAN DEFAULT false,
    model_used TEXT,
    report_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);