import { useState } from "react";
import { orgGateApi } from "../../../api";
import "../styles/register.css";

export default function RegisterPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submitRegistration(event) {
    event.preventDefault();

    try {
      setError("");
      setStatus("loading");

      const data = await orgGateApi.createOrganization({
        organizationName,
      });

      setResult(data);
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Registration failed.");
    }
  }

  function copy(value) {
    navigator.clipboard.writeText(value);
  }

  return (
    <main className="registerPage">
      <section className="registerCard">
        <p className="registerEyebrow">Create workspace</p>

        <h1>Register your organization</h1>

        <p className="registerIntro">
          Create a private workspace for your team. Save the generated codes
          somewhere safe.
        </p>

        {status === "success" && result ? (
          <div className="registerSuccess">
            <h2>{result.organization.name} is ready</h2>

            <p className="registerWarning">
              Save these codes now. The admin code will not be shown again.
            </p>

            <CodeBox label="Organization access code" value={result.accessCode} onCopy={copy} />
            <CodeBox label="Admin code" value={result.adminCode} onCopy={copy} />

            <a className="btn registerEnterLink" href="/blog">
              Enter workspace
            </a>
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

            <button
              className="btn"
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Creating..." : "Create organization"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function CodeBox({ label, value, onCopy }) {
  return (
    <div className="registerCodeBox">
      <span>{label}</span>
      <code>{value}</code>
      <button className="btn btnSecondary" type="button" onClick={() => onCopy(value)}>
        Copy
      </button>
    </div>
  );
}