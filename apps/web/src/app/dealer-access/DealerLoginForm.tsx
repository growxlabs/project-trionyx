"use client";

import { useState, type FormEvent } from "react";
import styles from "./dealer-access.module.css";

export default function DealerLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setMessage("");
    setIsSubmitting(true);
    // Authentication is not connected yet. Keep the entered password in the form only.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMessage("Dealer sign-in is not available yet.");
    setIsSubmitting(false);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="dealer-email">Email</label>
        <input id="dealer-email" name="email" type="email" autoComplete="username" placeholder="dealer@example.com" required onChange={() => setMessage("")} />
      </div>
      <div className={styles.field}>
        <label htmlFor="dealer-password">Password</label>
        <div className={styles.passwordWrap}>
          <input id="dealer-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required onChange={() => setMessage("")} />
          <button type="button" className={styles.toggle} onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {message && <p className={styles.message} role="alert">{message}</p>}
      <button className={styles.submit} type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "SIGN IN"}</button>
      <button className={styles.forgot} type="button" onClick={() => setMessage("Password recovery is not available yet.")}>Forgot password?</button>
    </form>
  );
}
