-- Исправляем функцию get_current_user_role с правильным search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::TEXT FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Обновляем политики для админов, используя безопасную функцию
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles"  
ON public.profiles
FOR UPDATE
USING (public.get_current_user_role() = 'admin');