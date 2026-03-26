import { useState } from "react";
import styles from "./App.module.css";
import { customer } from "./data/mockData";
import type { Tariff, SolarSavingsSummary } from "./types";
import TopNav from "./components/TopNav";
import NewCustomerHome from "./components/NewCustomerHome";
import type { AgentConversationState } from "./components/NewCustomerHome";
import GenAiChatPage from "./components/GenAiChatPage";
import EnrollmentPage from "./components/EnrollmentPage";
import Footer from "./components/Footer";

const App = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "genai" | "enrollment">(
    "dashboard"
  );
  const [enrollmentReturnView, setEnrollmentReturnView] = useState<
    "dashboard" | "genai"
  >("dashboard");
  const [agentConversationState, setAgentConversationState] =
    useState<AgentConversationState | null>(null);
  const solarConciergeFromChatWithBill = false;
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [selectedSolarSummary, setSelectedSolarSummary] =
    useState<SolarSavingsSummary | null>(null);

  const handleSignUpForTariff = (
    tariff: Tariff,
    solarSummary?: SolarSavingsSummary
  ) => {
    setSelectedTariff(tariff);
    setSelectedSolarSummary(solarSummary ?? null);
    setActiveView("enrollment");
  };

  const handleEnrollmentBack = () => {
    setSelectedTariff(null);
    setSelectedSolarSummary(null);
    setActiveView(enrollmentReturnView);
  };

  const handleEnrollmentComplete = () => {
    setSelectedTariff(null);
    setSelectedSolarSummary(null);
    setAgentConversationState(null);
    setActiveView("dashboard");
  };

  return (
    <div className={styles.page} data-device-preview="true">
      <div className={styles.deviceFrame}>
        <div className={styles.deviceScreen}>
          <div className={styles.deviceTopChrome} aria-hidden>
            <div className={styles.deviceNotch} />
          </div>
          <div className={styles.statusBar} aria-hidden>
            <img
              className={styles.statusBarImage}
              src="/status-bar-light.png"
              alt=""
            />
          </div>
          <div id="device-floating-root" className={styles.deviceFloatingRoot} />
          <div className={styles.deviceViewport}>
            <div className={styles.content}>
              <TopNav
                customer={activeView === "dashboard" ? null : customer}
                minimal={activeView === "genai" || activeView === "enrollment"}
              />
              <main className={styles.main}>
                {activeView === "dashboard" ? (
                  <NewCustomerHome
                    initialConversationState={agentConversationState}
                    onConversationStateChange={setAgentConversationState}
                    onSignUpForTariff={(tariff, solarSummary) => {
                      setEnrollmentReturnView("dashboard");
                      handleSignUpForTariff(tariff, solarSummary);
                    }}
                  />
                ) : activeView === "enrollment" && selectedTariff ? (
                  <EnrollmentPage
                    tariff={selectedTariff}
                    solarSummary={selectedSolarSummary}
                    onBack={handleEnrollmentBack}
                    onComplete={handleEnrollmentComplete}
                  />
                ) : (
                  <GenAiChatPage
                    onBack={() => setActiveView("dashboard")}
                    onSignUpForTariff={(tariff, solarSummary) => {
                      setEnrollmentReturnView("genai");
                      handleSignUpForTariff(tariff, solarSummary);
                    }}
                    hasBillContextFromChat={solarConciergeFromChatWithBill}
                  />
                )}
              </main>
            </div>
            {activeView === "dashboard" && <Footer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
