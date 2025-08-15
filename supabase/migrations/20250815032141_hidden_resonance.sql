/*
  # Add Q1 2025 status flag to payout requests

  1. Changes
    - Add `requires_q1_2025_status` boolean column to `payout_requests` table
    - Default value is `false`
    - This flag indicates if the payout request requires status as of 15.08.2025

  2. Notes
    - This is specifically for Q1 2025 quarter tracking
    - Helps administrators identify special status requirements
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'requires_q1_2025_status'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN requires_q1_2025_status boolean DEFAULT false;
  END IF;
END $$;