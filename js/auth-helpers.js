import { supabase } from "./supabase-client.js";

export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getMyProfile() {
  const user = await getSessionUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, approved, is_active")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function requireRole(allowedRoles) {
  const profile = await getMyProfile();

  if (!profile) {
    window.location.href = "login.html";
    return null;
  }

  if (!allowedRoles.includes(profile.role)) {
    if (profile.role === "superadmin") {
      window.location.href = "superadmin.html";
    } else if (profile.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "index.html";
    }
    return null;
  }

  return profile;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}
