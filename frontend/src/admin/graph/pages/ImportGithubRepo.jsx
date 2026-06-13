import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orgGateApi } from "../../../api";
import LoadingScreen from "../../../common/feedback/LoadingScreen";

export default function ImportGithubRepo() {
  const navigate = useNavigate();

  const [repoUrl, setRepoUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function importRepo(event) {
    event.preventDefault();

    try {
      setError("");
      setResult(null);
      setStatus("loading");

      const data = await orgGateApi.importGithubRepo(repoUrl.trim());

      setResult(data);
      setStatus("success");

      setTimeout(() => {
        navigate("/admin/graph");
      }, 900);
    } catch (err) {
      setStatus("idle");
      setError(err.message || "Failed to import repository.");
    }
  }

  return (
    <>
      <LoadingScreen visible={status === "loading"} text="Importing repo" />

      {status !== "loading" && (
        <main className="registerPage">
          <section className="registerCard">
            <p className="registerEyebrow">GitHub Import</p>

            <h1>Import repository structure</h1>

            <p className="registerIntro">
              Paste a public GitHub repository URL. We’ll create a graph from
              its folder structure.
            </p>

            {error && <p className="errorText">{error}</p>}

            {result && (
              <div className="registerSuccess">
                <h2>Graph created</h2>
                <p>
                  Imported {result.importedCount} nodes into{" "}
                  <strong>{result.tree?.name}</strong>.
                </p>
              </div>
            )}

            <form className="registerForm" onSubmit={importRepo}>
              <label>
                GitHub repository URL
                <input
                  className="input"
                  value={repoUrl}
                  placeholder="https://github.com/user/repo"
                  onChange={(event) => setRepoUrl(event.target.value)}
                  required
                />
              </label>

              <button className="btn" type="submit">
                Import repository
              </button>

              <button
                className="btn btnSecondary"
                type="button"
                onClick={() => navigate("/admin/graph")}
              >
                Cancel
              </button>
            </form>
          </section>
        </main>
      )}
    </>
  );
}