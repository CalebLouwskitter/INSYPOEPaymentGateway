import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createPayment, updatePaymentStatus } from "../services/paymentService.js";

export default function CreatePayment() {
  // Auth context provides user info and authentication status
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initial state for the form
  const createInitialFormState = () => ({
    amount: "",
    currency: "ZAR",
    paymentMethod: "bank_transfer",
    description: "",
    bankAccountNumber: "",
    bankReference: "",
    cardHolder: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [formData, setFormData] = useState(createInitialFormState);
  const [message, setMessage] = useState(""); // Success message
  const [error, setError] = useState(""); // General error message
  const [fieldErrors, setFieldErrors] = useState({}); // Validation errors per field
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Allowed currencies and payment methods
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

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill form if a preset payment was passed via location.state
  useEffect(() => {
    const preset = location.state?.presetPayment;
    if (!preset) return;

    setFormData((current) => ({
      ...current,
      amount: preset.amount != null ? String(preset.amount) : current.amount,
      currency: preset.currency || current.currency,
      paymentMethod: preset.paymentMethod || current.paymentMethod,
      description: preset.description || current.description,
    }));
  }, [location.state]);

  // Mask the national ID for privacy
  const maskedNationalId = useMemo(() => {
    if (!user?.nationalId) {
      return "—";
    }
    return user.nationalId.replace(/\d(?=\d{4})/g, "*");
  }, [user?.nationalId]);

  // Determine which input fields to show based on payment method
  const isCardPayment = formData.paymentMethod === "credit_card" || formData.paymentMethod === "debit_card";
  const isBankTransfer = formData.paymentMethod === "bank_transfer";

  // If user is not authenticated or data is not loaded, do not render form
  if (!isAuthenticated || !user) return null;

  // Handle form input changes with sanitization and validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Sanitize description
    if (name === "description") {
      sanitizedValue = value.replace(/[<>]/g, "").slice(0, 250);
    }

    // Sanitize amount input
    if (name === "amount") {
      const normalized = value.replace(/[^0-9.]/g, "");
      const parts = normalized.split(".");
      const cleaned = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : normalized;
      sanitizedValue = cleaned;
    }

    // Handle payment method change (reset irrelevant fields)
    if (name === "paymentMethod") {
      const allowedValues = paymentMethods.map((m) => m.value);
      if (!allowedValues.includes(value)) {
        return;
      }

      setFormData((current) => ({
        ...current,
        paymentMethod: value,
        ...(value === "bank_transfer"
          ? { cardHolder: "", cardNumber: "", cardExpiry: "", cardCvv: "" }
          : {}),
        ...(value === "credit_card" || value === "debit_card"
          ? { bankAccountNumber: "", bankReference: "" }
          : {}),
      }));
      setMessage("");
      setError("");
      setFieldErrors({});
      return;
    }

    // Sanitize card inputs
    if (name === "cardNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
      sanitizedValue = digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
    }

    if (name === "cardExpiry") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
      sanitizedValue = digitsOnly.length > 2
        ? `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
        : digitsOnly;
    }

    if (name === "cardCvv") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    if (name === "cardHolder") {
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, "").slice(0, 60);
    }

    // Sanitize bank inputs
    if (name === "bankAccountNumber") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 20);
    }

    if (name === "bankReference") {
      sanitizedValue = value.replace(/[<>]/g, "").slice(0, 35);
    }

    // Update state
    setFormData((s) => ({ ...s, [name]: sanitizedValue }));
    setMessage("");
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCancel = () => {
    // Back to previous or dashboard
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setFieldErrors({});

    const amountNum = Number.parseFloat(formData.amount);

    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setFieldErrors((prev) => ({ ...prev, amount: "Amount must be a number greater than zero." }));
      setError("Please correct the highlighted fields.");
      return;
    }

    // Ensure currency and payment method are from allowed lists to prevent tampering
    const isCurrencyAllowed = allowedCurrencies.some((c) => c.value === formData.currency);
    if (!isCurrencyAllowed) {
      setFieldErrors((prev) => ({ ...prev, currency: "Invalid currency selection." }));
      setError("Please correct the highlighted fields.");
      return;
    }

    const isMethodAllowed = paymentMethods.some((m) => m.value === formData.paymentMethod);
    if (!isMethodAllowed) {
      setFieldErrors((prev) => ({ ...prev, paymentMethod: "Invalid payment method selection." }));
      setError("Please correct the highlighted fields.");
      return;
    }

    const validationErrors = {};

    if (formData.paymentMethod === "credit_card" || formData.paymentMethod === "debit_card") {
      const digits = formData.cardNumber.replace(/\s/g, "");
      if (digits.length < 13 || digits.length > 16) {
        validationErrors.cardNumber = "Card number must be 13-16 digits.";
      }

      if (!/^[a-zA-Z\s'-]{3,}$/.test(formData.cardHolder)) {
        validationErrors.cardHolder = "Enter a valid cardholder name.";
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardExpiry)) {
        validationErrors.cardExpiry = "Use MM/YY format.";
      }

      if (!/^\d{3,4}$/.test(formData.cardCvv)) {
        validationErrors.cardCvv = "CVV must be 3 or 4 digits.";
      }
    }

    if (formData.paymentMethod === "bank_transfer") {
      const bankDigits = formData.bankAccountNumber.replace(/\D/g, "");
      if (bankDigits.length < 8 || bankDigits.length > 20) {
        validationErrors.bankAccountNumber = "Account number must be 8-20 digits.";
      }
      if (!formData.bankReference.trim()) {
        validationErrors.bankReference = "Reference is required for bank transfers.";
      }
    }

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted fields.");
      return;
    }

     // Submit payment
    setIsSubmitting(true);
    try {
      const sanitizedDescription = formData.description.trim();

      const metadata = {};

      if (formData.paymentMethod === "credit_card" || formData.paymentMethod === "debit_card") {
        const digits = formData.cardNumber.replace(/\s/g, "");
        metadata.cardHolder = formData.cardHolder.trim();
        metadata.cardLast4 = digits.slice(-4);
        metadata.cardBrand = formData.paymentMethod;
        metadata.cardExpiry = formData.cardExpiry;
      }

      if (formData.paymentMethod === "bank_transfer") {
        const bankDigits = formData.bankAccountNumber.replace(/\D/g, "");
        metadata.bankAccountMasked = bankDigits.replace(/\d(?=\d{4})/g, "*");
        metadata.bankReference = formData.bankReference.trim();
      }

      // Create payment via API
      const response = await createPayment({
        amount: amountNum,
        currency: formData.currency,
        paymentMethod: formData.paymentMethod,
        description: sanitizedDescription,
        metadata,
      });

      const paymentId = response?.data?.data?._id;
      const transactionId = response?.data?.data?.transactionId;

      // Attempt to mark payment as completed
      if (paymentId) {
        try {
          await updatePaymentStatus(paymentId, "completed");
        } catch (statusErr) {
          console.warn("Unable to auto-complete payment status", statusErr);
        }
      }

      // Show success message
      const amountDisplay = `${formData.currency} ${amountNum.toFixed(2)}`;
      const referenceDisplay = transactionId ? ` Reference: ${transactionId}` : "";
      setMessage(`Payment completed. ${amountDisplay} processed securely.${referenceDisplay}`);
      setFormData(createInitialFormState());
      setFieldErrors({});
      setError("");
    } catch (err) {
      console.error("Create payment error", err);
      const msg = err?.response?.data?.message || err.message || "Failed to create payment";
      if (err?.response?.data?.errors) {
        const apiErrors = err.response.data.errors.reduce((acc, current) => {
          if (current.param) {
            acc[current.param] = current.msg;
          }
          return acc;
        }, {});
        setFieldErrors(apiErrors);
        setError(err.response.data.message || "Please correct the highlighted fields.");
      } else {
        setError(msg);
      }
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

      {/* Success message banner */}
      {message && <div className="banner--success">{message}</div>}
      {/* Error message banner */}
      {error && <div className="banner--error">{error}</div>}

      {/* Card wrapper for the form and account summary */}
      <div className="payment-portal__card">
        <div className="summary-row" style={{ marginBottom: 14 }}>
          <div className="account-details">
            <div>
              <div style={{ fontWeight: 700 }}>{user.accountNumber || "—"}</div>
              <div style={{ fontSize: 13, color: "var(--color-muted)" }}>Account Number</div>
            </div>
            <div style={{ marginLeft: 8 }}>
              <div style={{ fontWeight: 700 }}>{maskedNationalId}</div>
              <div style={{ fontSize: 13, color: "var(--color-muted)" }}>National ID</div>
            </div>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {/* Amount input */}
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
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.amount)}
              aria-describedby={fieldErrors.amount ? "amount-error" : undefined}
            />
            {fieldErrors.amount && (
              <div id="amount-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                {fieldErrors.amount}
              </div>
            )}
          </div>

          {/* Currency selection */}
          <div className="form__field">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.currency)}
              aria-describedby={fieldErrors.currency ? "currency-error" : undefined}
            >
              {allowedCurrencies.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {fieldErrors.currency && (
              <div id="currency-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                {fieldErrors.currency}
              </div>
            )}
          </div>

          {/* Payment method selection */}
          <div className="form__field">
            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.paymentMethod)}
              aria-describedby={fieldErrors.paymentMethod ? "paymentMethod-error" : undefined}
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {fieldErrors.paymentMethod && (
              <div id="paymentMethod-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                {fieldErrors.paymentMethod}
              </div>
            )}
          </div>

          {/* Bank transfer fields: rendered only if payment method is bank transfer */}
          {isBankTransfer && (
            <>
              <div className="form__field">
                <label htmlFor="bankAccountNumber">Bank Account Number</label>
                <input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Enter beneficiary account number"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.bankAccountNumber)}
                  aria-describedby={fieldErrors.bankAccountNumber ? "bankAccountNumber-error" : undefined}
                />
                {fieldErrors.bankAccountNumber && (
                  <div id="bankAccountNumber-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                    {fieldErrors.bankAccountNumber}
                  </div>
                )}
              </div>

              <div className="form__field">
                <label htmlFor="bankReference">Payment Reference</label>
                <input
                  id="bankReference"
                  name="bankReference"
                  type="text"
                  value={formData.bankReference}
                  onChange={handleChange}
                  placeholder="Add reference for the transfer"
                  required
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.bankReference)}
                  aria-describedby={fieldErrors.bankReference ? "bankReference-error" : undefined}
                />
                {fieldErrors.bankReference && (
                  <div id="bankReference-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                    {fieldErrors.bankReference}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Card payment fields: rendered only if payment method is card */}
          {isCardPayment && (
            <>
              <div className="form__field">
                <label htmlFor="cardHolder">Cardholder Name</label>
                <input
                  id="cardHolder"
                  name="cardHolder"
                  type="text"
                  value={formData.cardHolder}
                  onChange={handleChange}
                  placeholder="Name on card"
                  required
                  disabled={isSubmitting}
                  autoComplete="cc-name"
                  aria-invalid={Boolean(fieldErrors.cardHolder)}
                  aria-describedby={fieldErrors.cardHolder ? "cardHolder-error" : undefined}
                />
                {fieldErrors.cardHolder && (
                  <div id="cardHolder-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                    {fieldErrors.cardHolder}
                  </div>
                )}
              </div>

              {/* Card Number */}
              <div className="form__field">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  disabled={isSubmitting}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  aria-invalid={Boolean(fieldErrors.cardNumber)}
                  aria-describedby={fieldErrors.cardNumber ? "cardNumber-error" : undefined}
                />
                {fieldErrors.cardNumber && (
                  <div id="cardNumber-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                    {fieldErrors.cardNumber}
                  </div>
                )}
              </div>

              {/* Card Expiry & CVV */}
              <div className="form__field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Expiry Date */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="cardExpiry">Expiry (MM/YY)</label>
                  <input
                    id="cardExpiry"
                    name="cardExpiry"
                    type="text"
                    value={formData.cardExpiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    required
                    disabled={isSubmitting}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    aria-invalid={Boolean(fieldErrors.cardExpiry)}
                    aria-describedby={fieldErrors.cardExpiry ? "cardExpiry-error" : undefined}
                  />
                  {fieldErrors.cardExpiry && (
                    <div id="cardExpiry-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                      {fieldErrors.cardExpiry}
                    </div>
                  )}
                </div>

                {/* CVV */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label htmlFor="cardCvv">CVV</label>
                  <input
                    id="cardCvv"
                    name="cardCvv"
                    type="password"
                    value={formData.cardCvv}
                    onChange={handleChange}
                    placeholder="***"
                    required
                    disabled={isSubmitting}
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    aria-invalid={Boolean(fieldErrors.cardCvv)}
                    aria-describedby={fieldErrors.cardCvv ? "cardCvv-error" : undefined}
                  />
                  {fieldErrors.cardCvv && (
                    <div id="cardCvv-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                      {fieldErrors.cardCvv}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Description textarea */}
          <div className="form__field">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add an optional note..."
              maxLength={250}
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={fieldErrors.description ? "description-error" : undefined}
            />
            {fieldErrors.description && (
              <div id="description-error" style={{ color: "#EF4444", fontSize: "13px", fontWeight: 600 }}>
                {fieldErrors.description}
              </div>
            )}
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