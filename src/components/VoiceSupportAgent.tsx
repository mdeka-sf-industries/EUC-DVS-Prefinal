import { useEffect } from "react";
import styles from "./VoiceSupportAgent.module.css";

const WIDGET_SCRIPT_SRC =
  "https://unpkg.com/@elevenlabs/convai-widget-embed";

const VoiceSupportAgent = () => {
  useEffect(() => {
    const existingScript = document.querySelector(
      `script[src="${WIDGET_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);
  }, []);

  return (
    <div className={styles.widget}>
      <elevenlabs-convai agent-id="agent_0301kf2kh3ebespvte2xh3xpa56x"></elevenlabs-convai>
    </div>
  );
};

export default VoiceSupportAgent;
