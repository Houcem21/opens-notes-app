import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { orgGateApi } from "../../../api";
import LoadingScreen from "../../../common/components/loading/LoadingScreen";
import "../styles/register.css";

export default function ConfirmRegistrationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [organization, setOrganization] = useState(null);
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    async function confirm() {
      if (!token) {
        setStatus("error");
        setError("Missing verification token.");
        return;
      }

      try {
        const data = await orgGateApi.confirmOrgRegistration(token);
        setOrganization(data.organization);
        setStatus("success");
      } catch (err) {
        setError(err.message || "Verification failed.");
        setStatus("error");
      }
    }

    confirm();
  }, [token]);

  if (status === "loading") {
    return <LoadingScreen text="Creating workspace" />;
  }

  return (
    <main className="registerPage">
      <section className="registerCard">
        {status === "success" ? (
          <>
            <p className="registerEyebrow">Workspace ready</p>
            <h1>{organization?.name} is ready</h1>
            <p className="registerIntro">
              We sent the organization access code and admin code to your email.
            </p>

            <Link className="btn" to="/blog">
              Enter organization
            </Link>
          </>
        ) : (
          <>
            <p className="registerEyebrow">Verification failed</p>
            <h1>Could not create workspace</h1>
            <p className="errorText">{error}</p>

            <Link className="btn" to="/register">
              Try again
            </Link>
          </>
        )}
      </section>
    </main>
  );
}