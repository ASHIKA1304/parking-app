import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./BookSlot.css";

const BookSlot = () => {
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [bookings, setBookings] = useState([]);

  // ✅ NEW: payment method
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    fetchSlots();

    const unsubBookings = onSnapshot(
      collection(db, "bookings"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(data);
      }
    );

    return () => {
      unsubAuth();
      unsubBookings();
    };
  }, []);

  const fetchSlots = () => {
    setLoading(true);

    const demoSlots = [
      { id: 1, slot_number: "A1", price_per_hour: 20, apartment: "Block A" },
      { id: 2, slot_number: "A2", price_per_hour: 25, apartment: "Block A" },
      { id: 3, slot_number: "B1", price_per_hour: 30, apartment: "Block B" },
      { id: 4, slot_number: "B2", price_per_hour: 35, apartment: "Block B" },
      { id: 5, slot_number: "C1", price_per_hour: 40, apartment: "Block C" },
    ];

    setSlots(demoSlots);
    setLoading(false);
  };

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (end <= start) return 0;

    return (end - start) / (1000 * 60 * 60);
  };

  const isSlotBooked = (slotId) => {
    const now = new Date();

    return bookings.some((b) => {
      return (
        b.slot_id === slotId &&
        new Date(b.start_time) <= now &&
        new Date(b.end_time) >= now
      );
    });
  };

  const getNextFreeTime = (slotId) => {
    const now = new Date();

    const futureBookings = bookings
      .filter((b) => b.slot_id === slotId && new Date(b.end_time) > now)
      .sort((a, b) => new Date(a.end_time) - new Date(b.end_time));

    if (futureBookings.length === 0) return "Available now";

    return new Date(futureBookings[0].end_time).toLocaleString();
  };

  const bookSlot = async () => {
    if (!user) return alert("Please login first");
    if (!selectedSlot) return alert("Select a slot");

    const hours = calculateHours();
    if (hours <= 0) return alert("Invalid time");

    const overlap = bookings.some((b) => {
      return (
        b.slot_id === selectedSlot.id &&
        new Date(startTime) < new Date(b.end_time) &&
        new Date(endTime) > new Date(b.start_time)
      );
    });

    if (overlap) return alert("Slot already booked!");

    const total = hours * selectedSlot.price_per_hour;

    const newBooking = {
      user_id: user.uid,
      slot_id: selectedSlot.id,
      slot_number: selectedSlot.slot_number,
      start_time: startTime,
      end_time: endTime,
      total,
      initial_payment: total * 0.3,
      remaining_payment: total * 0.7,
      payment_method: paymentMethod, // ✅ added
      payment_status: "partial",
      created_at: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "bookings"), newBooking);

      alert(`Booked using ${paymentMethod}`);

      navigate("/dashboard");

      setSelectedSlot(null);
      setStartTime("");
      setEndTime("");
      setPaymentMethod("UPI");
    } catch (err) {
      console.error(err);
      alert("Error booking slot");
    }
  };

  return (
    <div className="bookslot-container">
      <h1>Book Parking Slot</h1>

      <div className="slot-grid">
        {loading ? (
          <p>Loading...</p>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className={`slot-card ${
                selectedSlot?.id === slot.id ? "selected" : ""
              }`}
              onClick={() => setSelectedSlot(slot)}
            >
              <h3>{slot.slot_number}</h3>
              <p>₹{slot.price_per_hour} / hour</p>
              <p>{slot.apartment}</p>

              {isSlotBooked(slot.id) ? (
                <p className="occupied">🚫 Occupied</p>
              ) : (
                <p className="available">✅ Available</p>
              )}

              <p className="free-time">
                Free at: {getNextFreeTime(slot.id)}
              </p>
            </div>
          ))
        )}
      </div>

      {selectedSlot && (
        <div className="booking-form">
          <h2>Selected Slot: {selectedSlot.slot_number}</h2>

          <label>Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <label>End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          {/* ✅ PAYMENT METHOD UI */}
          <label>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>

          <p>
            Estimated Cost: ₹
            {startTime && endTime
              ? calculateHours() * selectedSlot.price_per_hour
              : 0}
          </p>

          <button onClick={bookSlot}>Confirm Booking</button>

          <button
            style={{ marginLeft: "10px", background: "#2196f3" }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default BookSlot;