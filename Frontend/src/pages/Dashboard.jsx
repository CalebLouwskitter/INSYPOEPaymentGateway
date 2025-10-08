
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
        amount: parseFloat(formData.amount)
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

  return (
    <div>
      <h1>📚Library Dashboard Page📚</h1>
      <div>
        <h3>ALL books</h3>
        <table border="1">
          {/* thead specifies that the following row will be headings */}
          <thead>
            {/* tr denotes a new row */}
            <tr>
              {/* and each th represents a heading */}
              <th>Title</th>
              <th>Author</th>
              <th>ISBN</th>
              <th>Edition</th>
              <th>Actions</th>
            </tr>
          </thead>
          {/* tbody - table body (data lives here) */}
          <tbody>
            {/* if there are NO books, print a message across the table saying so */}
            {books.length === 0 && (
              <tr>
                <td colSpan="5">No books available.</td>
              </tr>
            )}
            {/* if there ARE books, we iterate through each book in the books array (using temp variable book) 
            similar to a foreach loop, and we map the correct attribute to the correct column in the table */}
            {books.map((book) => (
              /* key lets us identify each row (by the books id, useful for when we implement DELETE later) */
              <tr key={book._id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.isbn}</td>
                <td>{book.edition}</td>
                <td>
                  <button
                    onClick={() => {
                      handleDelete(book._id);
                    }}
                  >
                    Delete Book
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3>✏️Add a New Book✏️</h3>
        {/* a FORM element allows us to collect multiple pieces of information about the same thing */}
        <form onSubmit={handleSubmit}>
          {/* we use the INPUT element to gather input */}
          <input
            type="text"
            name="title"
            placeholder="Book Title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
          <br />
          <input
            type="text"
            name="author"
            placeholder="Book Author"
            value={formData.author}
            onChange={handleInputChange}
            required
          />
          <br />
          <input
            type="text"
            name="isbn"
            placeholder="Book ISBN"
            value={formData.isbn}
            onChange={handleInputChange}
            required
          />
          <br />
          <input
            type="number"
            name="edition"
            placeholder="Book Edition"
            value={formData.edition}
            onChange={handleInputChange}
            required
          />
          <br />
          <button type="submit">Submit</button>
          <button type="reset" onClick={handleReset}>

            Reset
          </button>
        </form>
      </div>

      <div>
        <h3>📒Work with a Single Book📒</h3>
        <label>Select Which Book You'd Like to Work With:</label>
        <br />
        <select value={selectedBookId} onChange={handleSelectItem}>
          {/* we create a default select list option for when a book has not yet been chosen */}
          <option value="">--Select Book--</option>
          {/* here, we iterate through each book in our list, to create a new select list option */}
          {books.map((book) => (
            /* we use the _id to reference a book (in the API), but the title for the user to select 
                as the user will know the title of the book they want, not the _id */
            <option key={book._id} value={book._id}>
              {book.title}
            </option>
          ))}
        </select>
        <br />
        <form onSubmit={handleUpdate}>
          {/* we use the INPUT element to gather input */}
          <input
            type="text"
            name="title"
            placeholder="Book Title"
            value={updateData.title}
            onChange={handleUpdateInputChange}
            required
          />
          <br />
          <input
            type="text"
            name="author"
            placeholder="Book Author"
            value={updateData.author}
            onChange={handleUpdateInputChange}
            required
          />
          <br />
          <input
            type="text"
            name="isbn"
            placeholder="Book ISBN"
            value={updateData.isbn}
            onChange={handleUpdateInputChange}
            required
          />
          <br />
          <input
            type="number"
            name="edition"
            placeholder="Book Edition"
            value={updateData.edition}
            onChange={handleUpdateInputChange}
            required
          />
          <br />
          <button type="submit">Update Book</button>
          <button type="reset" onClick={handleReset}>
            Reset
          </button>
        </form>

      </div>
    </div>
  );
}
}
