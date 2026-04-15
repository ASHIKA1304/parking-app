import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./Addslot.css";

const AddSlot = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [slots, setSlots] = useState([]); // local storage list

  const [form, setForm] = useState({
    slotNumber: "",
    pricePerHour: "",
    availableFrom: "",
    availableTo: "",
    apartment: "",
  });

  // get logged-in user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login first");
      return;
    }

    if (new Date(form.availableTo) <= new Date(form.availableFrom)) {
      alert("End time must be after start time");
      return;
    }

    setLoading(true);


    const newSlot = {
      id: Date.now(),
      owner_id: user.uid,
      apartment: form.apartment,
      slotNumber: form.slotNumber,
      pricePerHour: form.pricePerHour,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo,
    };

    setSlots([...slots, newSlot]);

    alert("Slot added successfully!");

    // clear form
    setForm({
      slotNumber: "",
      pricePerHour: "",
      availableFrom: "",
      availableTo: "",
      apartment: "",
    });

    setLoading(false);

    // optional redirect
    navigate("/dashboard");
  };

  return (
    <div className="addslot-container">
      <div className="addslot-card">

        <h1>Add Parking Slot</h1>
        <p>Share your unused parking space</p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Apartment Name (e.g. Block A)"
            value={form.apartment}
            onChange={(e) =>
              setForm({ ...form, apartment: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Slot Number (e.g. B2-15)"
            value={form.slotNumber}
            onChange={(e) =>
              setForm({ ...form, slotNumber: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Price per Hour (₹)"
            value={form.pricePerHour}
            onChange={(e) =>
              setForm({ ...form, pricePerHour: e.target.value })
            }
            required
          />

          <label>Available From</label>
          <input
            type="datetime-local"
            value={form.availableFrom}
            onChange={(e) =>
              setForm({ ...form, availableFrom: e.target.value })
            }
            required
          />

          <label>Available To</label>
          <input
            type="datetime-local"
            value={form.availableTo}
            onChange={(e) =>
              setForm({ ...form, availableTo: e.target.value })
            }
            required
          />

          <button disabled={loading}>
            {loading ? "Adding..." : "Add Slot"}
          </button>

        </form>

        {/* OPTIONAL: show added slots */}
        {slots.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>My Slots</h3>
            {slots.map((s) => (
              <p key={s.id}>
                {s.slotNumber} - ₹{s.pricePerHour}/hr
              </p>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AddSlot;