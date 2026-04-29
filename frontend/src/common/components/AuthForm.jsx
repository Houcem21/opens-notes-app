import { useState } from "react";
import ErrorMessage from "./ErrorMessage";

export default function AuthForm({
  title = "Login",
  submitLabel = "Login",
  error,
  onSubmit,
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="authPage">
      <form className="authCard" onSubmit={handleSubmit}>
        <h1>{title}</h1>

        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              email: e.target.value,
            }))
          }
        />

        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm((current) => ({
              ...current,
              password: e.target.value,
            }))
          }
        />

        <button className="btn authSubmitButton" type="submit">
          {submitLabel}
        </button>

        <ErrorMessage message={error} />
      </form>
    </div>
  );
}