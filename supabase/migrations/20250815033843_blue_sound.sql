/*
  # Add Q1 2025 status field to profiles table

  1. Changes
    - Add `requires_q1_2025_status` boolean field to `profiles` table
    - Default value is `false`
    - Field indicates if user needs Q1 2025 report as of August 15, 2025

  2. Purpose
    - Track user requests for Q1 2025 reports independently of payout requests
    - Allow users to request reports before any payout process
    - Provide clear visibility for administrators
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'requires_q1_2025_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN requires_q1_2025_status boolean DEFAULT false;
  END IF;
END $$;