-- Migration: fix_rls_signup
-- Fix RLS policies to allow authenticated users to insert their own records during signup

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow insert for doctors via edge function" ON doctors;
DROP POLICY IF EXISTS "Allow insert for patients via edge function" ON patients;

-- Create new policies that allow authenticated users to insert their own records
CREATE POLICY "Doctors can insert their own record" ON doctors
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can insert their own record" ON patients
  FOR INSERT WITH CHECK (auth.uid() = id);
