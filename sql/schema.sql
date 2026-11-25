-- ============================================================================
-- CAPITAL VAPE - SISTEMA DE BASE DE DATOS Y ADMINISTRACIÓN DE PRODUCTOS
-- Motor: PostgreSQL 14+ / Supabase
-- ============================================================================

-- Habilitar extensión para UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: products (Catálogo de productos, precios, inventario y disponibilidad)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,                                     -- Identificador único (slug o uuid)
    name TEXT NOT NULL,                                      -- Nombre comercial del producto
    brand TEXT NOT NULL,                                     -- Marca del producto
    description TEXT DEFAULT '',                             -- Descripción detallada
    image_url TEXT NOT NULL DEFAULT '',                      -- URL de la imagen principal
    category TEXT NOT NULL DEFAULT 'desechables',            -- Categoría (desechables, pods, kits, baterias, accesorios, liquidos)
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),        -- Precio actual de venta individual (COP)
    price_two_units NUMERIC(12, 2) CHECK (price_two_units IS NULL OR price_two_units >= 0), -- Precio promocional por 2 unidades
    wholesale_prices JSONB NOT NULL DEFAULT '{"5":0,"10":0,"20":0,"50":0,"100":0}'::jsonb, -- Precios mayoristas por volumen
    stock INTEGER NOT NULL DEFAULT 50 CHECK (stock >= 0),    -- Cantidad disponible en inventario
    status TEXT NOT NULL DEFAULT 'disponible'                -- Estado de disponibilidad
        CHECK (status IN ('disponible', 'agotado', 'descontinuado', 'oculto_temporalmente')),
    is_available BOOLEAN GENERATED ALWAYS AS (status = 'disponible' AND stock > 0) STORED, -- Columna generada para queries rápidas
    is_featured BOOLEAN NOT NULL DEFAULT false,              -- Producto destacado / recomendado
    is_deleted BOOLEAN NOT NULL DEFAULT false,               -- Eliminación lógica (soft-delete)
    subtitulo TEXT DEFAULT '',                               -- Subtítulo comercial (puffs, batería, especificaciones)
    puffs INTEGER DEFAULT NULL,                              -- Cantidad aproximada de puffs
    bateria TEXT DEFAULT NULL,                               -- Capacidad de batería
    rating NUMERIC(3, 1) DEFAULT 5.0,                        -- Calificación promedio
    ventas INTEGER DEFAULT 0,                                -- Contador de ventas registradas
    carpeta_imagenes TEXT DEFAULT '',                        -- Carpeta local o bucket de recursos visuales
    tipo_variante TEXT DEFAULT 'sabor',                      -- Tipo de variante ('sabor' o 'color')
    sabores JSONB DEFAULT '[]'::jsonb,                       -- Listado de sabores con imágenes y disponibilidad
    colores JSONB DEFAULT '[]'::jsonb,                       -- Listado de colores con imágenes y disponibilidad
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 2. TABLA: price_history (Auditoría completa e inmutable de cambios)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),           -- Identificador único del registro
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, -- ID del producto asociado
    old_price NUMERIC(12, 2),                                -- Precio individual anterior
    new_price NUMERIC(12, 2),                                -- Precio individual nuevo
    old_price_two_units NUMERIC(12, 2),                      -- Precio promo 2x anterior
    new_price_two_units NUMERIC(12, 2),                      -- Precio promo 2x nuevo
    old_wholesale_prices JSONB,                              -- Precios mayoristas anteriores
    new_wholesale_prices JSONB,                              -- Precios mayoristas nuevos
    old_stock INTEGER,                                       -- Inventario anterior
    new_stock INTEGER,                                       -- Inventario nuevo
    old_status TEXT,                                         -- Estado anterior
    new_status TEXT,                                         -- Estado nuevo
    change_type TEXT NOT NULL DEFAULT 'price_update'         -- Tipo de cambio (price_update, promo_update, wholesale_update, stock_update, status_update, product_created, soft_deleted, restored)
        CHECK (change_type IN ('price_update', 'promo_update', 'wholesale_update', 'stock_update', 'status_update', 'product_created', 'product_updated', 'soft_deleted', 'restored')),
    admin_user TEXT NOT NULL DEFAULT 'Administrador',        -- Usuario administrador que ejecutó el cambio
    change_reason TEXT DEFAULT NULL,                         -- Motivo o justificación del cambio
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()) -- Fecha y hora exacta del cambio
);

-- ============================================================================
-- 3. ÍNDICES DE RENDIMIENTO
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_is_deleted ON public.products(is_deleted);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON public.price_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_admin ON public.price_history(admin_user);

-- ============================================================================
-- 4. FUNCIONES Y TRIGGERS AUTOMÁTICOS
-- ============================================================================

-- A) Actualizar automáticamente el campo updated_at en products
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.fn_set_updated_at();

