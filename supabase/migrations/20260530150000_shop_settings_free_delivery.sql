-- Singleton shop settings row (marketplace promotions, etc.)
CREATE TABLE IF NOT EXISTS public.shop_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  free_delivery_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by integer REFERENCES public.users(id) ON DELETE SET NULL
);

INSERT INTO public.shop_settings (id, free_delivery_enabled)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;
