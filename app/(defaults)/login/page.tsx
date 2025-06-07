"use client";
import { useRouter } from "next/navigation";
import React, { useState, FormEvent } from "react";
import IconLockDots from "@/components/icon/icon-lock-dots";
import IconMail from "@/components/icon/icon-mail";

const ComponentsAuthLoginForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [usertype, setUsertype] = useState(""); // default role
  const [confirmPassword, setConfirmPassword] = useState(""); // For account creation
  const [error, setError] = useState("");
  const [createAccount, setCreateAccount] = useState(false); // Toggle between login and account creation

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();

    if (createAccount) {
      // Handle account creation
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        const response = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password, usertype }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Account created successfully.");
          setCreateAccount(false);
          setPassword("");
          setConfirmPassword("");
          setError(""); // clear errors
        } else {
          setError(data.message || "Failed to create account");
        }
      } catch (err) {
        setError("Something went wrong during account creation.");
      }
    } else {
      // Handle login
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log(data.userId);

        if (response.ok) {
          localStorage.setItem("auth", "true");
          localStorage.setItem("userId", data.userId);
          console.log("User ID from API response:", data.userId); // Debugging line

          localStorage.setItem("email", username);
          localStorage.setItem("password", password);


          if (

            data.role === "admin" ||
            data.role === "staff"

          ) {
            router.push("/owner");
          } else if (data.role === "developer") {
            localStorage.setItem("userId", data.userId);
            // If the role is "developer", route to the developer's profile page
            router.push(`/ownerProfile/${data.userId}`);
            
            
          } else {
            console.error("Unknown role:", data.role);
          }
        } else {
          setError(data.message || "Login failed");
        }
      } catch (err) {
        setError("Something went wrong during login.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-10 shadow-lg">
        <div className="mb-4 mt-2 flex justify-center">
          <img src="/assets/images/logo.jpg" alt="Logo" className="h-20" />
        </div>
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          {createAccount ? "CREATE ACCOUNT" : "SIGN IN"}
        </h2>
        <form className="space-y-5" onSubmit={submitForm}>
          {createAccount && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter Username"
                className="form-input block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              className="form-input block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {createAccount && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                User Type
              </label>
              <select
                className="form-select block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900"
                value={usertype}
                onChange={(e) => setUsertype(e.target.value)}
              >
                <option value="" disabled>
      Select the user type
    </option>

                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className="form-input block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {createAccount && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                className="form-input block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error && <div className="text-sm text-red-500">{error}</div>}
          <button
            type="submit"
            className="btn btn-gradient mt-6 w-full rounded-md border-0 bg-gradient-to-r from-purple-500 to-pink-500 py-2 font-bold uppercase text-white shadow-lg"
          >
            {createAccount ? "Create Account" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setCreateAccount(!createAccount)}
            className="text-sm text-indigo-500 hover:text-indigo-700"
          >
            {createAccount
              ? "Already have an account? Sign In"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComponentsAuthLoginForm;
