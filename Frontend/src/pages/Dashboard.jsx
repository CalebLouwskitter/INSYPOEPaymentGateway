<<<<<<< Updated upstream
// importing required react components
import { useEffect, useState } from "react";
// as well as our API methods we created
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../services/paymentService.js";

// every page needs to return a default function, so that it can be called elsewhere
export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  // this formData is for CREATING A NEW BOOK
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    edition: 0,
  });
  // this form data is for UPDATING AN EXISTING BOOK
  const [updateData, setUpdateData] = useState({
    title: "",
    author: "",
    isbn: "",
    edition: 0,
  });

  const fetchBooks = async () => {
    // fetch all books using the apiService method we created earlier, storing the response in a temp variable
    const res = await getAllBooks();
    // and update our books variable with the response data
    setBooks(res.data);
  };

  // this method will run as soon as the page is loaded
  useEffect(() => {
    // fetching all of the books in the background
    fetchBooks();
  }, []);

  // we create a method to handle when the delete button is pressed
  const handleDelete = async (id) => {
    // prompt the user to make sure that they're sure that they're sure they want to delete
    if (
      window.confirm(
        "Are you super duper mega sure you want to nuke this book from the face of the earth?"
      )
    ) {
      // if yes, delete the book using the provided id
      await deleteBook(id);
      // and update our cached books array
      fetchBooks();
    }
  };

  // this method will handle what to do when user input happens in our form element
=======
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

>>>>>>> Stashed changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

<<<<<<< Updated upstream
  // same method, different variable
    const handleUpdateInputChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  // this method handles what happens when the submit button is pressed
  const handleSubmit = async (e) => {
    // prevent the button from being pressed automatically when it is created by React
    e.preventDefault();
    // call our wonderful API method to create a new book
    await createBook(formData);
    // let the user know if it was successful
    alert("Book created!");
    // and reset the form
    setFormData({ title: "", author: "", isbn: "", edition: 0 });
    // refresh our local list of books
    fetchBooks();
  };

  // when the reset button is clicked, clear
  const handleReset = () => {
    setFormData({ title: "", author: "", isbn: "", edition: 0 });
  };

  // handle what to do when a new item is selected from the select list
  const handleSelectItem = async (e) => {
    // get the .value from the select list option that was chosen
    const _id = e.target.value;
    // update our variable keeping track of the selected book
    setSelectedBookId(_id);
    // if working with a REAL book (and not the placeholder), do the following...
    if (_id) {
      // ... get the book from the API using the provided _id
      const res = await getBookById(_id);
      setUpdateData(res.data);
    } else {
      setUpdateData({ title: "", author: "", isbn: "", edition: 0 });
=======
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
>>>>>>> Stashed changes
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
<<<<<<< Updated upstream
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
=======
    try {
      await updatePaymentStatus(selectedPaymentId, updateData.status);
      alert("Payment status updated successfully!");
      fetchPayments();
      fetchStats();
    } catch (error) {
      alert("Error updating payment: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Payment Gateway Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {stats && (
        <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
          <h3>Payment Statistics</h3>
          <p><strong>Total Payments:</strong> {stats.totalPayments}</p>
          {stats.statusBreakdown && stats.statusBreakdown.length > 0 && (
            <div>
              <strong>Status Breakdown:</strong>
              <ul>
                {stats.statusBreakdown.map((item, index) => (
                  <li key={index}>
                    {item._id}: {item.count} payments (${item.totalAmount.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: "30px" }}>
        <h3>All Payments</h3>
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#007bff", color: "white" }}>
              <th style={{ padding: "10px" }}>Transaction ID</th>
              <th style={{ padding: "10px" }}>Amount</th>
              <th style={{ padding: "10px" }}>Currency</th>
              <th style={{ padding: "10px" }}>Method</th>
              <th style={{ padding: "10px" }}>Status</th>
              <th style={{ padding: "10px" }}>Description</th>
              <th style={{ padding: "10px" }}>Date</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>No payments available.</td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment._id}>
                  <td style={{ padding: "10px" }}>{payment.transactionId}</td>
                  <td style={{ padding: "10px" }}>${payment.amount.toFixed(2)}</td>
                  <td style={{ padding: "10px" }}>{payment.currency}</td>
                  <td style={{ padding: "10px" }}>{payment.paymentMethod}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{
                      padding: "5px 10px",
                      borderRadius: "3px",
                      backgroundColor: payment.status === 'completed' ? '#28a745' : payment.status === 'failed' ? '#dc3545' : payment.status === 'refunded' ? '#ffc107' : '#6c757d',
                      color: "white"
                    }}>
                      {payment.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>{payment.description || '-'}</td>
                  <td style={{ padding: "10px" }}>{new Date(payment.createdAt).toLocaleString()}</td>
                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => handleDelete(payment._id)}
                      style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#e9ecef", borderRadius: "5px" }}>
        <h3>Create New Payment</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Amount: </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0.01"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Currency: </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              style={{ marginLeft: "10px", padding: "5px" }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Payment Method: </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              style={{ marginLeft: "10px", padding: "5px" }}
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Description: </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={{ marginLeft: "10px", padding: "5px", width: "300px" }}
            />
          </div>
          <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}>
            Create Payment
          </button>
          <button type="button" onClick={handleReset} style={{ padding: "10px 20px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
>>>>>>> Stashed changes
            Reset
          </button>
        </form>
      </div>
<<<<<<< Updated upstream
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
=======

      <div style={{ padding: "20px", backgroundColor: "#fff3cd", borderRadius: "5px" }}>
        <h3>Update Payment Status</h3>
        <div style={{ marginBottom: "10px" }}>
          <label>Select Payment: </label>
          <select onChange={handleSelectItem} value={selectedPaymentId} style={{ marginLeft: "10px", padding: "5px" }}>
            <option value="">-- Select a payment --</option>
            {payments.map((payment) => (
              <option key={payment._id} value={payment._id}>
                {payment.transactionId} - ${payment.amount} ({payment.status})
              </option>
            ))}
          </select>
        </div>
        {selectedPaymentId && (
          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: "10px" }}>
              <label>New Status: </label>
              <select
                name="status"
                value={updateData.status}
                onChange={handleUpdateInputChange}
                style={{ marginLeft: "10px", padding: "5px" }}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
              Update Status
            </button>
          </form>
        )}
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
