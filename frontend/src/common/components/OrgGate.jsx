import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import { orgGateApi } from "../../api";

export default function OrgGate({ onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!code.trim()) {
      setError("Please enter your organization access code.");
      return;
    }

    try {
      setError("");
      setSubmitting(true);

      const session = await orgGateApi.enterOrg(code.trim());
      onSuccess(session.organization);
    } catch (err) {
      setError(err.message || "Could not enter organization.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="authPage">
      <form className="authCard" onSubmit={handleSubmit}>
        <p className="authEyebrow">Private workspace</p>

        <h1>Organization Access</h1>

        <p className="mutedText">
          Enter your organization access code to open your team workspace.
        </p>

        <label className="label" htmlFor="organization-code">
          Access code
        </label>

        <input
          id="organization-code"
          className="input"
          type="password"
          value={code}
          autoComplete="off"
          placeholder="Enter access code"
          onChange={(event) => setCode(event.target.value)}
        />

        <button
          className="btn authSubmitButton"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Checking..." : "Continue"}
        </button>

        <ErrorMessage message={error} />

        <div className="authDivider" />

        <p className="authHelpText">
          Don&apos;t have an organization yet?
        </p>

        <Link className="btn btnSecondary authRegisterLink" to="/register">
          Register a new organization
        </Link>
      </form>
    </main>
  );
}