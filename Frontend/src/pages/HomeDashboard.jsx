import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentStats,
  logout
} from "../services/paymentService.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [stats, setStats] = useState(null);
  
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    paymentMethod: "credit_card",
    description: "",
  });
  
  const [updateData, setUpdateData] = useState({
    status: "pending",
  });

  const fetchPayments = async () => {
    try {
      const res = await getAllPayments();
      setPayments(res.data.data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getPaymentStats();
      setStats(res.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      globalThis.localStorage.removeItem('token');
      globalThis.localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await deletePayment(id);
        alert("Payment deleted successfully!");
        fetchPayments();
        fetchStats();
      } catch (error) {
        alert("Error deleting payment: " + error.message);
      }
    }
  };


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleUpdateInputChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPayment({
        ...formData,
        amount: Number.parseFloat(formData.amount)
      });
      alert("Payment created successfully!");
      setFormData({ amount: "", currency: "USD", paymentMethod: "credit_card", description: "" });
      fetchPayments();
      fetchStats();
    } catch (error) {
      alert("Error creating payment: " + error.message);
    }
  };

  const handleReset = () => {
    setFormData({ amount: "", currency: "USD", paymentMethod: "credit_card", description: "" });
  };

  const handleSelectItem = async (e) => {
    const _id = e.target.value;
    setSelectedPaymentId(_id);
    if (_id) {
      try {
        const res = await getPaymentById(_id);
        setUpdateData({ status: res.data.data.status });
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    } else {
      setUpdateData({ status: "pending" });

    await updateBook(selectedBookId, updateData);
    alert('Book updated!')
    fetchBooks();
  }

};
  };


