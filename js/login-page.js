import { supabase } from "./supabase-client.js";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const messageBox = document.getElementById("messageBox");

function showMessage(text, isError = false) {
  messageBox.textContent = text;
  messageBox.className = isError
    ? "mt-4 text-sm text-red-700"
    : "mt-4 text-sm text-emerald-700";
}

async function redirectByRole() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (!profile) {
    window.location.href = "index.html";
    return;
  }

  if (profile.role === "superadmin") {
    window.location.href = "superadmin.html";
  } else if (profile.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "index.html";
  }
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(loginForm);
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  showMessage("Login successful. Redirecting...");
  await redirectByRole();
});

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(signupForm);
  const fullName = String(form.get("full_name") || "").trim();
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  const requestedRole = String(form.get("role") || "customer");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        requested_role: requestedRole,
      },
    },
  });

  if (error) {
    showMessage(error.message, true);
    return;
  }

  showMessage("Signup successful. Check your email verification, then login.");
});

await redirectByRole();
