#!/bin/bash

# Configuración de Supabase
SUPABASE_URL="https://holtohiphaokzshtpyku.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvbHRvaGlwaGFva3pzaHRweWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNDEzNDAsImV4cCI6MjA3NzYxNzM0MH0.r9g54Oxb_8uMLa4A33Pm0m76pS2_AoCpl5-MmPS75gk"

echo "=== Creando usuarios de prueba en Supabase ==="

# Usuario 1: Médico
echo ""
echo "Creando médico..."
DOCTOR_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdoctor@gmail.com",
    "password": "Doctor123!"
  }')

echo "Respuesta doctor: $DOCTOR_RESPONSE"
DOCTOR_ID=$(echo "$DOCTOR_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Doctor ID: $DOCTOR_ID"

# Usuario 2: Paciente
echo ""
echo "Creando paciente..."
PATIENT_RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testpatient@gmail.com",
    "password": "Patient123!"
  }')

echo "Respuesta paciente: $PATIENT_RESPONSE"
PATIENT_ID=$(echo "$PATIENT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Patient ID: $PATIENT_ID"

echo ""
echo "=== Usuarios creados ==="
echo "Médico: testdoctor@gmail.com / Doctor123!"
echo "Paciente: testpatient@gmail.com / Patient123!"
