import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          ISINAI<span className={styles.logoDot}>·</span>
        </div>
        <div className={styles.logoSub}>admin</div>

        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navLink}>
            <span className={styles.navIndex}>01</span>
            Dashboard
          </Link>
          <Link href="/admin/data-entry" className={styles.navLink}>
            <span className={styles.navIndex}>02</span>
            Data entry
          </Link>
          <Link href="/admin/view-lexicon" className={styles.navLink}>
            <span className={styles.navIndex}>03</span>
            View lexicon
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backLink}>
            ← Back to site
          </Link>
        </div>
      </aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
}