-- ============================================================================
-- CAPITAL VAPE - CONFIGURACIÓN OFICIAL DE SUPABASE STORAGE
-- Bucket: capital-vape-products
-- 
-- Ejecutar este script en el SQL Editor de tu consola de Supabase:
-- https://supabase.com/dashboard/project/gkbzabubivjfzlefcnnq/sql/new
-- ============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear el Bucket capital-vape-products en storage.buckets si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'capital-vape-products',
  'capital-vape-products',
  true,
  5242880, -- Límite de 5 MB por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 3. POLÍTICAS DE ACCESO ROW LEVEL SECURITY (RLS) PARA storage.objects

-- A. Lectura Pública: Cualquier visitante del catálogo Retail y Mayorista puede ver las fotos
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'capital-vape-products');

-- B. Subida de Imágenes: Permitir subida de fotografías en el bucket capital-vape-products
DROP POLICY IF EXISTS "Allow upload product images" ON storage.objects;
CREATE POLICY "Allow upload product images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'capital-vape-products' AND
  (storage.extension(name) = 'jpg' OR
   storage.extension(name) = 'jpeg' OR
   storage.extension(name) = 'png' OR
   storage.extension(name) = 'webp')
);

-- C. Actualización / Reemplazo de Imágenes en el bucket capital-vape-products
DROP POLICY IF EXISTS "Allow update product images" ON storage.objects;
CREATE POLICY "Allow update product images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'capital-vape-products')
WITH CHECK (bucket_id = 'capital-vape-products');

-- D. Eliminación de Imágenes en el bucket capital-vape-products
DROP POLICY IF EXISTS "Allow delete product images" ON storage.objects;
CREATE POLICY "Allow delete product images"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'capital-vape-products');

-- 4. Soporte para Galería de Imágenes en la tabla public.products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS galeria JSONB DEFAULT '[]'::jsonb;

-- 5. Asegurar permisos de acceso a la tabla public.products
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.price_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.inventory_history TO anon, authenticated, service_role;
