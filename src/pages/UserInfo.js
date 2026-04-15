import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserInfo.css";

function UserInfo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    apartment: "",
    houseNo: "",
    phone: "",
    role: "book", // default selection
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("User Info:", form);
    alert("Profile Saved!");

    // 🚀 REDIRECT LOGIC
    if (form.role === "book") {
      navigate("/bookslot");   // BookSlot.js page
    } else if (form.role === "give") {
      navigate("/addslot");    // AddSlot.js page
    }
  };

  return (
    <div className="userinfo-container">
      <div className="userinfo-card">
        <h1>Complete Your Profile</h1>
        <p className="subtitle">
          We need a few details to get you started
        </p>

        <form onSubmit={handleSubmit}>
          
          <input
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Apartment Name"
            value={form.apartment}
            onChange={(e) =>
              setForm({ ...form, apartment: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="House Number"
            value={form.houseNo}
            onChange={(e) =>
              setForm({ ...form, houseNo: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            required
          />

          {/* ROLE SELECTION */}
          <div className="role-section">
            
            <label>
              <input
                type="radio"
                value="book"
                checked={form.role === "book"}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              />
              Book Slot
            </label>

            <label>
              <input
                type="radio"
                value="give"
                checked={form.role === "give"}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              />
              Give Slot
            </label>

          </div>

          <button type="submit">Continue</button>
        </form>
      </div>
    </div>
  );
}

export default UserInfo;