import { createClient } from "@supabase/supabase-js";

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);
  let rawBody = "";
  for await (const chunk of req) {
    rawBody += chunk;
    if (rawBody.length > 16_384) throw new Error("Ukuran permintaan terlalu besar.");
  }
  return JSON.parse(rawBody || "{}");
}

async function listUserStorageFiles(storage, folder, files = []) {
  let offset = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await storage
      .from("community-images")
      .list(folder, { limit, offset });
    if (error) throw error;
    for (const entry of data || []) {
      const path = `${folder}/${entry.name}`;
      if (entry.id === null) {
        await listUserStorageFiles(storage, path, files);
      } else {
        files.push(path);
      }
    }
    if (!data || data.length < limit) return files;
    offset += limit;
  }
}

async function handleAdminUsers(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Metode tidak diizinkan." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return sendJson(res, 503, {
      error:
        "Endpoint admin belum dikonfigurasi. Atur SUPABASE_URL, SUPABASE_ANON_KEY, dan SUPABASE_SERVICE_ROLE_KEY di server.",
    });
  }

  const authorization = req.headers.authorization || "";
  const accessToken = authorization.match(/^Bearer (.+)$/i)?.[1];
  if (!accessToken) return sendJson(res, 401, { error: "Sesi admin diperlukan." });

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } =
    await authClient.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return sendJson(res, 401, { error: "Sesi tidak valid atau sudah berakhir." });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: admin, error: adminError } = await adminClient
    .from("store_admins")
    .select("user_id")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (adminError) return sendJson(res, 500, { error: adminError.message });
  if (!admin) return sendJson(res, 403, { error: "Akses khusus admin toko." });

  let body;
  try {
    body = await readBody(req);
  } catch {
    return sendJson(res, 400, { error: "Isi permintaan tidak valid." });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return sendJson(res, 400, { error: "Isi permintaan tidak valid." });
  }

  const userId =
    typeof body.userId === "string" ? body.userId.trim().toLowerCase() : "";
  if (!userId) return sendJson(res, 400, { error: "ID pengguna wajib diisi." });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    return sendJson(res, 400, { error: "ID pengguna tidak valid." });
  }
  if (userId === authData.user.id) {
    return sendJson(res, 400, {
      error: "Akun admin yang sedang digunakan tidak dapat dihapus atau diedit di sini.",
    });
  }

  if (body.action === "delete") {
    const { data: protectedAdmin, error: targetAdminError } = await adminClient
      .from("store_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (targetAdminError)
      return sendJson(res, 500, { error: targetAdminError.message });
    if (protectedAdmin) {
      return sendJson(res, 400, {
        error: "Akun admin tidak dapat dihapus dari daftar pelanggan.",
      });
    }
    let userFiles;
    try {
      userFiles = await listUserStorageFiles(
        adminClient.storage,
        userId,
      );
    } catch (storageError) {
      return sendJson(res, 500, {
        error: `File unggahan akun gagal diperiksa, akun tidak dihapus: ${storageError.message}`,
      });
    }
    for (let index = 0; index < userFiles.length; index += 100) {
      const { error: storageError } = await adminClient.storage
        .from("community-images")
        .remove(userFiles.slice(index, index + 100));
      if (storageError) {
        return sendJson(res, 500, {
          error: `File unggahan akun gagal dihapus, akun belum dihapus. Sebagian file mungkin sudah terhapus: ${storageError.message}`,
        });
      }
    }
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return sendJson(res, 400, {
        error: `Akun gagal dihapus setelah ${userFiles.length} file unggahan terhapus: ${deleteError.message}`,
      });
    }
    return sendJson(res, 200, { ok: true });
  }

  if (body.action === "update") {
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!fullName || fullName.length > 80) {
      return sendJson(res, 400, {
        error: "Nama wajib diisi dan maksimal 80 karakter.",
      });
    }
    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return sendJson(res, 400, { error: "Format email tidak valid." });
    }

    const { data: existingUser, error: loadUserError } =
      await adminClient.auth.admin.getUserById(userId);
    if (loadUserError || !existingUser.user) {
      return sendJson(res, 404, {
        error: loadUserError?.message || "Pengguna tidak ditemukan.",
      });
    }
    const emailConfirmationRequired =
      existingUser.user.email?.toLowerCase() !== email;
    const userAttributes = {
      user_metadata: {
        ...existingUser.user.user_metadata,
        full_name: fullName,
      },
    };
    if (emailConfirmationRequired) userAttributes.email = email;
    const { error: authUpdateError } =
      await adminClient.auth.admin.updateUserById(userId, userAttributes);
    if (authUpdateError)
      return sendJson(res, 400, { error: authUpdateError.message });

    const { data: updatedProfile, error: profileError } = await adminClient
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId)
      .select("id")
      .maybeSingle();
    if (profileError || !updatedProfile) {
      return sendJson(res, 500, {
        error: `Akun autentikasi diperbarui, tetapi nama profil gagal disimpan: ${profileError?.message || "Profil tidak ditemukan."}`,
      });
    }
    return sendJson(res, 200, {
      ok: true,
      emailConfirmationRequired,
    });
  }

  return sendJson(res, 400, { error: "Aksi admin tidak dikenal." });
}

export default async function handler(req, res) {
  try {
    return await handleAdminUsers(req, res);
  } catch (error) {
    console.error("Admin user operation failed:", error);
    return sendJson(res, 500, {
      error: `Operasi admin gagal: ${error.message || "Silakan coba lagi."}`,
    });
  }
}
