import styles from "./WelcomePanel.module.css";
import { Customer } from "../types";

type WelcomePanelProps = {
  customer: Customer;
};

const WelcomePanel = ({ customer }: WelcomePanelProps) => {
  return (
    <section className={styles.panel}>
      <div className={styles.content}>
        <p className={styles.kicker}>Hello</p>
        <h1 className={styles.title}>
          {customer.name} <span aria-hidden="true">👋</span>
        </h1>
        <p className={styles.subtitle}>
          Welcome! We are here to help you with your energy and sustainability
          needs. Pay your bill, set up autopay, investigate energy savings, and
          more from your dashboard.
        </p>
      </div>
      <div className={styles.heroSpacer} aria-hidden="true" />
    </section>
  );
};

export default WelcomePanel;
