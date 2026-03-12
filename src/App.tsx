import { useState } from "react";
import styles from "./App.module.css";
import { customer } from "./data/mockData";
import type { Tariff, SolarSavingsSummary } from "./types";
import TopNav from "./components/TopNav";
import NewCustomerHome from "./components/NewCustomerHome";
import GenAiChatPage from "./components/GenAiChatPage";
import EnrollmentPage from "./components/EnrollmentPage";
import Footer from "./components/Footer";

const App = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "genai" | "enrollment">(
    "dashboard"
  );
  const [solarConciergeFromChatWithBill, setSolarConciergeFromChatWithBill] =
    useState(false);
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
    setActiveView("genai");
  };

  return (
    <div className={styles.page}>
      <TopNav customer={activeView === "dashboard" ? null : customer} />
      <div className={styles.content}>
        <main className={styles.main}>
          {activeView === "dashboard" ? (
            <NewCustomerHome
              onExploreSolar={({ fromChatWithBill } = {}) => {
                setSolarConciergeFromChatWithBill(!!fromChatWithBill);
                setActiveView("genai");
              }}
            />
          ) : activeView === "enrollment" && selectedTariff ? (
            <EnrollmentPage
              tariff={selectedTariff}
              solarSummary={selectedSolarSummary}
              onBack={handleEnrollmentBack}
            />
          ) : (
            <GenAiChatPage
              onBack={() => setActiveView("dashboard")}
              onSignUpForTariff={handleSignUpForTariff}
              hasBillContextFromChat={solarConciergeFromChatWithBill}
            />
          )}
        </main>
      </div>
      {activeView === "dashboard" && <Footer />}
    </div>
  );
};

export default App;
