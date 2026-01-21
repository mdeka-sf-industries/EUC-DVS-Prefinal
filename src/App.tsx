import { useState } from "react";
import styles from "./App.module.css";
import { customer, insights, quickActions, usageSummary } from "./data/mockData";
import TopNav from "./components/TopNav";
import WelcomePanel from "./components/WelcomePanel";
import UsageSummary from "./components/UsageSummary";
import QuickActions from "./components/QuickActions";
import InsightsAlerts from "./components/InsightsAlerts";
import GenAiChatPage from "./components/GenAiChatPage";
import Footer from "./components/Footer";

const App = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "genai">(
    "dashboard"
  );
  const activeInsights = insights.filter((insight) => insight.isActive);

  return (
    <div className={styles.page}>
      <TopNav customer={customer} />
      <div className={styles.content}>
        <main className={styles.main}>
          {activeView === "dashboard" ? (
            <>
              <WelcomePanel
                customer={customer}
                onCtaClick={() => setActiveView("genai")}
              />
              <div className={styles.mainGrid}>
                <UsageSummary
                  usage={usageSummary}
                  accountId={customer.accountId}
                />
                <div className={styles.sideColumn}>
                  <InsightsAlerts insights={activeInsights} />
                  <QuickActions actions={quickActions} />
                </div>
              </div>
            </>
          ) : (
            <GenAiChatPage onBack={() => setActiveView("dashboard")} />
          )}
        </main>
      </div>
      {activeView === "dashboard" && <Footer />}
    </div>
  );
};

export default App;
