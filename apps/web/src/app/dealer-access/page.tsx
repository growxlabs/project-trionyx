import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./dealer-access.module.css";

export const metadata: Metadata = {
  title: "Dealer Access | Trionyx",
  description: "Sign in to the Trionyx dealer portal.",
};

export default function DealerAccessPage() {
  const portalBase =
    process.env.DEALER_PORTAL_URL ??
    process.env.NEXT_PUBLIC_DEALER_PORTAL_URL ??
    (process.env.NODE_ENV === "development" ? "http://localhost:3001" : undefined);
  let loginUrl: URL | undefined;

  if (portalBase) {
    try {
      const candidate = new URL("/login", portalBase);
      if (candidate.protocol === "https:" || candidate.protocol === "http:") loginUrl = candidate;
    } catch {}
  }

  if (loginUrl) redirect(loginUrl.toString());

  return (
    <main className={styles.page}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brandRow}>
            <Link href="/" className={styles.brandLink} aria-label="Back to Trionyx home">
              <Image
                className={styles.logo}
                src="/brand/trionyx-logo-dark.png"
                alt="Trionyx — Always Exceed Expectations"
                width={2092}
                height={752}
                priority
              />
            </Link>
            <Link href="/" className={styles.backLink}>
              <span aria-hidden="true">←</span> Back to site
            </Link>
          </div>
          <p className={styles.eyebrow}><span aria-hidden="true" /> PARTNER PORTAL</p>
          <h1 id="dealer-access-title" className={styles.title}>
            Dealer Access
          </h1>
          <p className={styles.intro}>The dealer portal is currently unavailable from this site.</p>
          <section className={styles.formCard} aria-label="Dealer portal information">
            <p>For account access, please contact your Trionyx distributor.</p>
            <Link href="/contact" className={styles.contactLink}>Contact Trionyx →</Link>
          </section>
          <p className={styles.accessNote}>FOR AUTHORISED TRIONYX DEALERS <span>·</span> INDIA</p>
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
        <div className={styles.visualCaption}>
          <span>01 / SURFACE PROTECTION</span>
          <span>ALWAYS EXCEED EXPECTATIONS</span>
        </div>
      </div>
    </main>
  );
}
