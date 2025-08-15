/*
  # Добавить поле для чека об уплате налога

  1. Изменения
    - Добавляем поле `tax_receipt_url` в таблицу `payout_requests`
    - Поле для хранения ссылки на загруженный чек об уплате налога
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payout_requests' AND column_name = 'tax_receipt_url'
  ) THEN
    ALTER TABLE payout_requests ADD COLUMN tax_receipt_url text;
  END IF;
END $$;