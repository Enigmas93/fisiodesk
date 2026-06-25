-- ============================================================
-- POLÍTICAS DE BOOTSTRAP DO CADASTRO / ONBOARDING
-- ============================================================

CREATE OR REPLACE FUNCTION has_professional_profile()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professionals
    WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'clinics' AND policyname = 'authenticated_users_can_create_clinics'
  ) THEN
    CREATE POLICY authenticated_users_can_create_clinics
      ON clinics FOR INSERT
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'clinics' AND policyname = 'clinic_members_can_view_clinics'
  ) THEN
    CREATE POLICY clinic_members_can_view_clinics
      ON clinics FOR SELECT
      USING (
        id IN (
          SELECT clinic_id
          FROM professionals
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'clinics' AND policyname = 'clinic_admins_can_update_clinics'
  ) THEN
    CREATE POLICY clinic_admins_can_update_clinics
      ON clinics FOR UPDATE
      USING (
        id IN (
          SELECT clinic_id
          FROM professionals
          WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        id IN (
          SELECT clinic_id
          FROM professionals
          WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'professionals' AND policyname = 'users_can_create_own_first_professional_profile'
  ) THEN
    CREATE POLICY users_can_create_own_first_professional_profile
      ON professionals FOR INSERT
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
        AND NOT has_professional_profile()
      );
  END IF;
END $$;
