import React, { useEffect, useMemo, useState } from "react";
import { useGigNova } from "./context/GigNovaContext";
import "./FreelancerEarnings.css";

const STORAGE_KEY = "gignovaMockApiPayments";
const same = (a, b) => a != null && b != null && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
const currencyOf = (item = {}) => {
  const explicit = String(item.currency || item.bidCurrency || item.budgetCurrency || "").toUpperCase();
  if (explicit === "USD" || explicit === "INR") return explicit;
  return String(item.budget || "").includes("$") ? "USD" : "INR";
};
const amountOf = (value) => {
  const n = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const money = (value, currency = "INR") => new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value) || 0);
const readHistory = () => {
  try {
    const result = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(result) ? result : [];
  } catch { return []; }
};
const dateLabel = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString("en-IN");
};

export default function FreelancerEarnings() {
  const { user, projects = [], payments = [] } = useGigNova();
  const [transactions, setTransactions] = useState(readHistory);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setTransactions(readHistory());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const rows = useMemo(() => projects.filter((project) =>
    user && (same(project.freelancerId, user.id) || same(project.freelancerId, user.email) || same(project.freelancerEmail, user.email))
  ).map((project) => {
    const transaction = transactions.find((item) => same(item.projectId, project.id) && item.status === "demo_success");
    const contextPayment = payments.find((item) => same(item.projectId, project.id) && item.status === "paid");
    const paid = Boolean(transaction || contextPayment);
    const currency = currencyOf(transaction || contextPayment || project);
    const amount = paid ? amountOf(transaction?.amount ?? contextPayment?.amount) : amountOf(project.budgetAmount ?? project.budget);
    return { project, transaction, contextPayment, paid, currency, amount };
  }), [projects, user, transactions, payments]);

  const visible = rows.filter(({ project, paid }) =>
    (filter === "all" || (filter === "paid" ? paid : !paid)) &&
    [project.title, project.clientName, project.id].some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))
  );
  const totalFor = (currency, paid) => rows.filter((r) => r.currency === currency && r.paid === paid).reduce((sum, r) => sum + r.amount, 0);

  return (
    <main className="gn-earnings-page">
      <header className="gn-earnings-header">
        <span className="gn-earnings-eyebrow">GIGNOVA FINANCE</span>
        <h1>Freelancer Earnings</h1>
        <p>Track your project payments and pending amounts. Demo data only — no real money is transferred.</p>
      </header>

      <div className="gn-earnings-stats">
        <div className="gn-earnings-stat"><span>Received · INR</span><strong>{money(totalFor("INR", true), "INR")}</strong></div>
        <div className="gn-earnings-stat"><span>Received · USD</span><strong>{money(totalFor("USD", true), "USD")}</strong></div>
        <div className="gn-earnings-stat"><span>Pending · INR</span><strong>{money(totalFor("INR", false), "INR")}</strong></div>
        <div className="gn-earnings-stat"><span>Pending · USD</span><strong>{money(totalFor("USD", false), "USD")}</strong></div>
      </div>

      <section className="gn-earnings-panel">
        <div className="gn-earnings-toolbar">
          <div className="gn-earnings-filters">
            {["all", "pending", "paid"].map((value) => (
              <button key={value} type="button" className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>
            ))}
          </div>
          <input aria-label="Search earnings" placeholder="Search project or client..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {visible.length === 0 ? (
          <div className="gn-earnings-empty">No matching projects found. Accepted proposals and direct hires will appear here.</div>
        ) : (
          <div className="gn-earnings-table-wrap">
            <table className="gn-earnings-table">
              <thead><tr><th>Project</th><th>Client</th><th>Project Status</th><th>Amount</th><th>Demo Payment</th><th>Date</th></tr></thead>
              <tbody>{visible.map(({ project, transaction, contextPayment, paid, currency, amount }) => (
                <tr key={project.id}>
                  <td><strong>{project.title}</strong><small>{project.id}</small></td>
                  <td>{project.clientName || "Client"}</td>
                  <td>{String(project.status || "—").replace(/_/g, " ")}</td>
                  <td>{money(amount, currency)}</td>
                  <td><span className={paid ? "gn-earnings-paid" : "gn-earnings-pending"}>{paid ? "Demo Paid" : "Pending"}</span></td>
                  <td>{dateLabel(transaction?.createdAt || contextPayment?.paidAt || project.createdAt)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
      <p className="gn-earnings-footnote">Pending amounts are estimates from project budgets; hourly work and late fees may change the final amount. Payment records are browser-local demonstrations, not verified transfers.</p>
    </main>
  );
}
