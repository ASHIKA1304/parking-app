import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");

  // ✅ store payment method per booking
  const [paymentMethods, setPaymentMethods] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/");
      } else {
        setUser(u);

        const unsubBookings = onSnapshot(
          collection(db, "bookings"),
          (snapshot) => {
            const data = snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter((b) => b.user_id === u.uid);

            setBookings(data);
          }
        );

        return () => unsubBookings();
      }
    });

    return () => unsubAuth();
  }, [navigate]);

  // ✅ HANDLE METHOD CHANGE
  const handleMethodChange = (id, value) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // ✅ FILTER LOGIC
  const getFilteredBookings = () => {
    const now = new Date();

    if (filter === "active") {
      return bookings.filter(
        (b) =>
          new Date(b.start_time) <= now &&
          new Date(b.end_time) >= now
      );
    }

    if (filter === "completed") {
      return bookings.filter(
        (b) => new Date(b.end_time) < now
      );
    }

    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  // ✅ TOTALS
  const totalSpent = bookings.reduce((sum, b) => sum + b.total, 0);
  const totalPaid = bookings.reduce(
    (sum, b) => sum + b.initial_payment,
    0
  );
  const totalPending = bookings.reduce(
    (sum, b) => sum + b.remaining_payment,
    0
  );

  // ✅ PAY REMAINING
  const payRemaining = async (id, total) => {
    try {
      const method = paymentMethods[id] || "UPI";

      await updateDoc(doc(db, "bookings", id), {
        initial_payment: total,
        remaining_payment: 0,
        payment_method: method,
        payment_status: "completed",
      });

      alert(`✅ Paid using ${method}`);
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <p><strong>Email:</strong> {user?.email}</p>

      {/* SUMMARY */}
      <div className="summary">
        <div className="card">
          <h3>Total Bookings</h3>
          <p>{bookings.length}</p>
        </div>

        <div className="card">
          <h3>Total Spent</h3>
          <p>₹{totalSpent}</p>
        </div>

        <div className="card">
          <h3>Paid</h3>
          <p>₹{totalPaid}</p>
        </div>

        <div className="card">
          <h3>Pending</h3>
          <p>₹{totalPending}</p>
        </div>
      </div>

      {/* FILTER */}
      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("active")}>Active</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
      </div>

      {/* BOOKINGS */}
      <div className="booking-list">
        {filteredBookings.length === 0 ? (
          <p>No bookings found</p>
        ) : (
          filteredBookings.map((b) => (
            <div key={b.id} className="booking-card">
              <h3>Slot {b.slot_number}</h3>

              <p>
                {new Date(b.start_time).toLocaleString()} →{" "}
                {new Date(b.end_time).toLocaleString()}
              </p>

              <p><strong>Total:</strong> ₹{b.total}</p>
              <p><strong>Paid:</strong> ₹{b.initial_payment}</p>
              <p><strong>Remaining:</strong> ₹{b.remaining_payment}</p>

              {/* STATUS */}
              {new Date(b.end_time) < new Date() ? (
                <p className="completed">Completed</p>
              ) : (
                <p className="active">Active</p>
              )}

              {/* PAYMENT */}
              {b.remaining_payment > 0 ? (
                <div>
                  <label>Select Payment Method:</label>

                  <select
                    value={paymentMethods[b.id] || "UPI"}
                    onChange={(e) =>
                      handleMethodChange(b.id, e.target.value)
                    }
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>

                  <button
                    onClick={() => payRemaining(b.id, b.total)}
                  >
                    Pay Remaining
                  </button>
                </div>
              ) : (
                <>
                  <p className="paid">✅ Fully Paid</p>
                  {b.payment_method && (
                    <p><strong>Method:</strong> {b.payment_method}</p>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* ✅ ACTION BUTTONS */}
      <div className="dashboard-actions">
        <button
          className="back-btn"
          onClick={() => navigate("/bookslot")}
        >
          Book New Slot
        </button>

        <button
          className="add-btn"
          onClick={() => navigate("/addslot")}
        >
          ➕ Add Slot
        </button>
      </div>
    </div>
  );
};

export default Dashboard;