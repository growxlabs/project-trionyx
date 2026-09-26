import type { Metadata } from "next";
import Image from "next/image";
import DealerLoginForm from "./DealerLoginForm";
import styles from "./dealer-access.module.css";

export const metadata: Metadata = {
  title: "Dealer Access | Trionyx",
  description: "Sign in to the Trionyx dealer portal.",
};

export default function DealerAccessPage() {
  return (
    <main className={styles.page}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <Image
            className={styles.logo}
            src="/brand/trionyx-logo-dark.png"
            alt="Trionyx — Always Exceed Expectations"
            width={2092}
            height={752}
            priority
          />
          <h1 id="dealer-access-title" className={styles.title}>
            Dealer Access
          </h1>
          <p className={styles.intro}>Sign in to your dealer account.</p>
          <section className={styles.formCard} aria-label="Dealer sign-in form">
            <DealerLoginForm />
          </section>
        </div>
      </div>
      <div className={styles.visual}>
        <Image
          src="/images/dealer/coating-surface.png"
          alt="Water beading on a coated car surface"
          fill
          sizes="(max-width: 800px) 100vw, 45vw"
          className={styles.coatingImage}
          priority
        />
      </div>
    </main>
  );
}
