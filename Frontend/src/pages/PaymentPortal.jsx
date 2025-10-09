import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createPayment, updatePaymentStatus } from "../services/paymentService.js";

export default function CreatePayment() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    amount: "",
    currency: "ZAR",
    paymentMethod: "bank_transfer",
    description: "",
  });

  const [message, setMessage] = useState(""); // success message
  const [error, setError] = useState(""); // error message
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedCurrencies = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "ZAR", label: "ZAR" },
    { value: "GBP", label: "GBP" },
  ];

  const paymentMethods = [
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "paypal", label: "PayPal" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "mobile_wallet", label: "Mobile Wallet" },
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const preset = location.state?.presetPayment;
    if (!preset) return;

    setFormData((current) => ({
      amount: preset.amount != null ? String(preset.amount) : current.amount,
      currency: preset.currency || current.currency,
      paymentMethod: preset.paymentMethod || current.paymentMethod,
      description: preset.description || current.description,
    }));
  }, [location.state]);

  if (!isAuthenticated || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = name === "description" ? value.replace(/[<>]/g, "") : value;
    setFormData((s) => ({ ...s, [name]: sanitizedValue }));
    setMessage("");
    setError("");
  };

  const handleCancel = () => {
    // Back to previous or dashboard
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const amountNum = Number.parseFloat(formData.amount);

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("Amount must be a number greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createPayment({
        amount: amountNum,
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
      });

      const paymentId = response?.data?.data?._id;
      const transactionId = response?.data?.data?.transactionId;

      if (paymentId) {
        try {
          await updatePaymentStatus(paymentId, "completed");
        } catch (statusErr) {
          console.warn("Unable to auto-complete payment status", statusErr);
        }
      }

      const amountDisplay = `${formData.currency} ${amountNum.toFixed(2)}`;
      const referenceDisplay = transactionId ? ` Reference: ${transactionId}` : "";
      setMessage(`✅ Payment completed. ${amountDisplay} processed securely.${referenceDisplay}`);
      setFormData({ amount: "", currency: "ZAR", paymentMethod: "bank_transfer", description: "" });
    } catch (err) {
      console.error("Create payment error", err);
      const msg = err?.response?.data?.message || err.message || "Failed to create payment";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="payment-portal">
      <style>{`
        :root {
          --color-bg: #f6f5ff;
          --color-surface: #ffffff;
          --color-primary: #6c4ee6;
          --color-secondary: #f3f0ff;
          --color-danger: #ef4444;
          --color-success: #10b981;
          --color-muted: #6b7280;
          --color-border: #e5e7eb;
          --radius-lg: 20px;
          --radius-md: 12px;
          --shadow-soft: 0 20px 45px rgba(79, 70, 229, 0.18);
          --shadow-card: 0 12px 32px rgba(15, 23, 42, 0.08);
        }

        .payment-portal {
          min-height: 100vh;
          background: var(--color-bg);
          padding: 48px 64px 72px;
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0f172a;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .payment-portal__header {
          text-align: center;
          margin-bottom: 28px;
          max-width: 660px;
        }

        .payment-portal__header h1 {
          font-size: 2.4rem;
          font-weight: 800;
          margin-bottom: 6px;
          color: #0f172a;
        }

        .payment-portal__header p {
          color: var(--color-muted);
        }

        .payment-portal__card {
          width: 100%;
          max-width: 720px;
          background: linear-gradient(145deg, #ffffff 0%, #f1efff 100%);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-soft);
          padding: 36px;
          animation: fadeInUp 0.5s ease;
        }

        .summary-row {
          display: flex;
          gap: 18px;
          margin-bottom: 18px;
          align-items: center;
          justify-content: space-between;
        }

        .account-details {
          background: #fbfbff;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          color: var(--color-muted);
          display: flex;
          gap: 18px;
          align-items: center;
        }

        .form {
          display: grid;
          gap: 18px;
        }

        .form__field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.95rem;
        }

        .form__field label {
          color: #0f172a;
          font-weight: 600;
        }

        .form__field input,
        .form__field select,
        .form__field textarea {
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          font-size: 0.95rem;
          background: #fbfbff;
          transition: border 0.18s ease, box-shadow 0.18s ease;
        }

        .form__field textarea {
          resize: vertical;
          min-height: 84px;
        }

        .form__field input:focus,
        .form__field select:focus,
        .form__field textarea:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(108, 78, 230, 0.18);
          outline: none;
        }

        .form__actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 6px;
        }

        .btn {
          border: none;
          border-radius: 999px;
          padding: 12px 24px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          font-size: 0.95rem;
        }

        .btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn--primary {
          background: linear-gradient(135deg, var(--color-primary) 0%, #7c6bff 100%);
          color: var(--color-surface);
          box-shadow: 0 12px 24px rgba(79, 70, 229, 0.3);
        }

        .btn--primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 28px rgba(79, 70, 229, 0.32);
        }

        .btn--ghost {
          background: transparent;
          color: var(--color-primary);
          border: 1px solid rgba(108, 78, 230, 0.35);
        }

        .banner--success {
          background: rgba(16, 185, 129, 0.14);
          color: var(--color-success);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin-bottom: 16px;
          font-weight: 700;
          text-align: center;
        }

        .banner--error {
          background: rgba(239, 68, 68, 0.12);
          color: var(--color-danger);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin-bottom: 16px;
          font-weight: 700;
          text-align: center;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .payment-portal { padding: 36px 28px; }
          .payment-portal__card { padding: 28px; max-width: 640px; }
        }

        @media (max-width: 600px) {
          .payment-portal { padding: 24px 16px; }
          .payment-portal__card { padding: 20px; }
        }
      `}</style>

      <div className="payment-portal__header">
        <h1>Create Payment</h1>
        <p>Logged in as <strong>{user.fullName || user.accountNumber || "Customer"}</strong>. Use the form below to create a payment.</p>
      </div>

      {message && <div className="banner--success">{message}</div>}
      {error && <div className="banner--error">{error}</div>}

      <div className="payment-portal__card">
        <div className="summary-row" style={{ marginBottom: 14 }}>
          <div className="account-details">
            <div>
              <div style={{ fontWeight: 700 }}>{user.accountNumber || "—"}</div>
              <div style={{ fontSize: 13, color: "var(--color-muted)" }}>Account Number</div>
            </div>
            <div style={{ marginLeft: 8 }}>
              <div style={{ fontWeight: 700 }}>{user.idNumber || "—"}</div>
              <div style={{ fontSize: 13, color: "var(--color-muted)" }}>User ID</div>
            </div>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form__field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form__field">
            <label htmlFor="currency">Currency</label>
            <select id="currency" name="currency" value={formData.currency} onChange={handleChange}>
              {allowedCurrencies.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form__field">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form__field">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add an optional note..."
            />
          </div>

          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}