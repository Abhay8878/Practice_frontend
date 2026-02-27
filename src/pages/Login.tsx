import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import strings from "../language";
import { App_config } from "../../tailwind.config";

type Mode = "login" | "forgot" | "reset";

import type { ApiErrorResponse } from "../types/apiError";
//import { string } from "zod";
import { useLanguage } from "../language/useLanguage";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as ApiErrorResponse).message;
    return Array.isArray(message) ? message.join(", ") : message;
  }

  return fallback;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Login: React.FC = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  //const t = strings[language];
  const navigate = useNavigate();

  const passwordsMismatch =
    mode === "reset" &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  // ================= LOGIN =================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      // ❗ Always check result.success (not res.ok only)
      if (!result.success) {
        throw new Error(result.message);
      }

      const data = result.data;

      // Practitioner type validation
      if (
        data.practitionerType !== "Practice" &&
        data.practitionerType !== "Team Member" &&
        data.practitionerType !== "Admin"
      ) {
        throw new Error("Access denied. Practice or Team Member users only.");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("practitionerType", data.practitionerType);
      localStorage.setItem("tenantId", data.tenantId);

      if (data.addressId) {
        localStorage.setItem("addressId", String(data.addressId));
      }

      setMessage(result.message); // ✅ show backend success message
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // ================= FORGOT PASSWORD =================
  const handleForgot = async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      if (result.data?.token) {
        // DEV MODE ONLY
        setToken(result.data.token);
        setMode("reset");
        setConfirmPassword("");
        setPassword("");
      } else {
        setMessage(result.message);
      }
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Request failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // ================= RESET PASSWORD =================
  const handleReset = async () => {
    if (!token) return;

    setError("");
    setMessage("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setMessage(result.message);
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setToken(null);
    } catch (error: unknown) {
      setError(getApiErrorMessage(error, "Reset failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* LEFT IMAGE */}
      <div className="w-[70%] relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/src/assets/imgDental.jpg')` }}
        />
      </div>

      {/* RIGHT FORM */}
      <div className="w-[30%] flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2">
            {mode === "login" && "Doctor Login"}
            {mode === "forgot" && "Forgot Password"}
            {mode === "reset" && "Reset Password"}
          </h2>

          <p className="text-gray-600 mb-6">
            {mode === "login" && "Enter your credentials"}
            {mode === "forgot" && "Enter your email"}
          </p>

          {error && <p className="text-red-700 mb-3">{error}</p>}
          {message && <p className="text-green-700 mb-3">{message}</p>}

          {/* LOGIN */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                required
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                required
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-white rounded-lg bg-[#409bc8] hover:bg-[#3587af] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Login"
                )}
              </button>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm hover:underline"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          {/* FORGOT */}
          {mode === "forgot" && (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={isLoading}
              />

              <button
                onClick={handleForgot}
                disabled={isLoading}
                className="w-full py-3 text-white rounded-lg bg-[#409bc8] hover:bg-[#3587af] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Send Reset"
                )}
              </button>

              <button
                onClick={() => setMode("login")}
                className="text-sm hover:underline flex items-center gap-2"
                disabled={isLoading}
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </button>
            </div>
          )}

          {/* RESET */}
          {mode === "reset" && (
            <div className="space-y-4">
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={isLoading}
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                disabled={isLoading}
              />

              {passwordsMismatch && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}

              <button
                onClick={handleReset}
                disabled={passwordsMismatch || isLoading}
                className="w-full py-3 text-white rounded-lg bg-[#409bc8] hover:bg-[#3587af] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          )}
          <div className="mt-10 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()}  {App_config.brandname}  {strings[language].copyright}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
