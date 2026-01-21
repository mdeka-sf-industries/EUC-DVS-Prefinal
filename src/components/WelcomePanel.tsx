import styles from "./WelcomePanel.module.css";
import { Customer } from "../types";

type WelcomePanelProps = {
  customer: Customer;
  onCtaClick?: () => void;
};

const WelcomePanel = ({ customer, onCtaClick }: WelcomePanelProps) => {
  return (
    <section className={styles.panel}>
      <div className={styles.content}>
        <p className={styles.kicker}>Hello</p>
        <h1 className={styles.title}>
          {customer.name} <span aria-hidden="true">👋</span>
        </h1>
        <p className={styles.subtitle}>
          Welcome! We are here to help you explore solar options, track clean
          energy usage, and unlock savings on your green energy plan.
        </p>
        <button
          className={styles.ctaButton}
          type="button"
          onClick={onCtaClick}
        >
          Switch to Solar
        </button>
      </div>
      <div className={styles.heroSpacer} aria-hidden="true" />
    </section>
  );
};

export default WelcomePanel;
