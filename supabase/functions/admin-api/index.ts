/**
 * CAPITAL VAPE - Supabase Edge Function: admin-api
 * 
 * Gestiona autenticación administrativa mediante contraseña única,
 * validación de sesiones seguras por HMAC-SHA256, y operaciones
 * protegidas sobre la base de datos PostgreSQL utilizando SUPABASE_SECRET_KEY.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Control de intentos fallidos en memoria (Anti-Brute Force)
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

function isIpLocked(ip: string): boolean {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (Date.now() < record.lockedUntil) return true;
  if (Date.now() >= record.lockedUntil && record.lockedUntil > 0) {
    failedAttempts.delete(ip);
    return false;
  }
  return false;
}

function recordFailedAttempt(ip: string) {
  const record = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;
  // Si supera 5 intentos fallidos, bloquear durante 15 minutos
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  failedAttempts.set(ip, record);
}

function clearFailedAttempts(ip: string) {
  failedAttempts.delete(ip);
}

// Helpers para firma y verificación HMAC-SHA256 con Web Crypto API
async function signSessionToken(payloadObj: object, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  const b64Header = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const b64Payload = btoa(JSON.stringify(payloadObj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const dataToSign = `${b64Header}.${b64Payload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
  const b64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${dataToSign}.${b64Signature}`;
}

async function verifySessionToken(token: string, secret: string): Promise<{ valid: boolean; payload?: any }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const [b64Header, b64Payload, b64Signature] = parts;
    const dataToSign = `${b64Header}.${b64Payload}`;
    const enc = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Reconstruir binario de la firma
    const binarySig = atob(b64Signature.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(dataToSign));
    if (!isValid) return { valid: false };

    const payloadJson = atob(b64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    // Comprobar expiración
    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch (_e) {
    return { valid: false };
  }
}

serve(async (req) => {
  // Manejo de preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown-ip";

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://gkbzabubivjfzlefcnnq.supabase.co";
    const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") || "";
    const adminPassword = Deno.env.get("ADMIN_PASSWORD") || "";

    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const action = body.action || url.searchParams.get("action");

    // =========================================================================
    // ENDPOINT: VALIDACIÓN DE ACCESO MAYORISTA MEDIANTE CONTRASEÑA
    // =========================================================================
    if (action === "verify_wholesale_password") {
      const inputPass = (body.password || "").trim();
      const configuredWholesalePass = Deno.env.get("WHOLESALE_PASSWORD") || "CV-MAYORISTA-2026";

      if (inputPass.toUpperCase() === configuredWholesalePass.toUpperCase()) {
        const sessionHours = 24;
        const expiresAt = Date.now() + sessionHours * 60 * 60 * 1000;
        const payload = {
          role: "wholesale_distributor",
          sub: "capital_vape_wholesale",
          iat: Date.now(),
          exp: expiresAt,
        };
        const tokenSecret = secretKey || configuredWholesalePass;
        const wholesaleToken = await signSessionToken(payload, tokenSecret);

        return new Response(
          JSON.stringify({
            ok: true,
            token: wholesaleToken,
            expires_at: expiresAt,
            message: "Acceso mayorista concedido con éxito.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Contraseña mayorista incorrecta. Solicítala vía WhatsApp oficial.",
          }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // =========================================================================
    // ENDPOINT: LOGIN ADMINISTRATIVO (Valida contraseña única y emite sesión)
    // =========================================================================
    if (action === "login") {
      if (isIpLocked(clientIp)) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Demasiados intentos fallidos. Acceso bloqueado temporalmente por seguridad.",
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const inputPassword = body.password || "";
      const configuredPassword = adminPassword || "AdminCapitalVape2026#";

      if (!inputPassword || inputPassword !== configuredPassword) {
        recordFailedAttempt(clientIp);
        return new Response(
          JSON.stringify({ ok: false, error: "Contraseña administrativa incorrecta." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Contraseña correcta: limpiar intentos fallidos y firmar token
      clearFailedAttempts(clientIp);
      const sessionDurationHours = 8;
      const expiresAt = Date.now() + sessionDurationHours * 60 * 60 * 1000;
      const payload = {
        role: "admin",
        sub: "capital_vape_admin",
        iat: Date.now(),
        exp: expiresAt,
      };

      const tokenSecret = secretKey || configuredPassword;
      const sessionToken = await signSessionToken(payload, tokenSecret);

      return new Response(
        JSON.stringify({
          ok: true,
          token: sessionToken,
          expires_at: expiresAt,
          message: "Autenticación administrativa exitosa.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =========================================================================
    // VALIDACIÓN DE SESIÓN ADMINISTRATIVA PARA TODAS LAS ACCIONES PROTEGIDAS
    // =========================================================================
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim() || body.token;

    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: "No autorizado. Se requiere token de sesión administrativa." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenSecret = secretKey || adminPassword || "AdminCapitalVape2026#";
    const verification = await verifySessionToken(token, tokenSecret);

    if (!verification.valid) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sesión inválida o expirada. Por favor ingresa nuevamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cliente con permisos de servicio (Server-side bypass de RLS)
    const adminSupabase = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false },
    });

    // =========================================================================
    // ACCIONES ADMINISTRATIVAS PROTEGIDAS
    // =========================================================================

    // 1. Obtener listado completo de productos (incluyendo ocultos y descontinuados)
    if (action === "get_admin_products") {
      const { data, error } = await adminSupabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, products: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Actualizar producto y registrar auditoría
    if (action === "update_product") {
      const { id, slug, updates, reason } = body;
      const targetIdentifier = id ? { id } : { slug };

      // Obtener producto actual para auditoría
      const { data: currentRows } = await adminSupabase
        .from("products")
        .select("*")
        .match(targetIdentifier)
        .limit(1);

      const current = currentRows && currentRows[0];

      // Actualizar en products
      const { data: updatedProd, error: updateError } = await adminSupabase
        .from("products")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .match(targetIdentifier)
        .select()
        .single();

      if (updateError) throw updateError;

      // Registrar auditoría de precio si cambió
      if (
        current &&
        (updates.price !== undefined || updates.price_two_units !== undefined || updates.wholesale_prices !== undefined)
      ) {
        await adminSupabase.from("price_history").insert({
          product_id: updatedProd.id,
          old_price: current.price,
          new_price: updatedProd.price,
          old_price_two_units: current.price_two_units,
          new_price_two_units: updatedProd.price_two_units,
          old_wholesale_prices: current.wholesale_prices,
          new_wholesale_prices: updatedProd.wholesale_prices,
          admin_user: "Administrador",
          change_reason: reason || "Actualización desde panel administrativo",
          changed_at: new Date().toISOString(),
        });
      }

      // Registrar auditoría de inventario si cambió
      if (current && updates.stock !== undefined && current.stock !== updates.stock) {
        await adminSupabase.from("inventory_history").insert({
          product_id: updatedProd.id,
          old_stock: current.stock,
          new_stock: updatedProd.stock,
          change_reason: reason || "Ajuste de inventario en panel administrativo",
          admin_user: "Administrador",
          changed_at: new Date().toISOString(),
        });
      }

      return new Response(JSON.stringify({ ok: true, product: updatedProd }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Crear nuevo producto
    if (action === "create_product") {
      const { product, reason } = body;
      const { data: newProd, error: insertError } = await adminSupabase
        .from("products")
        .insert([product])
        .select()
        .single();

      if (insertError) throw insertError;

      // Historial inicial
      await adminSupabase.from("price_history").insert({
        product_id: newProd.id,
        old_price: null,
        new_price: newProd.price,
        old_price_two_units: null,
        new_price_two_units: newProd.price_two_units,
        old_wholesale_prices: null,
        new_wholesale_prices: newProd.wholesale_prices,
        admin_user: "Administrador",
        change_reason: reason || "Creación inicial de producto",
        changed_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ ok: true, product: newProd }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Eliminación lógica (Descontinuar)
    if (action === "delete_product") {
      const { id, slug, reason } = body;
      const targetIdentifier = id ? { id } : { slug };

      const { data: deleted, error } = await adminSupabase
        .from("products")
        .update({
          availability: "discontinued",
          updated_at: new Date().toISOString(),
        })
        .match(targetIdentifier)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ ok: true, product: deleted }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Reactivar producto
    if (action === "restore_product") {
      const { id, slug } = body;
      const targetIdentifier = id ? { id } : { slug };

      const { data: restored, error } = await adminSupabase
        .from("products")
        .update({
          availability: "available",
          updated_at: new Date().toISOString(),
        })
        .match(targetIdentifier)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ ok: true, product: restored }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Consultar historial de precios de un producto
    if (action === "get_price_history") {
      const { product_id } = body;
      const { data, error } = await adminSupabase
        .from("price_history")
        .select("*")
        .eq("product_id", product_id)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, history: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Consultar historial de inventario
    if (action === "get_inventory_history") {
      const { product_id } = body;
      const { data, error } = await adminSupabase
        .from("inventory_history")
        .select("*")
        .eq("product_id", product_id)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, history: data }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: `Acción desconocida: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message || "Error interno del servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
