-- Исправляем все функции с правильным search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, role, pseudonym, name, telegram_contact)
    VALUES (
        NEW.id, 
        COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'artist'),
        NEW.raw_user_meta_data ->> 'pseudonym',
        NEW.raw_user_meta_data ->> 'name',
        NEW.raw_user_meta_data ->> 'telegram_contact'
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;