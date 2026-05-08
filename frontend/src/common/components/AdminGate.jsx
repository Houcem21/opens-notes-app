import { useState } from "react";
import ErrorMessage from "./ErrorMessage";
import { orgGateApi } from "../../api";

export default function AdminGate({ onSuccess }) {
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      const session = await orgGateApi.enterAdmin(adminCode.trim());
      onSuccess(session.adminToken);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="authPage">
      <form className="authCard" onSubmit={handleSubmit}>
        <h1>Admin Access</h1>
        <p className="mutedText">Enter the admin code for this organization.</p>

        <label className="label">Admin Code</label>
        <input
          className="input"
          type="password"
          value={adminCode}
          onChange={(e) => setAdminCode(e.target.value)}
        />

        <button className="btn authSubmitButton" type="submit">
          Continue
        </button>

        <ErrorMessage message={error} />
      </form>
    </main>
  );
}