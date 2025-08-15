/*
  # Добавить поле номера договора в профили

  1. Изменения в таблице profiles
    - Добавляем поле `contract_number` (text, nullable)
    - Добавляем поле `inn` (text, nullable) 
    - Добавляем поле `full_name` (text, nullable)
    - Добавляем поле `bik` (text, nullable)
    - Добавляем поле `account_number` (text, nullable)
    - Добавляем поле `is_self_employed` (boolean, default false)

  2. Цель
    - Сохранение данных для переиспользования в заявках на выплаты
    - Избежание повторного ввода одних и тех же данных
*/

DO $$
BEGIN
  -- Добавляем поле номера договора
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'contract_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN contract_number text;
  END IF;

  -- Добавляем поле ИНН
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'inn'
  ) THEN
    ALTER TABLE profiles ADD COLUMN inn text;
  END IF;

  -- Добавляем поле ФИО
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;

  -- Добавляем поле БИК
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bik'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bik text;
  END IF;

  -- Добавляем поле номера счета
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_number text;
  END IF;

  -- Добавляем поле самозанятости
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_self_employed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_self_employed boolean DEFAULT false;
  END IF;
END $$;