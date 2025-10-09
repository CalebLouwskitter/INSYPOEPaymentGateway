import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PaymentPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <h1>Welcome to Your Payment Portal</h1>
      <p><strong>ID Number:</strong> {user.idNumber}</p>
      <p><strong>Account Number:</strong> {user.accountNumber}</p>
      <p><strong>Balance:</strong> ${user.balance}</p>
    </div>
  );
}
