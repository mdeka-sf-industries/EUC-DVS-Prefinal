import GenAiAssistant from "./GenAiAssistant";
import styles from "./GenAiChatPage.module.css";

type GenAiChatPageProps = {
  onBack: () => void;
};

const GenAiChatPage = ({ onBack }: GenAiChatPageProps) => {
  return (
    <section className={styles.page} aria-labelledby="genai-page-title">
      <div className={styles.inner}>
        <header className={styles.header}>
          <button className={styles.backButton} type="button" onClick={onBack}>
            ← Go back to Home
          </button>
          <div className={styles.headerContent}>
            <p className={styles.kicker}>Kenton Energy AI</p>
            <h1 className={styles.title} id="genai-page-title">
              Your solar concierge for plans, savings, and clean energy
            </h1>
            <p className={styles.subtitle}>
              Ask questions, upload roof photos, and get personalized estimates
              for your home energy goals.
            </p>
          </div>
        </header>
        <div className={styles.assistant}>
          <GenAiAssistant />
        </div>
      </div>
    </section>
  );
};

export default GenAiChatPage;
