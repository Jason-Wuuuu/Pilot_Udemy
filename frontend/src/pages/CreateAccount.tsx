import { useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../api/axios"; // your axios instance
import BackToHomepage from "../components/BackToHomepage";

type Role = "ADMIN" | "STUDENT";

const CreateAccount = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STUDENT");
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (role === "ADMIN" && invitationCode !== "pilot") {
      alert("Incorrect invitation code");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        role,
      });

      alert("Account created successfully!");
      navigate("/login"); // redirect to login page
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BackToHomepage />
      <div className="w-full max-w-md p-6 border rounded space-y-6">
        <h1 className="text-2xl font-bold text-center">Create an Account</h1>

        {/* Username */}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username"
          className="input input-bordered w-full"
        />

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="input input-bordered w-full"
        />

        {/* Password */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input input-bordered w-full"
        />

        {/* Role Selection */}
        <div className="flex gap-6">
          <label>
            <input
              type="radio"
              name="role"
              value="ADMIN"
              checked={role === "ADMIN"}
              onChange={() => setRole("ADMIN")}
              className="radio"
            />
            ADMIN
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="STUDENT"
              checked={role === "STUDENT"}
              onChange={() => setRole("STUDENT")}
              className="radio"
            />
            STUDENT
          </label>
        </div>

        {/* Invitation Code (only for ADMIN) */}
        {role === "ADMIN" && (
          <input
            type="text"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value)}
            placeholder="Enter admin invitation code"
            className="input input-bordered w-full"
          />
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        {/* Back to Login */}
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="link link-hover">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAccount;
