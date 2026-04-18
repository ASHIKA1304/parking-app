import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import "./Dashboard.css";

// ✅ IMPORT YOUR IMAGE HERE
import bg from "../assets/bg.jpg"; // <-- put your image in src/assets/

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("browse");

  const [slots, setSlots] = useState([]);
  const [mySlots, setMySlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // 🔄 ALL SLOTS (REAL-TIME)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "slots"), (snap) => {
      setSlots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 👤 MY SLOTS
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "slots"), where("owner_id", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setMySlots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  // 📦 MY BOOKINGS
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "bookings"),
      where("user_id", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  // ⏱️ CALCULATE HOURS
  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    return (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
  };

  // 📌 BOOK SLOT
  const bookSlot = async () => {
    if (!user) return alert("Login required");

    const hours = calculateHours();
    if (hours <= 0) return alert("Invalid time");

    try {
      await addDoc(collection(db, "bookings"), {
        user_id: user.uid,
        slot_id: selectedSlot.id,
        slot_number: selectedSlot.slot_number,
        start_time: startTime,
        end_time: endTime,
        total: hours * selectedSlot.price_per_hour,
        createdAt: new Date(),
      });

      alert("Booking successful!");
      setSelectedSlot(null);
      setStartTime("");
      setEndTime("");
    } catch (err) {
      alert(err.message);
    }
  };

  // ❌ DELETE SLOT
  const deleteSlot = async (id) => {
    await deleteDoc(doc(db, "slots", id));
  };

  // 🚪 LOGOUT
  const logout = () => {
    signOut(auth);
  };

  return (
    <div className="dashboard-bg">

      {/* ✅ BACKGROUND IMAGE */}
      <img src={bg} className="bg-image" alt="background" />

      <div className="dashboard-container">
        <h1 className="title">Parking Dashboard</h1>

        {/* 🔹 TABS */}
        <div className="tabs">
          <button onClick={() => setActiveTab("browse")}>Browse</button>
          <button onClick={() => setActiveTab("myslots")}>My Slots</button>
          <button onClick={() => setActiveTab("bookings")}>Bookings</button>
          <button onClick={() => setActiveTab("profile")}>Profile</button>
        </div>

        {/* 🔹 BROWSE */}
        {activeTab === "browse" && (
          <div className="slot-grid">
            {slots.length === 0 ? (
              <p>No slots available</p>
            ) : (
              slots.map((s) => (
                <div key={s.id} className="slot-card">
                  <h3>{s.slot_number}</h3>
                  <p>₹{s.price_per_hour}/hr</p>
                  <button onClick={() => setSelectedSlot(s)}>
                    Book Now
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 🔹 BOOKING BOX */}
        {selectedSlot && activeTab === "browse" && (
          <div className="booking-box">
            <h3>Booking: {selectedSlot.slot_number}</h3>

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
              {calculateHours() * selectedSlot.price_per_hour || 0}
            </p>

            <button onClick={bookSlot}>Confirm</button>
            <button
              className="cancel"
              onClick={() => setSelectedSlot(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* 🔹 MY SLOTS */}
        {activeTab === "myslots" && (
          <div className="slot-grid">
            {mySlots.length === 0 ? (
              <p>No slots added</p>
            ) : (
              mySlots.map((s) => (
                <div key={s.id} className="slot-card">
                  <h3>{s.slot_number}</h3>
                  <p>₹{s.price_per_hour}</p>

                  <button
                    className="cancel"
                    onClick={() => deleteSlot(s.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 🔹 BOOKINGS */}
        {activeTab === "bookings" && (
          <div>
            {bookings.length === 0 ? (
              <p>No bookings yet</p>
            ) : (
              bookings.map((b) => (
                <div key={b.id} className="booking-item">
                  <p><strong>{b.slot_number}</strong></p>
                  <p>₹{b.total}</p>
                  <p>{b.start_time} → {b.end_time}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* 🔹 PROFILE */}
        {activeTab === "profile" && user && (
          <div className="booking-box">
            <h3>User Profile</h3>
            <p>Email: {user.email}</p>

            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;