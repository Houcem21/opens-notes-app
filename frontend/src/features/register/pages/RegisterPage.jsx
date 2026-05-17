import { useState } from "react";
import { orgGateApi } from "../../../api";
import "../styles/register.css";

export default function RegisterPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submitRegistration(event) {
    event.preventDefault();

    try {
      setError("");
      setStatus("loading");

      await orgGateApi.requestOrgRegistration({
        organizationName,
        email,
      });

      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Registration failed.");
    }
  }

  return (
    <main className="registerPage">
      <section className="registerCard">
        <p className="registerEyebrow">Create workspace</p>
        <h1>Register your organization</h1>
        <p className="registerIntro">
          Enter your organization name and email. We’ll send a verification link
          before creating your workspace.
        </p>

        {status === "success" ? (
          <div className="registerSuccess">
            <h2>Check your email</h2>
            <p>
              We sent you a verification link. Open it to create your
              organization and receive your access codes.
            </p>
          </div>
        ) : (
          <form className="registerForm" onSubmit={submitRegistration}>
            {error && <p className="errorText">{error}</p>}

            <label>
              Organization name
              <input
                className="input"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                required
              />
            </label>

            <label>
              Email
              <input
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <button className="btn" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send verification email"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}