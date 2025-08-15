/*
  # Добавить поле номера договора в заявки на выплаты

  1. Изменения в таблице payout_requests
    - Добавляем поле `contract_number` (text, not null)

  2. Цель
    - Хранение номера договора в каждой заявке на выплату
    - Обязательное поле для всех новых заявок
*/

DO $$
BEGIN
  -- Добавляем поле номера договора
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'contract_number'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN contract_number text NOT NULL DEFAULT '';
  END IF;
END $$;