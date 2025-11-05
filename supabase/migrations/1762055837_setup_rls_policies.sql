-- Migration: setup_rls_policies
-- Created at: 1762055837

-- Enable RLS on all tables
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for doctors table
CREATE POLICY "Doctors can read their own data" ON doctors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow insert for doctors via edge function" ON doctors
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Policies for patients table
CREATE POLICY "Patients can read their own data" ON patients
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow insert for patients via edge function" ON patients
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Policies for analyses table
CREATE POLICY "Patients can read their own analyses" ON analyses
  FOR SELECT USING (patient_id = auth.uid());

CREATE POLICY "Doctors can read all analyses" ON analyses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())
  );

CREATE POLICY "Patients can insert their own analyses" ON analyses
  FOR INSERT WITH CHECK (patient_id = auth.uid() OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow update analyses via edge function" ON analyses
  FOR UPDATE USING (auth.role() IN ('anon', 'service_role'));

-- Policies for reports table
CREATE POLICY "Patients can read reports for their analyses" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM analyses WHERE id = reports.analysis_id AND patient_id = auth.uid())
  );

CREATE POLICY "Doctors can read all reports" ON reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM doctors WHERE id = auth.uid())
  );

CREATE POLICY "Allow insert reports via edge function" ON reports
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Allow update reports via edge function" ON reports
  FOR UPDATE USING (auth.role() IN ('anon', 'service_role'));

-- Policies for notifications table
CREATE POLICY "Users can read their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Allow insert notifications via edge function" ON notifications
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Policies for storage
CREATE POLICY "Public read access for medical reports" ON storage.objects
  FOR SELECT USING (bucket_id = 'medical-reports');

CREATE POLICY "Allow upload via edge function" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-reports'
    AND (auth.role() = 'anon' OR auth.role() = 'service_role')
  );

CREATE POLICY "Allow delete via edge function" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-reports'
    AND auth.role() = 'service_role'
  );;