-- B) Auditoría automática de cambios de precios, promociones, mayoristas, stock y disponibilidad
CREATE OR REPLACE FUNCTION public.fn_audit_product_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_change_type TEXT := 'product_updated';
    v_has_change BOOLEAN := false;
BEGIN
    -- Detectar cambios en precio individual
    IF (OLD.price IS DISTINCT FROM NEW.price) THEN
        v_change_type := 'price_update';
        v_has_change := true;
    -- Detectar cambios en precio promo por 2 unidades
    ELSIF (OLD.price_two_units IS DISTINCT FROM NEW.price_two_units) THEN
        v_change_type := 'promo_update';
        v_has_change := true;
    -- Detectar cambios en precios mayoristas
    ELSIF (OLD.wholesale_prices::text IS DISTINCT FROM NEW.wholesale_prices::text) THEN
        v_change_type := 'wholesale_update';
        v_has_change := true;
    -- Detectar cambios en inventario / stock
    ELSIF (OLD.stock IS DISTINCT FROM NEW.stock) THEN
        v_change_type := 'stock_update';
        v_has_change := true;
    -- Detectar cambios en estado de disponibilidad
    ELSIF (OLD.status IS DISTINCT FROM NEW.status) THEN
        v_change_type := 'status_update';
        v_has_change := true;
    -- Detectar eliminación lógica
    ELSIF (OLD.is_deleted = false AND NEW.is_deleted = true) THEN
        v_change_type := 'soft_deleted';
        v_has_change := true;
    -- Detectar reactivación de producto
    ELSIF (OLD.is_deleted = true AND NEW.is_deleted = false) THEN
        v_change_type := 'restored';
        v_has_change := true;
    END IF;

    -- Si hubo un cambio relevante, registrar en price_history
    IF v_has_change THEN
        INSERT INTO public.price_history (
            product_id,
            old_price,
            new_price,
            old_price_two_units,
            new_price_two_units,
            old_wholesale_prices,
            new_wholesale_prices,
            old_stock,
            new_stock,
            old_status,
            new_status,
            change_type,
            admin_user,
            change_reason
        ) VALUES (
            NEW.id,
            OLD.price,
            NEW.price,
            OLD.price_two_units,
            NEW.price_two_units,
            OLD.wholesale_prices,
            NEW.wholesale_prices,
            OLD.stock,
            NEW.stock,
            OLD.status,
            NEW.status,
            v_change_type,
            COALESCE(current_setting('app.current_admin_user', true), 'Administrador'),
            COALESCE(current_setting('app.current_change_reason', true), 'Actualización desde panel administrativo')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_product_changes ON public.products;
CREATE TRIGGER trg_audit_product_changes
AFTER UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.fn_audit_product_changes();

-- ============================================================================
-- 5. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en ambas tablas
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA: products
-- 1) Los visitantes públicos anónimos sólo pueden consultar productos activos y no ocultos
CREATE POLICY "Public visitors can view active catalog products"
ON public.products
FOR SELECT
USING (is_deleted = false AND status != 'oculto_temporalmente');

-- 2) Los administradores autenticados tienen acceso completo para consultar, crear, modificar y eliminar
CREATE POLICY "Authenticated admins have full access to products"
ON public.products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- POLÍTICAS PARA: price_history
-- 1) Administradores pueden consultar todo el historial de auditoría
CREATE POLICY "Authenticated admins can view price history"
ON public.price_history
FOR SELECT
TO authenticated
USING (true);

-- 2) Clientes anónimos pueden consultar el historial público si el admin lo autoriza
CREATE POLICY "Public can view price history"
ON public.price_history
FOR SELECT
TO anon
USING (true);

-- 3) Únicamente los administradores o los triggers internos pueden insertar registros de historial
CREATE POLICY "Authenticated admins can insert price history"
ON public.price_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- NOTA DE SEGURIDAD CRÍTICA:
-- NO se crean políticas de UPDATE ni de DELETE para public.price_history.
-- El historial es 100% inmutable y jamás puede ser alterado o purgado.

-- ============================================================================
-- 6. VISTA DE CONSULTA RÁPIDA PARA EL CATÁLOGO FRONTEND
-- ============================================================================
CREATE OR REPLACE VIEW public.v_public_catalog AS
SELECT 
    p.id,
    p.name,
    p.brand,
    p.description,
    p.image_url,
    p.category,
    p.price,
    p.price_two_units,
    p.wholesale_prices,
    p.stock,
    p.status,
    p.is_available,
    p.is_featured,
    p.subtitulo,
    p.puffs,
    p.bateria,
    p.rating,
    p.ventas,
    p.carpeta_imagenes,
    p.tipo_variante,
    p.sabores,
    p.colores
FROM public.products p
WHERE p.is_deleted = false 
  AND p.status != 'oculto_temporalmente';
