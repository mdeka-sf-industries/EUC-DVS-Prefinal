import styles from "./App.module.css";
import { customer, insights, quickActions, usageSummary } from "./data/mockData";
import TopNav from "./components/TopNav";
import WelcomePanel from "./components/WelcomePanel";
import UsageSummary from "./components/UsageSummary";
import QuickActions from "./components/QuickActions";
import InsightsAlerts from "./components/InsightsAlerts";
import VoiceSupportAgent from "./components/VoiceSupportAgent";
import Footer from "./components/Footer";

const App = () => {
  const activeInsights = insights.filter((insight) => insight.isActive);

  return (
    <div className={styles.page}>
      <TopNav customer={customer} />
      <div className={styles.content}>
        <main className={styles.main}>
          <WelcomePanel customer={customer} />
          <div className={styles.mainGrid}>
            <UsageSummary usage={usageSummary} accountId={customer.accountId} />
            <div className={styles.sideColumn}>
              <InsightsAlerts insights={activeInsights} />
              <QuickActions actions={quickActions} />
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <VoiceSupportAgent />
    </div>
  );
};

export default App;
