// src/pages/ForgotPassword.tsx
import { Link } from "react-router";
import NavBar from "../components/NavBar";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Navbar stays at top */}
      <NavBar />

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
          <div className="card-body space-y-6">
            <h1 className="text-2xl font-bold text-center">
              Forgot your password?
            </h1>

            <p className="text-center text-base-content/70">
              Don’t worry — we’ve got you covered.
            </p>

            {/* Info box */}
            <div className="rounded-lg border-l-4 border-primary bg-base-200 p-4 text-center space-y-2">
              <p className="font-semibold text-base-content">
                Password resets are handled manually
              </p>
              <p className="text-sm text-base-content/80">
                Please contact the <strong>Marketing Team</strong> for
                assistance with resetting your password.
              </p>
            </div>

            <div className="text-center">
              <a
                href="mailto:marketing@example.com"
                className="link link-primary text-lg"
              >
                marketing@example.com
              </a>
            </div>

            <div className="card-actions justify-center pt-4">
              <Link to="/login" className="btn btn-outline btn-sm">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
