import styles from "./InsightsAlerts.module.css";
import { InsightAlert } from "../types";

type InsightsAlertsProps = {
  insights: InsightAlert[];
};

const InsightsAlerts = ({ insights }: InsightsAlertsProps) => {
  return (
    <section className={styles.card}>
      <h2>Insights & Alerts</h2>
      {insights.length === 0 ? (
        <div className={styles.emptyState}>
          {/* Empty state visual placeholder */}
          <div className={styles.emptyVisual}>Empty State Visual</div>
          <p>No alerts at the moment. You're all set.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {insights.map((insight) => (
            <div key={insight.id} className={styles.alertCard}>
              <span className={styles.badge}>{insight.type}</span>
              <div>
                <h3 className={styles.title}>{insight.title}</h3>
                <p className={styles.description}>{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default InsightsAlerts;
