/*
  # Создание таблиц для отчетов и выплат

  1. Новые таблицы
    - `reports` - отчеты артистов по кварталам
      - `id` (uuid, primary key)
      - `artist_id` (uuid, foreign key to profiles)
      - `quarter` (text) - квартал (Q1 2025, Q2 2025, etc.)
      - `file_url` (text, nullable) - ссылка на файл отчета
      - `amount_rub` (numeric) - сумма в рублях
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payout_requests` - заявки на выплаты
      - `id` (uuid, primary key)
      - `artist_id` (uuid, foreign key to profiles)
      - `quarter` (text) - квартал
      - `amount_rub` (numeric) - сумма к выплате
      - `inn` (text) - ИНН
      - `full_name` (text) - ФИО
      - `bik` (text) - БИК банка
      - `account_number` (text) - номер счета
      - `is_self_employed` (boolean) - самозанятый/ИП
      - `status` (text) - статус заявки (pending, completed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Storage bucket
    - Создание bucket для хранения файлов отчетов

  3. Security
    - Enable RLS на обеих таблицах
    - Политики доступа для артистов и администраторов
*/

-- Создание таблицы отчетов
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quarter text NOT NULL,
  file_url text,
  amount_rub numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(artist_id, quarter)
);

-- Создание таблицы заявок на выплаты
CREATE TABLE IF NOT EXISTS payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quarter text NOT NULL,
  amount_rub numeric NOT NULL,
  inn text NOT NULL,
  full_name text NOT NULL,
  bik text NOT NULL,
  account_number text NOT NULL,
  is_self_employed boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(artist_id, quarter)
);

-- Создание storage bucket для отчетов
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Включение RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы reports
-- Администраторы могут все
CREATE POLICY "Admins can manage all reports"
  ON reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Артисты могут читать только свои отчеты
CREATE POLICY "Artists can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    artist_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'artist'
    )
  );

-- Политики для таблицы payout_requests
-- Администраторы могут все
CREATE POLICY "Admins can manage all payout requests"
  ON payout_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Артисты могут создавать и читать только свои заявки
CREATE POLICY "Artists can manage own payout requests"
  ON payout_requests
  FOR ALL
  TO authenticated
  USING (
    artist_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'artist'
    )
  );

-- Политики для storage bucket reports
CREATE POLICY "Authenticated users can upload reports"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Authenticated users can view reports"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'reports');

CREATE POLICY "Admins can delete reports"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'reports' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );