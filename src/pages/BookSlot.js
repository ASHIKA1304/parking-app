import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./BookSlot.css";

const BookSlot = () => {
  const [user, setUser] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const navigate = useNavigate();

  // AUTH + DEMO DATA
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    setSlots([
      { id: 1, slot_number: "A1", price_per_hour: 20, apartment: "Block A" },
      { id: 2, slot_number: "B2", price_per_hour: 30, apartment: "Block B" },
      { id: 3, slot_number: "C3", price_per_hour: 25, apartment: "Block C" },
    ]);

    setLoading(false);

    return () => unsub();
  }, []);

  // CALCULATE HOURS
  const calculateHours = () => {
    if (!startTime || !endTime) return 0;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (end <= start) return 0;

    return ((end - start) / (1000 * 60 * 60)).toFixed(2);
  };

  const hours = parseFloat(calculateHours());
  const totalPrice = selectedSlot
    ? hours * selectedSlot.price_per_hour
    : 0;
  const advance = totalPrice * 0.3;

  // BOOK SLOT (FINAL VALIDATION)
  const bookSlot = () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a slot");
      return;
    }

    if (!startTime || !endTime) {
      alert("Please select start and end time");
      return;
    }

    if (hours <= 0) {
      alert("End time must be after start time");
      return;
    }

    alert("Booking successful!");
    navigate("/dashboard");

    // reset
    setSelectedSlot(null);
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="bookslot-wrapper">

      {/* USER */}
      {user && <p className="welcome">👋 {user.email}</p>}

      <h1 className="title">🚗 Book Parking Slot</h1>

      <div className="layout">

        {/* LEFT SIDE */}
        <div className="left">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="slot-grid">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`slot-card ${
                    selectedSlot?.id === slot.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <h3>{slot.slot_number}</h3>
                  <p>₹{slot.price_per_hour}/hr</p>
                  <span>{slot.apartment}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="right">
          {selectedSlot ? (
            <>
              <h2>📌 Slot {selectedSlot.slot_number}</h2>

              <div className="info-card">
                <p><strong>Location:</strong> {selectedSlot.apartment}</p>
                <p><strong>Rate:</strong> ₹{selectedSlot.price_per_hour}/hr</p>
              </div>

              {/* INPUTS */}
              <div className="input-box">
                <label>Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="input-box">
                <label>End Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>

              {/* ERROR MESSAGE */}
              {startTime && endTime && hours <= 0 && (
                <p style={{ color: "red" }}>
                  End time must be after start time
                </p>
              )}

              {/* PRICE */}
              <div className="price-details">
                <p>Hours: {hours}</p>
                <h3>₹{totalPrice.toFixed(2)}</h3>
              </div>

              {/* PAYMENT */}
              <div className="payment-box">
                <p>Pay now (30%)</p>
                <h4>₹{advance.toFixed(2)}</h4>
              </div>

              {/* BUTTON */}
              <button
                onClick={bookSlot}
                disabled={
                  !selectedSlot ||
                  !startTime ||
                  !endTime ||
                  hours <= 0
                }
              >
                {(!selectedSlot || !startTime || !endTime)
                  ? "Fill all details"
                  : "✅ Confirm Booking"}
              </button>
            </>
          ) : (
            <div className="empty">
              <p style={{ color: "red" }}>Please select a slot 👈</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookSlot;