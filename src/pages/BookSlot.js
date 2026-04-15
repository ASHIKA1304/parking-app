import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./BookSlot.css";

const BookSlot = () => {
  const [user, setUser] = useState(null);

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [bookings, setBookings] = useState([]); // LOCAL BOOKINGS

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    fetchSlots();

    return () => unsub();
  }, []);

  // ✅ LOCAL SLOTS (no backend)
  const fetchSlots = () => {
    setLoading(true);

    // demo slots (replace later with DB if needed)
    const demoSlots = [
      {
        id: 1,
        slot_number: "A1",
        price_per_hour: 20,
        apartment: "Block A",
      },
      {
        id: 2,
        slot_number: "B2",
        price_per_hour: 30,
        apartment: "Block B",
      },
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

  const bookSlot = () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a slot");
      return;
    }

    const hours = calculateHours();

    if (hours <= 0) {
      alert("Invalid time range");
      return;
    }

    const total = hours * selectedSlot.price_per_hour;
    const initialPayment = total * 0.3;
    const remainingPayment = total - initialPayment;

    // ✅ LOCAL BOOKING STORAGE
    const newBooking = {
      id: Date.now(),
      user_id: user.uid,
      slot_id: selectedSlot.id,
      slot_number: selectedSlot.slot_number,
      start_time: startTime,
      end_time: endTime,
      total,
      initial_payment: initialPayment,
      remaining_payment: remainingPayment,
    };

    setBookings([...bookings, newBooking]);

    alert("Slot booked successfully!");

    setSelectedSlot(null);
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="bookslot-container">
      <h1>Book Parking Slot</h1>

      {/* SLOT LIST */}
      <div className="slot-grid">
        {loading ? (
          <p>Loading slots...</p>
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
            </div>
          ))
        )}
      </div>

      {/* BOOKING FORM */}
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

          <p>
            Estimated Cost: ₹
            {startTime && endTime
              ? calculateHours() * selectedSlot.price_per_hour
              : 0}
          </p>

          <button onClick={bookSlot}>Confirm Booking</button>
        </div>
      )}

      {/* OPTIONAL: show bookings */}
      {bookings.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>My Bookings</h3>
          {bookings.map((b) => (
            <p key={b.id}>
              Slot {b.slot_number} → ₹{b.total}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookSlot;