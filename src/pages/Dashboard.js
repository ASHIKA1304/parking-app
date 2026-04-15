import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  const [slots, setSlots] = useState([]);
  const [filteredSlots, setFilteredSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [maxPrice, setMaxPrice] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [bookingSlot, setBookingSlot] = useState(null);
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

  // ✅ LOCAL SLOT DATA (no backend)
  const fetchSlots = () => {
    setLoading(true);

    const demoSlots = [
      {
        id: 1,
        slot_number: "A1",
        price_per_hour: 20,
        is_active: true,
        available_to: "2099-12-31",
        owner_id: "other",
      },
      {
        id: 2,
        slot_number: "B2",
        price_per_hour: 30,
        is_active: true,
        available_to: "2099-12-31",
        owner_id: "other",
      },
      {
        id: 3,
        slot_number: "C3",
        price_per_hour: 25,
        is_active: false,
        available_to: "2024-01-01",
        owner_id: "other",
      },
    ];

    setSlots(demoSlots);
    setLoading(false);
  };

  useEffect(() => {
    let result = [...slots];

    if (maxPrice) {
      result = result.filter(
        (s) => s.price_per_hour <= parseFloat(maxPrice)
      );
    }

    if (statusFilter === "active") {
      result = result.filter(
        (s) => s.is_active && new Date(s.available_to) > new Date()
      );
    }

    if (statusFilter === "expired") {
      result = result.filter(
        (s) => new Date(s.available_to) <= new Date()
      );
    }

    setFilteredSlots(result);
  }, [slots, maxPrice, statusFilter]);

  const isAvailable = (slot) => {
    return slot.is_active && new Date(slot.available_to) > new Date();
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

    if (!bookingSlot) {
      alert("Select a slot");
      return;
    }

    const hours = calculateHours();

    if (hours <= 0) {
      alert("Invalid time range");
      return;
    }

    const total = hours * bookingSlot.price_per_hour;
    const initialPayment = total * 0.3;
    const remainingPayment = total - initialPayment;

    // ✅ LOCAL BOOKING
    const newBooking = {
      id: Date.now(),
      user_id: user.uid,
      slot_id: bookingSlot.id,
      slot_number: bookingSlot.slot_number,
      start_time: startTime,
      end_time: endTime,
      total,
      initial_payment: initialPayment,
      remaining_payment: remainingPayment,
    };

    setBookings([...bookings, newBooking]);

    alert("Booking successful!");

    setBookingSlot(null);
    setStartTime("");
    setEndTime("");
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px" }}>
      <h1>Parking Dashboard</h1>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Available</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* SLOT LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredSlots.length === 0 ? (
        <p>No slots available</p>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {filteredSlots.map((slot) => (
            <div
              key={slot.id}
              style={{
                border: "1px solid gray",
                padding: "10px",
              }}
            >
              <h3>{slot.slot_number}</h3>
              <p>₹{slot.price_per_hour}/hr</p>

              {isAvailable(slot) && (
                <button onClick={() => setBookingSlot(slot)}>
                  Book Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* BOOKING UI */}
      {bookingSlot && (
        <div style={{ marginTop: "20px", border: "1px solid black", padding: "10px" }}>
          <h3>Book Slot: {bookingSlot.slot_number}</h3>

          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <p>
            Cost: ₹
            {calculateHours() * bookingSlot.price_per_hour || 0}
          </p>

          <button onClick={bookSlot}>Confirm Booking</button>
          <button onClick={() => setBookingSlot(null)}>Cancel</button>
        </div>
      )}

      {/* OPTIONAL BOOKINGS DISPLAY */}
      {bookings.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Your Bookings</h3>
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

export default Dashboard;