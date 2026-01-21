import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import api from "../api/axios"; // your axios instance
import type { AppDispatch } from "../store";

interface DeleteAccountButtonProps {
  userId: string;
  className?: string; // allow custom styling
}

const DeleteAccountButton = ({
  userId,
  className,
}: DeleteAccountButtonProps) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (!confirm) return;

    try {
      setLoading(true);

      // DELETE request to backend aligned with your endpoint
      await api.delete(`/users/${userId}`);

      // Clear auth from Redux + localStorage
      dispatch(logout());

      // Redirect to homepage
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Delete account error:", err);
      alert(err.response?.data?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className={className || "btn btn-outline btn-error w-full"}
      disabled={loading}
    >
      {loading ? "Deleting..." : "Delete Account"}
    </button>
  );
};

export default DeleteAccountButton;
