import { useState } from "react";
import styles from "./TopNav.module.css";
import { Customer } from "../types";

type TopNavProps = {
  customer?: Customer | null;
  minimal?: boolean;
};

const TopNav = ({ customer, minimal = false }: TopNavProps) => {
  const isNewCustomer = customer == null || minimal;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.nav}>
      <div className={styles.navBar}>
        <div className={styles.brand}>
          <img
            className={styles.logo}
            src="/logo.png"
            alt="Kenton Energy logo"
          />
        </div>
        {!minimal && (
          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-controls="primary-nav-panel"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className={styles.menuIcon} aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
        )}
      </div>
      {!minimal && (
        <div
          id="primary-nav-panel"
          className={menuOpen ? `${styles.navPanel} ${styles.navPanelOpen}` : styles.navPanel}
        >
          <nav className={styles.links} aria-label="Primary">
            {!isNewCustomer && (
              <>
                <button className={styles.linkButton}>Overview</button>
                <button className={styles.linkButton}>Usage & Plans</button>
                <button className={styles.linkButton}>Order History</button>
                <button className={styles.linkButton}>Offers & Rebates</button>
              </>
            )}
          </nav>
          <div className={styles.actions}>
            {!isNewCustomer && (
              <>
                <div className={styles.greeting}>Hi, {customer.name}</div>
                <button className={styles.iconButton} aria-label="Notifications">
                  <span className={styles.iconPlaceholder} />
                </button>
                <button className={styles.iconButton} aria-label="Profile">
                  <span className={styles.iconPlaceholder} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default TopNav;
