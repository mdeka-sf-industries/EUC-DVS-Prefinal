import styles from "./QuickActions.module.css";
import { QuickAction } from "../types";

type QuickActionsProps = {
  actions: QuickAction[];
};

const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <section className={styles.card}>
      <h2>Quick Actions</h2>
      <div className={styles.grid}>
        {actions.map((action) => (
          <button key={action.id} className={styles.actionCard}>
            <span className={styles.iconPlaceholder} aria-hidden="true" />
            <div className={styles.actionContent}>
              <span className={styles.title}>{action.title}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
