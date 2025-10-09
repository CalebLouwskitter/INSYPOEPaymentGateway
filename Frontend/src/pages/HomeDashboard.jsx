import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	getAllPayments,
	createPayment,
	updatePaymentStatus,
	deletePayment,
	logout as apiLogout,
} from "../services/paymentService.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./HomeDashboard.css";

const statusMeta = {
	pending: { label: "Pending", badgeClass: "badge badge--warning", actionLabel: "Mark Paid" },
	completed: { label: "Paid", badgeClass: "badge badge--success", actionLabel: "View" },
	failed: { label: "Failed", badgeClass: "badge badge--danger", actionLabel: "Retry" },
	refunded: { label: "Refunded", badgeClass: "badge badge--neutral", actionLabel: "View" },
};

const paymentMethods = [
	{ value: "credit_card", label: "Credit Card" },
	{ value: "debit_card", label: "Debit Card" },
	{ value: "paypal", label: "PayPal" },
	{ value: "bank_transfer", label: "Bank Transfer" },
	{ value: "mobile_wallet", label: "Mobile Wallet" },
];

const allowedStatuses = [
	{ value: "pending", label: "Pending" },
	{ value: "completed", label: "Completed" },
	{ value: "failed", label: "Failed" },
	{ value: "refunded", label: "Refunded" },
];

const allowedCurrencies = [
	{ value: "USD", label: "USD" },
	{ value: "EUR", label: "EUR" },
	{ value: "ZAR", label: "ZAR" },
	{ value: "GBP", label: "GBP" },
];

const quickPaymentOptions = [
	{
		id: "utilities",
		icon: "⚡",
		title: "Utility Bill",
		description: "Securely settle electricity, water, or gas charges.",
		preset: { amount: 125.4, currency: "USD", paymentMethod: "debit_card", description: "Utility bill payment" },
	},
	{
		id: "housing",
		icon: "🏠",
		title: "Monthly Rent",
		description: "Send your housing payment with bank-level encryption.",
		preset: { amount: 1250.0, currency: "USD", paymentMethod: "bank_transfer", description: "Monthly rent" },
	},
	{
		id: "subscription",
		icon: "💻",
		title: "Software Subscription",
		description: "Renew your SaaS or streaming services in one click.",
		preset: { amount: 69.99, currency: "USD", paymentMethod: "credit_card", description: "Subscription renewal" },
	},
	{
		id: "donation",
		icon: "🤝",
		title: "Charity Donation",
		description: "Support your favourite causes via trusted payment rails.",
		preset: { amount: 100.0, currency: "USD", paymentMethod: "paypal", description: "Charity donation" },
	},
	{
		id: "travel",
		icon: "✈️",
		title: "Travel Booking",
		description: "Lock in flights or hotels with tokenised wallets.",
		preset: { amount: 450.0, currency: "USD", paymentMethod: "mobile_wallet", description: "Travel booking" },
	},
];

const formatCurrency = (amount, currency = "USD") => {
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
		}).format(amount || 0);
	} catch (err) {
		return `$${Number(amount || 0).toFixed(2)}`;
	}
};

const formatDate = (value) => {
	if (!value) return "-";
	try {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		}).format(new Date(value));
	} catch (err) {
		return value;
	}
};

