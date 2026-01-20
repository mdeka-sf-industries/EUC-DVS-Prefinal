import styles from "./UsageSummary.module.css";
import { UsageSummary as UsageSummaryType } from "../types";

type UsageSummaryProps = {
  usage: UsageSummaryType;
  accountId?: string;
};

const UsageSummary = ({ usage, accountId }: UsageSummaryProps) => {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2>Current Usage & Bill Summary</h2>
          <p className={styles.subtitle}>{usage.month} usage overview</p>
        </div>
        {accountId ? (
          <span className={styles.accountBadge}>Acct {accountId}</span>
        ) : null}
      </div>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.label}>Monthly usage</span>
          <strong>{usage.kwh} kWh</strong>
          <span className={styles.caption}>
            Last month {usage.lastMonthKwh} kWh
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Current bill</span>
          <strong>${usage.billAmount}</strong>
          <span className={styles.caption}>
            {usage.billChangePct}% increase vs last month
          </span>
        </div>
      </div>
      <div className={styles.chartPlaceholder}>
        <img
          className={styles.chartImage}
          src="/usage-graph.jpg"
          alt="Monthly usage chart"
        />
      </div>
      <div className={styles.actions}>
        <button className={styles.secondaryButton}>Enable Autopay</button>
        <button className={styles.primaryButton}>Pay Now</button>
      </div>
    </section>
  );
};

export default UsageSummary;
