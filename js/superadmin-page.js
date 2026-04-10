import { supabase } from "./supabase-client.js";
import { logout, requireRole } from "./auth-helpers.js";

document.getElementById("logoutBtn")?.addEventListener("click", logout);

const profile = await requireRole(["superadmin"]);
if (!profile) throw new Error("Unauthorized");

const statShops = document.getElementById("statShops");
const statAdmins = document.getElementById("statAdmins");
const statPending = document.getElementById("statPending");
const statSuspended = document.getElementById("statSuspended");
const approvalsTbody = document.getElementById("approvalsTbody");

const { count: shopsCount } = await supabase
  .from("shops")
  .select("id", { count: "exact", head: true });
if (statShops) statShops.textContent = String(shopsCount ?? 0);

const { count: approvedAdminCount } = await supabase
  .from("profiles")
  .select("id", { count: "exact", head: true })
  .eq("role", "admin")
  .eq("approved", true);
if (statAdmins) statAdmins.textContent = String(approvedAdminCount ?? 0);

const { count: pendingCount } = await supabase
  .from("admin_requests")
  .select("id", { count: "exact", head: true })
  .eq("status", "pending");
if (statPending) statPending.textContent = String(pendingCount ?? 0);

const { count: suspendedCount } = await supabase
  .from("shops")
  .select("id", { count: "exact", head: true })
  .eq("status", "suspended");
if (statSuspended) statSuspended.textContent = String(suspendedCount ?? 0);

const { data: requests } = await supabase
  .from("admin_requests")
  .select("id, status, created_at, profiles:user_id(full_name, email)")
  .eq("status", "pending")
  .order("created_at", { ascending: false })
  .limit(8);

if (approvalsTbody) {
  approvalsTbody.innerHTML = "";
  for (const req of requests || []) {
    const profileInfo = req.profiles || {};
    const tr = document.createElement("tr");
    tr.className = "border-t border-orange-50";
    tr.innerHTML = `
      <td class="px-5 py-4">${profileInfo.full_name || "-"}</td>
      <td class="px-5 py-4">${profileInfo.email || "-"}</td>
      <td class="px-5 py-4">Pending Boutique</td>
      <td class="px-5 py-4 text-amber-700">${req.status}</td>
      <td class="px-5 py-4"><button class="text-orange-900 border-b border-orange-300">Review</button></td>
    `;
    approvalsTbody.appendChild(tr);
  }
}