export default function HomeDashboard() {
	const navigate = useNavigate();
	const { user, isAuthenticated, logout: clearAuth } = useAuth();
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedPaymentId, setSelectedPaymentId] = useState("");
	const createFormRef = useRef(null);

	const [formData, setFormData] = useState({
		amount: "",
		currency: "USD",
		paymentMethod: "credit_card",
		description: "",
	});

	const [updateData, setUpdateData] = useState({
		status: "pending",
	});

	const totalDue = useMemo(() => {
		return payments
			.filter((p) => p.status === "pending" || p.status === "failed")
			.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
	}, [payments]);

	const statusTotals = useMemo(() => {
		const base = {
			pending: { count: 0, amount: 0 },
			completed: { count: 0, amount: 0 },
			failed: { count: 0, amount: 0 },
			refunded: { count: 0, amount: 0 },
		};

		payments.forEach((payment) => {
			const status = payment.status || "pending";
			if (!base[status]) {
				base[status] = { count: 0, amount: 0 };
			}
			base[status].count += 1;
			base[status].amount += Number(payment.amount) || 0;
		});

		return base;
	}, [payments]);

	const startQuickPayment = (option) => {
		if (!option?.preset) return;
		navigate("/paymentportal", {
			state: {
				source: "dashboard",
				presetPayment: {
					amount: option.preset.amount,
					currency: option.preset.currency,
					paymentMethod: option.preset.paymentMethod,
					description: option.preset.description,
				},
			},
		});
	};

	const loadPayments = useCallback(async () => {
		setLoading(true);
		try {
			const paymentsRes = await getAllPayments();

			setPayments(paymentsRes?.data?.data || []);
			setError("");
		} catch (err) {
			console.error("Error loading dashboard data", err);
			const message = err?.response?.data?.message || err.message || "Unable to load payments";
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login", { replace: true });
			return;
		}
		loadPayments();
	}, [isAuthenticated, loadPayments, navigate]);

	if (!isAuthenticated) {
		return null;
	}

	const handleCreatePayment = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		try {
			const payload = {
				...formData,
				amount: Number.parseFloat(formData.amount),
			};

			if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
				throw new Error("Amount must be greater than zero");
			}

			await createPayment(payload);
			await loadPayments();
			setFormData({ amount: "", currency: "USD", paymentMethod: "credit_card", description: "" });
		} catch (err) {
			console.error("Error creating payment", err);
			const message = err?.response?.data?.message || err.message || "Unable to create payment";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSelectPayment = (e) => {
		const paymentId = e.target.value;
		setSelectedPaymentId(paymentId);
		const payment = payments.find((p) => p._id === paymentId);
		setUpdateData({ status: payment?.status || "pending" });
	};

	const handleUpdateStatus = async (e) => {
		e.preventDefault();
		if (!selectedPaymentId) {
			setError("Please select a payment to update");
			return;
		}

		try {
			setIsSubmitting(true);
			await updatePaymentStatus(selectedPaymentId, updateData.status);
			await loadPayments();
		} catch (err) {
			console.error("Error updating payment status", err);
			const message = err?.response?.data?.message || err.message || "Unable to update payment";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeletePayment = async (paymentId) => {
		if (!paymentId) return;
		const confirmed = window.confirm("Delete this payment permanently?");
		if (!confirmed) return;

		try {
			setIsSubmitting(true);
			await deletePayment(paymentId);
			await loadPayments();
		} catch (err) {
			console.error("Error deleting payment", err);
			const message = err?.response?.data?.message || err.message || "Unable to delete payment";
			setError(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLogout = async () => {
		try {
			await apiLogout();
		} catch (err) {
			console.warn("Logout request failed", err);
		} finally {
			clearAuth();
			navigate("/login");
		}
	};

	const scrollToCreateForm = () => {
		createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<div className="dashboard">
			<header className="dashboard__header">
				<div>
					<h1>Your Due Payments</h1>
					<p>Track and manage your upcoming bills and obligations with end-to-end secure APIs.</p>
				</div>
				<div className="dashboard__header-actions">
					{user?.accountNumber && (
						<span className="dashboard__user">User ID: {user.accountNumber}</span>
					)}
					<button className="btn btn--primary" onClick={scrollToCreateForm}>
						+ Add New Payment
					</button>
					<button className="btn btn--ghost" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</header>

			{error && <div className="banner banner--error">{error}</div>}

			<section className="dashboard__summary">
				<div className="summary-card">
					<div className="summary-card__icon" aria-hidden>⚠️</div>
					<div>
						<p className="summary-card__title">Total Due (Pending & Failed)</p>
						<p className="summary-card__value">{formatCurrency(totalDue)}</p>
					</div>
				</div>

				<div className="summary-grid">
					{Object.entries(statusTotals).map(([status, info]) => (
						<div key={status} className="summary-grid__item">
							<p className="summary-grid__label">{statusMeta[status]?.label || status}</p>
							<p className="summary-grid__value">{info.count} payments</p>
							<p className="summary-grid__amount">{formatCurrency(info.amount)}</p>
						</div>
					))}
				</div>
			</section>

			<section className="dashboard__quick">
				<div className="dashboard__quick-header">
					<div>
						<h2>Quick Secure Payments</h2>
						<p>Use pre-vetted flows hardened with validation, rate limiting, and attack surface checks.</p>
					</div>
					<button
						type="button"
						className="btn btn--ghost"
						onClick={() => navigate("/paymentportal")}
					>
						Open Payment Portal
					</button>
				</div>
				<div className="quick-grid" role="list">
					{quickPaymentOptions.map((option) => (
						<button
							key={option.id}
							type="button"
							className="quick-card"
							onClick={() => startQuickPayment(option)}
							role="listitem"
						>
							<span className="quick-card__icon" aria-hidden>{option.icon}</span>
							<div className="quick-card__content">
								<p className="quick-card__title">{option.title}</p>
								<p className="quick-card__desc">{option.description}</p>
								<div className="quick-card__meta">
									<span>{option.preset.currency} {option.preset.amount.toFixed(2)}</span>
									<span>{paymentMethods.find((m) => m.value === option.preset.paymentMethod)?.label || ""}</span>
								</div>
							</div>
						</button>
					))}
				</div>
			</section>

			<section className="dashboard__content">
				<div className="card card--table">
					<div className="card__header">
						<h2>Payment List</h2>
						<span>{payments.length} total</span>
					</div>

					{loading ? (
						<div className="card__empty">Loading payments...</div>
					) : payments.length === 0 ? (
						<div className="card__empty">No payments yet. Add your first payment to get started.</div>
					) : (
						<table className="payment-table">
							<thead>
								<tr>
									<th>Name / Category</th>
									<th>Created</th>
									<th>Amount</th>
									<th>Status</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{payments.map((payment) => {
									const meta = statusMeta[payment.status] || statusMeta.pending;
									return (
										<tr key={payment._id}>
											<td>
												<div className="payment-table__primary">{payment.description || payment.paymentMethod}</div>
												<small className="payment-table__secondary">{payment.paymentMethod.replace("_", " ")}</small>
											</td>
											<td>{formatDate(payment.createdAt)}</td>
											<td>{formatCurrency(payment.amount, payment.currency)}</td>
											<td>
												<span className={meta.badgeClass}>{meta.label}</span>
											</td>
											<td className="payment-table__actions">
												<button
													className="btn btn--link"
													onClick={() => {
														setSelectedPaymentId(payment._id);
														setUpdateData({ status: payment.status });
														scrollToCreateForm();
													}}
												>
													{meta.actionLabel}
												</button>
												<button
													className="btn btn--danger"
													onClick={() => handleDeletePayment(payment._id)}
													disabled={isSubmitting}
												>
													Delete
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					)}
				</div>

				<div className="card card--forms" ref={createFormRef}>
					<div className="card__section">
						<h3>Create Payment</h3>
						<form className="form" onSubmit={handleCreatePayment}>
							<label className="form__field">
								<span>Amount</span>
								<input
									type="number"
									name="amount"
									step="0.01"
									min="0"
									value={formData.amount}
									onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
									required
								/>
							</label>

							<label className="form__field">
								<span>Currency</span>
								<select
									name="currency"
									value={formData.currency}
									onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
								>
									{allowedCurrencies.map((curr) => (
										<option key={curr.value} value={curr.value}>
											{curr.label}
										</option>
									))}
								</select>
							</label>

							<label className="form__field">
								<span>Payment Method</span>
								<select
									name="paymentMethod"
									value={formData.paymentMethod}
									onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
								>
									{paymentMethods.map((method) => (
										<option key={method.value} value={method.value}>
											{method.label}
										</option>
									))}
								</select>
							</label>

							<label className="form__field">
								<span>Description</span>
								<textarea
									name="description"
									rows="3"
									placeholder="Add an optional note"
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								/>
							</label>

							<button type="submit" className="btn btn--primary" disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Create Payment"}
							</button>
						</form>
					</div>

					<div className="card__section card__section--border">
						<h3>Update Payment Status</h3>
						<form className="form" onSubmit={handleUpdateStatus}>
							<label className="form__field">
								<span>Select Payment</span>
								<select value={selectedPaymentId} onChange={handleSelectPayment}>
									<option value="">Choose a payment</option>
									{payments.map((payment) => (
										<option key={payment._id} value={payment._id}>
											{payment.description || payment.transactionId}
										</option>
									))}
								</select>
							</label>

							<label className="form__field">
								<span>Status</span>
								<select
									name="status"
									value={updateData.status}
									onChange={(e) => setUpdateData({ status: e.target.value })}
									disabled={!selectedPaymentId}
								>
									{allowedStatuses.map((status) => (
										<option key={status.value} value={status.value}>
											{status.label}
										</option>
									))}
								</select>
							</label>

							<button type="submit" className="btn btn--primary" disabled={!selectedPaymentId || isSubmitting}>
								{isSubmitting ? "Updating..." : "Update Status"}
							</button>
						</form>
					</div>
				</div>
			</section>
		</div>
	);
}


