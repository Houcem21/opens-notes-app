import { useState } from "react";
import ErrorMessage from "./ErrorMessage";
import { orgGateApi } from "../../api/orgGate";

export default function OrgGate({ onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      const session = await orgGateApi.enterOrg(code.trim());
      onSuccess(session.organization);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="authPage">
      <form className="authCard" onSubmit={handleSubmit}>
        <h1>Organization Access</h1>
        <p className="mutedText">Enter your organization access code.</p>

        <label className="label"></label>
        <input
          className="input"
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button className="btn authSubmitButton" type="submit">
          Continue
        </button>

        <ErrorMessage message={error} />
      </form>
    </main>
  );
}