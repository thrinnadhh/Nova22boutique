import { supabase } from "./supabase-client.js";
import { logout, requireRole } from "./auth-helpers.js";

const statProducts = document.getElementById("statProducts");
const statLowStock = document.getElementById("statLowStock");
const statOrdersToday = document.getElementById("statOrdersToday");
const statCoupons = document.getElementById("statCoupons");
const ordersTbody = document.getElementById("ordersTbody");
const adminName = document.getElementById("adminName");

document.getElementById("logoutBtn")?.addEventListener("click", logout);

const profile = await requireRole(["admin", "superadmin"]);
if (!profile) throw new Error("Unauthorized");
if (adminName) adminName.textContent = profile.full_name || "Admin";

let shopId = null;
if (profile.role === "admin") {
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("admin_id", profile.id)
    .maybeSingle();
  shopId = shop?.id || null;
}

const productsQuery = supabase.from("products").select("id", { count: "exact", head: true });
if (shopId) productsQuery.eq("shop_id", shopId);
const { count: productCount } = await productsQuery;
if (statProducts) statProducts.textContent = String(productCount ?? 0);

const lowStockQuery = supabase
  .from("products")
  .select("id", { count: "exact", head: true })
  .lte("stock_quantity", 10);
if (shopId) lowStockQuery.eq("shop_id", shopId);
const { count: lowStockCount } = await lowStockQuery;
if (statLowStock) statLowStock.textContent = String(lowStockCount ?? 0);

const todayIso = new Date();
todayIso.setHours(0, 0, 0, 0);
const { count: ordersToday } = await supabase
  .from("orders")
  .select("id", { count: "exact", head: true })
  .gte("created_at", todayIso.toISOString());
if (statOrdersToday) statOrdersToday.textContent = String(ordersToday ?? 0);

const { count: couponCount } = await supabase
  .from("coupons")
  .select("id", { count: "exact", head: true })
  .eq("is_active", true);
if (statCoupons) statCoupons.textContent = String(couponCount ?? 0);

const ordersQuery = supabase
  .from("orders")
  .select("id, order_number, total_amount_inr, status, created_at")
  .order("created_at", { ascending: false })
  .limit(5);

const { data: orders } = await ordersQuery;

if (ordersTbody) {
  ordersTbody.innerHTML = "";
  for (const order of orders || []) {
    const tr = document.createElement("tr");
    tr.className = "border-t border-orange-50";
    tr.innerHTML = `
      <td class="px-5 py-4">${order.order_number || order.id}</td>
      <td class="px-5 py-4">-</td>
      <td class="px-5 py-4">-</td>
      <td class="px-5 py-4">INR ${Number(order.total_amount_inr || 0).toLocaleString("en-IN")}</td>
      <td class="px-5 py-4">${order.status || "pending"}</td>
    `;
    ordersTbody.appendChild(tr);
  }
}
