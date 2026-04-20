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

  // ✅ separate states
  const [myBookings, setMyBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [slots, setSlots] = useState([]);

  const [filter, setFilter] = useState("all");
  const [paymentMethods, setPaymentMethods] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/");
      } else {
        setUser(u);

        // 🔥 GET ALL BOOKINGS
        const unsubBookings = onSnapshot(
          collection(db, "bookings"),
          (snapshot) => {
            const all = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setAllBookings(all);

            // ✅ ONLY CURRENT USER BOOKINGS
            const mine = all.filter((b) => b.user_id === u.uid);
            setMyBookings(mine);
          }
        );

        // 🔥 GET ALL SLOTS
        const unsubSlots = onSnapshot(
          collection(db, "slots"),
          (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setSlots(data);
          }
        );

        return () => {
          unsubBookings();
          unsubSlots();
        };
      }
    });

    return () => unsubAuth();
  }, [navigate]);

  // ✅ CHECK IF SLOT IS BOOKED BY ANYONE
  const isSlotBooked = (slotId) => {
    return allBookings.some((b) => b.slot_id === slotId);
  };

  // ✅ FILTER BOOKINGS (ONLY MY BOOKINGS)
  const getFilteredBookings = () => {
    const now = new Date();

    if (filter === "active") {
      return myBookings.filter(
        (b) =>
          new Date(b.start_time) <= now &&
          new Date(b.end_time) >= now
      );
    }

    if (filter === "completed") {
      return myBookings.filter(
        (b) => new Date(b.end_time) < now
      );
    }

    return myBookings;
  };

  const filteredBookings = getFilteredBookings();

  // ✅ TOTALS (ONLY MY BOOKINGS)
  const totalSpent = myBookings.reduce((sum, b) => sum + b.total, 0);
  const totalPaid = myBookings.reduce(
    (sum, b) => sum + b.initial_payment,
    0
  );
  const totalPending = myBookings.reduce(
    (sum, b) => sum + b.remaining_payment,
    0
  );

  // PAYMENT
  const handleMethodChange = (id, value) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const payRemaining = async (id, total) => {
    try {
      const method = paymentMethods[id] || "UPI";

      await updateDoc(doc(db, "bookings", id), {
        initial_payment: total,
        remaining_payment: 0,
        payment_method: method,
        payment_status: "completed",
      });

      alert(`Paid using ${method}`);
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  // ✅ AVAILABLE SLOTS LOGIC
  const availableSlots = slots.filter((slot) => {
    const booked = allBookings.some((b) => b.slot_id === slot.id);

    return (
      !booked && // not booked by anyone
      slot.owner_id !== user?.uid // not your own slot
    );
  });

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <p><strong>Email:</strong> {user?.email}</p>

      {/* SUMMARY */}
      <div className="summary">
        <div className="card">
          <h3>Total Bookings</h3>
          <p>{myBookings.length}</p>
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

      {/* MY BOOKINGS */}
      <h2>📌 My Bookings</h2>

      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("active")}>Active</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
      </div>

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
              <p><strong>Remaining:</strong> ₹{b.remaining_payment}</p>

              {b.remaining_payment > 0 ? (
                <>
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

                  <button onClick={() => payRemaining(b.id, b.total)}>
                    Pay Remaining
                  </button>
                </>
              ) : (
                <p className="paid">Fully Paid</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* AVAILABLE SLOTS */}
      <h2>🅿️ Available Slots</h2>

      <div className="slot-grid">
        {availableSlots.length === 0 ? (
          <p>No available slots</p>
        ) : (
          availableSlots.map((slot) => (
            <div key={slot.id} className="slot-card">
              <h3>{slot.slotNumber}</h3>
              <p>₹{slot.pricePerHour}/hr</p>
              <p>{slot.apartment}</p>

              <button
                onClick={() =>
                  navigate("/bookslot", { state: slot })
                }
              >
                Book Now
              </button>
            </div>
          ))
        )}
      </div>

      {/* ACTION */}
      <div className="dashboard-actions">
        <button onClick={() => navigate("/addslot")}>
          ➕ Add Slot
        </button>
      </div>
    </div>
  );
};

export default Dashboard;