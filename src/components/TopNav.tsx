import styles from "./TopNav.module.css";
import { Customer } from "../types";

type TopNavProps = {
  customer?: Customer | null;
};

const TopNav = ({ customer }: TopNavProps) => {
  const isNewCustomer = customer == null;

  return (
    <header className={styles.nav}>
      <div className={styles.brand}>
        <img
          className={styles.logo}
          src="/logo.png"
          alt="Kenton Energy logo"
        />
      </div>
      <nav className={styles.links} aria-label="Primary">
        {isNewCustomer ? (
          <button className={styles.linkButton}>Home</button>
        ) : (
          <>
            <button className={styles.linkButton}>Overview</button>
            <button className={styles.linkButton}>Usage & Plans</button>
            <button className={styles.linkButton}>Order History</button>
            <button className={styles.linkButton}>Offers & Rebates</button>
          </>
        )}
      </nav>
      <div className={styles.actions}>
        {isNewCustomer ? (
          <span className={styles.greeting}>Hello, Sign in?</span>
        ) : (
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
    </header>
  );
};

export default TopNav;
