import React, { useEffect, useMemo, useState } from "react";
import { useGigNova } from "./context/GigNovaContext";
import "./PaymentCenter.css";

const API_URL = "https://jsonplaceholder.typicode.com/posts";
const STORAGE_KEY = "gignovaMockApiPayments";
const same = (a, b) => a != null && b != null && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
const currencyOf = (item) => {
  const code = item?.currency || item?.bidCurrency || item?.budgetCurrency;
  if (code === "USD" || code === "INR") return code;
  return String(item?.budget || "").includes("$") ? "USD" : "INR";
};
const money = (value, currency = "INR") => {
  if (value == null || value === "") return "Not specified";
  const n = Number(value);
  if (!Number.isFinite(n)) return "Not specified";
  const code = currency === "USD" ? "USD" : "INR";
  return new Intl.NumberFormat(code === "USD" ? "en-US" : "en-IN", {
    style: "currency", currency: code, maximumFractionDigits: 2,
  }).format(n);
};
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-IN");
};
const loadHistory = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};
const makeTransactionId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `GN-DEMO-${crypto.randomUUID().slice(0, 12)}`;
  }
  return `GN-DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};
// Format-only check. Never use real UPI credentials in this demo.
const isValidDemoUpi = (value) => /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(value);

export default function PaymentCenter() {
  const { user, projects = [], getPaymentQuote } = useGigNova();
  const [selectedId, setSelectedId] = useState(null);
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [demoBank, setDemoBank] = useState("SBI");
  const [transactions, setTransactions] = useState(loadHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiResult, setApiResult] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }
    catch { setError("Unable to save demo payment history."); }
  }, [transactions]);

  const clientProjects = useMemo(() => {
    if (!user) return [];
    return projects.filter((project) =>
      (same(project.clientId, user.id) || same(project.clientId, user.email) ||
        (project.clientEmail != null && same(project.clientEmail, user.email))) &&
      project.status === "completed"
    );
  }, [projects, user]);

  const selectedProject = clientProjects.find((p) => same(p.id, selectedId)) || clientProjects[0] || null;
  const quote = selectedProject ? getPaymentQuote?.(selectedProject.id) : null;
  const selectedCurrency = currencyOf(selectedProject);
  const clientKey = String(user?.email || user?.id || "").trim().toLowerCase();

  const myTransactions = useMemo(() => transactions.filter((item) =>
    same(item.clientKey, clientKey) && clientProjects.some((project) => same(project.id, item.projectId))
  ), [transactions, clientKey, clientProjects]);

  const existingPayment = selectedProject ? myTransactions.find((item) =>
    same(item.projectId, selectedProject.id) && item.status === "demo_success"
  ) : null;

  const filteredHistory = myTransactions.filter((item) =>
    String(item.projectTitle || "").toLowerCase().includes(search.toLowerCase()) ||
    String(item.transactionId || "").toLowerCase().includes(search.toLowerCase())
  );

  const totals = myTransactions.reduce((result, item) => {
    const currency = currencyOf(item);
    result[currency] += Number(item.amount) || 0;
    return result;
  }, { INR: 0, USD: 0 });

  const handlePayment = async () => {
    if (!selectedProject || !quote || loading) return;
    if (existingPayment) { setError("This project already has a demo payment."); return; }
    if (method === "upi" && !isValidDemoUpi(upiId.trim())) {
      setError("Enter a valid fictional UPI ID, for example demo@upi."); return;
    }
    const amount = Number(quote.total);
    if (!Number.isFinite(amount) || amount <= 0) { setError("Invalid payment amount."); return; }

    setLoading(true);
    setError("");
    setApiResult(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      // No personal payment details are sent to JSONPlaceholder.
      const payload = {
        title: "GigNova Demo Payment",
        body: JSON.stringify({
          projectId: selectedProject.id,
          amount,
          currency: selectedCurrency,
          method,
          mode: "demo",
          paymentOption: method === "netbanking" ? demoBank : method === "upi" ? "demo_upi" : "demo_card",
        }),
        userId: 1,
      };
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`API request failed: HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.id == null) throw new Error("Unexpected mock API response.");

      const transaction = {
        transactionId: makeTransactionId(),
        apiReferenceId: data.id,
        projectId: selectedProject.id,
        projectTitle: selectedProject.title,
        clientKey,
        freelancerName: selectedProject.freelancerName || "Freelancer",
        amount,
        base: Number(quote.base || 0),
        lateFee: Number(quote.lateFee || 0),
        currency: selectedCurrency,
        method,
        demoBank: method === "netbanking" ? demoBank : null,
        status: "demo_success",
        paymentMode: "mock_api",
        createdAt: new Date().toISOString(),
      };
      setTransactions((previous) => previous.some((item) =>
        same(item.projectId, transaction.projectId) && same(item.clientKey, transaction.clientKey) &&
        item.status === "demo_success"
      ) ? previous : [transaction, ...previous]);
      setApiResult({ status: response.status, id: data.id });
      setUpiId("");
    } catch (err) {
      setError(err.name === "AbortError" ? "API request timed out. Please try again." : err.message || "Network request failed.");
    } finally { clearTimeout(timeout); setLoading(false); }
  };

  const printReceipt = (transaction) => {
    if (!transaction) return;
    const win = window.open("", "_blank", "width=850,height=700");
    if (!win) { setError("Allow popups to print the demo receipt."); return; }
    const doc = win.document;
    doc.title = "GigNova Demo Receipt";
    const style = doc.createElement("style");
    style.textContent = `body{font-family:Arial,sans-serif;padding:40px;color:#263b2e}h1{color:#398b58}.row{display:flex;justify-content:space-between;gap:20px;padding:14px 0;border-bottom:1px solid #e5ece6}.row strong{overflow-wrap:anywhere;text-align:right}.notice{background:#fff3dc;padding:16px;border-radius:10px;margin-top:25px;line-height:1.6}`;
    doc.head.appendChild(style);
    const title = doc.createElement("h1"); title.textContent = "GigNova"; doc.body.appendChild(title);
    const subtitle = doc.createElement("h2"); subtitle.textContent = "Demo Payment Receipt"; doc.body.appendChild(subtitle);
    const addRow = (label, value) => {
      const row = doc.createElement("div"); row.className = "row";
      const left = doc.createElement("span"); left.textContent = label;
      const right = doc.createElement("strong"); right.textContent = String(value ?? "—");
      row.append(left, right); doc.body.appendChild(row);
    };
    const code = currencyOf(transaction);
    addRow("Project", transaction.projectTitle);
    addRow("Project ID", transaction.projectId);
    addRow("Transaction ID", transaction.transactionId);
    addRow("Mock API Reference", transaction.apiReferenceId);
    addRow("Method", String(transaction.method || "").toUpperCase());
    addRow("Currency", code);
    addRow("Project Amount", money(transaction.base, code));
    addRow("Late Fee", money(transaction.lateFee, code));
    addRow("Total Amount", money(transaction.amount, code));
    addRow("Date", formatDate(transaction.createdAt));
    addRow("Status", "DEMO SUCCESS");
    const notice = doc.createElement("p"); notice.className = "notice";
    notice.textContent = "Educational demo only. No real money was transferred. This document is not proof of a real payment.";
    doc.body.appendChild(notice);
    win.focus(); win.print();
  };

  const selectProject = (id) => {
    if (loading) return;
    setSelectedId(id); setError(""); setApiResult(null); setUpiId("");
  };

  return (
    <div className="gn-payment-page">
      <header className="gn-payment-heading">
        <div>
          <span className="gn-payment-eyebrow">GIGNOVA FINANCE</span>
          <h1>Payment Center</h1>
          <p>API-powered demo checkout and transaction history</p>
        </div>
        <span className="gn-demo-badge">DEMO MODE · NO REAL MONEY</span>
      </header>

      <div className="gn-stats-grid">
        <div className="gn-stat-card">
          <span>Approved Projects</span><h2>{clientProjects.length}</h2><small>Ready for demo checkout</small>
        </div>
        <div className="gn-stat-card">
          <span>Demo Transactions</span><h2>{myTransactions.length}</h2><small>Mock API simulations</small>
        </div>
        <div className="gn-stat-card">
          <span>Total Demo Amount</span>
          <h2>{money(totals.INR, "INR")}</h2>
          <h2>{money(totals.USD, "USD")}</h2>
          <small>Separate currency totals · Not real earnings</small>
        </div>
      </div>

      <div className="gn-payment-layout">
        <aside className="gn-payment-panel">
          <h3>Approved Projects</h3>
          {clientProjects.length === 0 ? (
            <p className="gn-payment-muted">No approved projects found.</p>
          ) : clientProjects.map((project) => (
            <button key={project.id} type="button"
              className={"gn-payment-project " + (same(project.id, selectedProject?.id) ? "active" : "")}
              onClick={() => selectProject(project.id)} disabled={loading}>
              <strong>{project.title}</strong>
              <small>Freelancer: {project.freelancerName || "Assigned"}</small>
              <small>Currency: {currencyOf(project)}</small>
              <span>{myTransactions.some((item) => same(item.projectId, project.id) && item.status === "demo_success")
                ? "✓ Demo Payment Done" : "✓ Work Approved"}</span>
            </button>
          ))}
        </aside>

        <main className="gn-payment-panel">
          {!selectedProject ? (
            <div className="gn-payment-empty">
              <h2>No Invoice Available</h2>
              <p>Approve freelancer work first to enable demo payment.</p>
            </div>
          ) : (
            <>
              <div className="gn-payment-invoice-top">
                <div>
                  <span className="gn-payment-eyebrow">PROJECT INVOICE</span>
                  <h2>{selectedProject.title}</h2>
                  <p>ID: {selectedProject.id}</p>
                </div>
                <span className="gn-payment-status">Work Approved ✓</span>
              </div>
              <div className="gn-payment-details">
                <div><span>Client</span><strong>{selectedProject.clientName || "Client"}</strong></div>
                <div><span>Freelancer</span><strong>{selectedProject.freelancerName || "Freelancer"}</strong></div>
                <div><span>Currency</span><strong>{selectedCurrency}</strong></div>
              </div>
              <div className="gn-payment-summary">
                <div><span>Project Amount</span><strong>{money(quote?.base, selectedCurrency)}</strong></div>
                <div><span>Late Fee</span><strong>{money(quote?.lateFee, selectedCurrency)}</strong></div>
                <div className="gn-payment-total">
                  <span>Total Payable</span><strong>{money(quote?.total, selectedCurrency)}</strong>
                </div>
              </div>
              {existingPayment ? (
                <div className="gn-payment-success">
                  <div className="gn-success-icon">✓</div>
                  <h3>Demo Payment Successful!</h3>
                  <p>Mock API request completed successfully. No real money was transferred.</p>
                  <div className="gn-transaction-details">
                    <div><span>Transaction ID</span><strong>{existingPayment.transactionId}</strong></div>
                    <div><span>Method</span><strong>{String(existingPayment.method || "").toUpperCase()}</strong></div>
                    <div><span>Amount</span><strong>{money(existingPayment.amount, currencyOf(existingPayment))}</strong></div>
                    <div><span>Date</span><strong>{formatDate(existingPayment.createdAt)}</strong></div>
                  </div>
                  <button type="button" className="gn-payment-secondary" onClick={() => printReceipt(existingPayment)}>
                    🧾 Download Demo Receipt
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="gn-method-title">Choose Demo Payment Method</h3>
                  <div className="gn-method-grid">
                    {[
                      { key: "upi", icon: "📱", label: "UPI" },
                      { key: "card", icon: "💳", label: "Card" },
                      { key: "netbanking", icon: "🏦", label: "Netbanking" },
                    ].map((option) => (
                      <button key={option.key} type="button" disabled={loading}
                        className={"gn-method-card " + (method === option.key ? "selected" : "")}
                        onClick={() => { setMethod(option.key); setError(""); }}>
                        <span>{option.icon}</span><strong>{option.label}</strong><small>Demo</small>
                      </button>
                    ))}
                  </div>
                  {method === "upi" && (
                    <div className="gn-method-form">
                      <h4>Pay with Demo UPI</h4><label htmlFor="gn-upi-id">Demo UPI ID</label>
                      <input id="gn-upi-id" type="text" value={upiId} disabled={loading}
                        onChange={(e) => setUpiId(e.target.value)} placeholder="demo@upi" autoComplete="off" maxLength={60} />
                      <p>Enter a fictional UPI ID such as <strong>demo@upi</strong>. Do not enter your real UPI ID.</p>
                    </div>
                  )}
                  {method === "card" && (
                    <div className="gn-method-form">
                      <h4>Demo Card Payment</h4>
                      <p>This simulates a card payment. No real card number, expiry date or CVV is required.</p>
                      <div className="gn-demo-card"><span>GIGNOVA DEMO CARD</span><strong>•••• •••• •••• DEMO</strong><small>TEST PAYMENT ONLY</small></div>
                    </div>
                  )}
                  {method === "netbanking" && (
                    <div className="gn-method-form">
                      <h4>Demo Netbanking</h4><label htmlFor="gn-demo-bank">Select Demo Bank</label>
                      <select id="gn-demo-bank" value={demoBank} disabled={loading} onChange={(e) => setDemoBank(e.target.value)}>
                        <option value="SBI">SBI — Demo</option><option value="HDFC">HDFC — Demo</option>
                        <option value="ICICI">ICICI — Demo</option><option value="Axis">Axis — Demo</option>
                      </select>
                      <p>No bank login or real transaction will take place.</p>
                    </div>
                  )}
                  <div className="gn-payment-security">
                    <span>🔌</span>
                    <div><strong>Mock API Integration</strong>
                      <p>Sends a real HTTP POST request to JSONPlaceholder. It does not process real payments.</p>
                    </div>
                  </div>
                  {error && <div className="gn-api-error" role="alert">⚠ {error}</div>}
                  <button type="button" className="gn-payment-primary" disabled={loading || !quote} onClick={handlePayment}>
                    {loading ? <><span className="gn-spinner" />Connecting to Mock API...</> :
                      <>Simulate {method.toUpperCase()} Payment {money(quote?.total, selectedCurrency)} →</>}
                  </button>
                </>
              )}
              {apiResult && (
                <div className="gn-api-response">
                  <h4>API Response</h4>
                  <div><span>HTTP Status</span><strong>{apiResult.status}</strong></div>
                  <div><span>Mock Resource ID</span><strong>{apiResult.id}</strong></div>
                  <div><span>Endpoint</span><code>{API_URL}</code></div>
                </div>
              )}
              <p className="gn-payment-disclaimer">Educational demonstration only. No real money is transferred.</p>
            </>
          )}
        </main>
      </div>

      <section className="gn-payment-panel gn-payment-history">
        <div className="gn-history-heading">
          <div><h2>Transaction History</h2><p>Browser-saved mock API transactions</p></div>
          <span className="gn-demo-badge">MOCK API</span>
        </div>
        <div className="gn-history-filters">
          <input type="text" placeholder="Search project or transaction ID..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        {filteredHistory.length === 0 ? (
          <div className="gn-history-empty">No demo transactions found.</div>
        ) : (
          <div className="gn-payment-table-wrap">
            <table>
              <thead><tr><th>Transaction ID</th><th>Project</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th><th>Receipt</th></tr></thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.transactionId}>
                    <td><code>{item.transactionId}</code></td>
                    <td>{item.projectTitle}</td>
                    <td>{String(item.method || "").toUpperCase()}</td>
                    <td>{money(item.amount, currencyOf(item))}</td>
                    <td><span className="gn-history-status">Demo Success</span></td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td><button type="button" className="gn-receipt-btn" onClick={() => printReceipt(item)}>Receipt</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
