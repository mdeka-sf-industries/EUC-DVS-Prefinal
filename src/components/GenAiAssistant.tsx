import { useMemo, useState } from "react";
import type { SolarSavingsSummary, Tariff } from "../types";
import styles from "./GenAiAssistant.module.css";

const TARIFFS: Tariff[] = [
  {
    id: "solar-saver",
    name: "Solar Saver Tariff",
    price: "$89 / month",
    eyebrow: "Best for stability",
    description:
      "Predictable rates with net metering credits for excess energy.",
  },
  {
    id: "peak-smart",
    name: "Peak Smart Solar",
    price: "$109 / month",
    eyebrow: "Time-of-use",
    description:
      "Higher export credits during peak hours to maximize savings.",
  },
  {
    id: "solar-storage",
    name: "Solar + Storage Bundle",
    price: "$129 / month",
    eyebrow: "Backup ready",
    description:
      "Pair solar with battery storage for resilience and savings.",
  },
];

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  attachments?: { name: string; url?: string; type?: string }[];
  options?: string[];
  summary?: {
    panelCount: number;
    totalCost: number;
    estimatedMonthlySavings: number;
    estimatedSavingsPercentage: number;
    batterySelected: boolean;
  };
  typing?: boolean;
};

type FlowStep =
  | "IDLE"
  | "ASK_HOUSE_IMAGE"
  | "ASK_SQUARE_FEET"
  | "ASK_BATTERY"
  | "SUMMARY";

type SolarEstimatorState = {
  houseImage?: { name: string; url: string };
  squareFeet?: number;
  estimatedRoofUtilization: number;
  panelCount?: number;
  batterySelected: boolean;
  totalCost?: number;
  estimatedMonthlySavings?: number;
  estimatedSavingsPercentage?: number;
};

const SOLAR_CONSTANTS = {
  roofUtilization: 0.7,
  panelAreaSqM: 1.8,
  sqftToSqm: 0.092903,
  baseSystemCost: 13101,
  batteryCost: 3800,
  monthlySavingsRange: [94, 115],
  savingsPercentRange: [120, 146],
};

const estimatePanelCount = (squareFeet: number) => {
  const roofSqm = squareFeet * SOLAR_CONSTANTS.sqftToSqm;
  const usableSqm = roofSqm * SOLAR_CONSTANTS.roofUtilization;
  return Math.min(16, Math.max(4, Math.round(usableSqm / SOLAR_CONSTANTS.panelAreaSqM)));
};

const estimateTotals = (batterySelected: boolean) => {
  const totalCost =
    SOLAR_CONSTANTS.baseSystemCost +
    (batterySelected ? SOLAR_CONSTANTS.batteryCost : 0);
  const estimatedMonthlySavings = batterySelected
    ? SOLAR_CONSTANTS.monthlySavingsRange[1]
    : SOLAR_CONSTANTS.monthlySavingsRange[0];
  const estimatedSavingsPercentage = batterySelected
    ? SOLAR_CONSTANTS.savingsPercentRange[1]
    : SOLAR_CONSTANTS.savingsPercentRange[0];

  return { totalCost, estimatedMonthlySavings, estimatedSavingsPercentage };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

const getReplyDelay = () => 600 + Math.floor(Math.random() * 500);

type GenAiAssistantProps = {
  onSignUpForTariff?: (
    tariff: Tariff,
    solarSummary?: SolarSavingsSummary
  ) => void;
  hasBillContextFromChat?: boolean;
};

const GenAiAssistant = ({
  onSignUpForTariff,
  hasBillContextFromChat = false,
}: GenAiAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [flowStep, setFlowStep] = useState<FlowStep>("IDLE");
  const [solarState, setSolarState] = useState<SolarEstimatorState>({
    estimatedRoofUtilization: SOLAR_CONSTANTS.roofUtilization,
    batterySelected: false,
  });

  const canSend = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  const appendMessages = (...nextMessages: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...nextMessages]);
  };

  const addAssistantMessageWithTyping = (message: ChatMessage) =>
    new Promise<void>((resolve) => {
      const typingId = `assistant-typing-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
      setMessages((prev) => [
        ...prev,
        { id: typingId, role: "assistant", content: "", typing: true },
      ]);
      const delay = getReplyDelay();
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === typingId
              ? { ...message, id: message.id ?? typingId, typing: false }
              : item
          )
        );
        resolve();
      }, delay);
    });

  const runAssistantSequence = async (sequence: ChatMessage[]) => {
    for (const message of sequence) {
      await addAssistantMessageWithTyping(message);
    }
  };

  const buildUserMessage = (
    content: string,
    fileList?: { name: string; url?: string; type?: string }[]
  ): ChatMessage => ({
    id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: "user",
    content: content.trim() || "Shared attachments",
    attachments: fileList && fileList.length ? fileList : undefined,
  });

  const buildAssistantMessage = (
    content: string,
    options?: string[],
    attachments?: { name: string; url?: string; type?: string }[],
    summary?: ChatMessage["summary"]
  ): ChatMessage => ({
    id: `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: "assistant",
    content,
    options,
    attachments: attachments && attachments.length ? attachments : undefined,
    summary,
  });

  const startSolarSavingsFlow = async () => {
    appendMessages(
      buildUserMessage("Estimate my solar savings based on my monthly usage.")
    );
    if (hasBillContextFromChat) {
      await runAssistantSequence([
        buildAssistantMessage(
          "Based on the bill you shared earlier, we have an estimated annual usage of about 6,240 kWh. I'll use that for your savings estimate.\n\nUpload a photo of your home so I can estimate usable roof space for solar panels."
        ),
      ]);
    } else {
      await runAssistantSequence([
        buildAssistantMessage(
          "Upload a photo of your home so I can estimate usable roof space for solar panels."
        ),
      ]);
    }
    setFlowStep("ASK_HOUSE_IMAGE");
  };

  const handleBatteryChoice = async (choice: "ADD" | "SKIP") => {
    const batterySelected = choice === "ADD";
    const { totalCost, estimatedMonthlySavings, estimatedSavingsPercentage } =
      estimateTotals(batterySelected);
    const updatedState = {
      ...solarState,
      batterySelected,
      totalCost,
      estimatedMonthlySavings,
      estimatedSavingsPercentage,
    };

    setSolarState(updatedState);
    setFlowStep("SUMMARY");

    appendMessages(
      buildUserMessage(choice === "ADD" ? "Add battery" : "Skip battery")
    );
    await runAssistantSequence([
      buildAssistantMessage(
        "Summary ready.",
        undefined,
        undefined,
        {
          panelCount: updatedState.panelCount ?? 0,
          totalCost,
          estimatedMonthlySavings: estimatedMonthlySavings ?? 0,
          estimatedSavingsPercentage: estimatedSavingsPercentage ?? 0,
          batterySelected,
        }
      ),
    ]);
  };

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const trimmed = inputValue.trim();
    if (flowStep === "ASK_SQUARE_FEET") {
      const numericValue = Number(trimmed.replace(/,/g, ""));
      if (Number.isNaN(numericValue) || numericValue <= 0) {
        await runAssistantSequence([
          buildAssistantMessage(
            "That doesn’t look like a valid number. Please enter a square-foot value like 1200 or 1850."
          ),
        ]);
        return;
      }

      const panelCount = estimatePanelCount(numericValue);
      const { totalCost, estimatedMonthlySavings, estimatedSavingsPercentage } =
        estimateTotals(false);

      setSolarState((prev) => ({
        ...prev,
        squareFeet: numericValue,
        panelCount,
        totalCost,
        estimatedMonthlySavings,
        estimatedSavingsPercentage,
      }));

      appendMessages(buildUserMessage(trimmed));
      await runAssistantSequence([
        buildAssistantMessage(
          `Based on ${numericValue.toLocaleString()} sq ft, you’re estimated for ~${panelCount} panels. Total system cost ${formatCurrency(
            totalCost
          )}. Monthly savings ${formatCurrency(
            estimatedMonthlySavings ?? 0
          )} (~${estimatedSavingsPercentage}% of your bill).`
        ),
        buildAssistantMessage(
          "Here’s a sample panel layout preview.",
          undefined,
          [{ name: "panel-house", url: "/panel-house.png", type: "image/png" }]
        ),
        buildAssistantMessage(
          "A battery can store excess solar for evening use and improve savings stability. Want to add a battery?",
          ["Add battery", "Skip"]
        ),
      ]);
      setFlowStep("ASK_BATTERY");
    } else if (flowStep === "ASK_BATTERY") {
      const normalized = trimmed.toLowerCase();
      if (normalized.includes("add")) {
        handleBatteryChoice("ADD");
      } else if (normalized.includes("skip") || normalized.includes("no")) {
        handleBatteryChoice("SKIP");
      } else {
        appendMessages(buildUserMessage(trimmed));
        await runAssistantSequence([
          buildAssistantMessage("Please choose “Add battery” or “Skip”."),
        ]);
      }
    } else {
      appendMessages(buildUserMessage(trimmed));
      await runAssistantSequence([
        buildAssistantMessage(
          "Got it. I can help with solar tariffs, roof eligibility, or savings estimates."
        ),
      ]);
    }
    setInputValue("");
  };

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      type: file.type,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    if (files.length > 0) {
      if (flowStep === "ASK_HOUSE_IMAGE") {
        const [first] = files;
        if (first?.url) {
          const imageUrl = first.url;
          setSolarState((prev) => ({
            ...prev,
            houseImage: { name: first.name, url: imageUrl },
          }));
        }
        appendMessages(buildUserMessage("Uploaded a house photo.", files));
        await runAssistantSequence([
          buildAssistantMessage(
            "Thanks. What’s your home’s approximate square footage? (e.g., 1400)"
          ),
        ]);
        setFlowStep("ASK_SQUARE_FEET");
      } else {
        appendMessages(buildUserMessage(inputValue.trim() || "Uploaded photos", files));
        await runAssistantSequence([
          buildAssistantMessage(
            "Thanks! I can review these. If you want a savings estimate, share your square footage."
          ),
        ]);
      }
      setInputValue("");
    }
    event.target.value = "";
  };

  const handleOptionSelect = async (option: string) => {
    if (flowStep === "ASK_BATTERY") {
      if (option === "Add battery") {
        handleBatteryChoice("ADD");
        return;
      }
      if (option === "Skip") {
        handleBatteryChoice("SKIP");
        return;
      }
    }

    if (option === "Flat roof" || option === "Sloped roof" || option === "Not sure") {
      appendMessages(buildUserMessage(option));
      await runAssistantSequence([
        buildAssistantMessage(
          "Thanks. Please upload a photo of your house so I can check roof eligibility."
        ),
      ]);
      setFlowStep("ASK_HOUSE_IMAGE");
      return;
    }

    appendMessages(buildUserMessage(option));
    await runAssistantSequence([
      buildAssistantMessage(
        "Thanks. If you have a photo of your roof, upload it and I’ll take a look."
      ),
    ]);
  };
  return (
    <section className={styles.panel} aria-labelledby="genai-title">
      <div className={styles.messageRow}>
        <div className={styles.messageContent}>
          <div className={styles.tariffGrid}>
            {TARIFFS.map((tariff) => (
              <article key={tariff.id} className={styles.tariffCard}>
                <p className={styles.cardEyebrow}>{tariff.eyebrow}</p>
                <h3 className={styles.cardTitle}>{tariff.name}</h3>
                <p className={styles.cardPrice}>{tariff.price}</p>
                <p className={styles.cardMeta}>{tariff.description}</p>
                <div className={styles.cardButtonRow}>
                  <button className={styles.cardButton} type="button">
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className={styles.chatStream} aria-live="polite">
          {messages.map((message) => (
            <div
              key={message.id}
              className={styles.chatMessage}
              data-role={message.role}
            >
              <div className={styles.chatBubble}>
                {message.typing ? (
                  <div className={styles.typingDots} aria-label="Typing">
                    <span />
                    <span />
                    <span />
                  </div>
                ) : (
                  <p className={styles.chatText}>{message.content}</p>
                )}
                {!message.typing && message.attachments && (
                  <div className={styles.attachmentList}>
                    {message.attachments.map((file) => (
                      <span
                        key={file.name}
                        className={
                          file.url
                            ? `${styles.attachmentChip} ${styles.attachmentChipPreview}`
                            : styles.attachmentChip
                        }
                      >
                        {file.url ? (
                          <figure className={styles.attachmentPreview}>
                            <img
                              src={file.url}
                              alt={file.name}
                              className={styles.attachmentImage}
                            />
                            <figcaption className={styles.attachmentCaption}>
                              {file.name}
                            </figcaption>
                          </figure>
                        ) : (
                          file.name
                        )}
                      </span>
                    ))}
                  </div>
                )}
                {!message.typing && message.summary && (
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryHeader}>
                      Solar Savings Summary
                    </div>
                    <div className={styles.summaryBody}>
                      <div className={styles.summaryRow}>
                        <span>Panels estimated</span>
                        <strong>{message.summary.panelCount}</strong>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Total cost</span>
                        <strong>{formatCurrency(message.summary.totalCost)}</strong>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Monthly savings</span>
                        <strong>
                          {formatCurrency(message.summary.estimatedMonthlySavings)}
                        </strong>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Bill savings</span>
                        <strong>~{message.summary.estimatedSavingsPercentage}%</strong>
                      </div>
                    </div>
                    <div className={styles.summaryFooter}>
                      {message.summary.batterySelected
                        ? "Battery included for steadier savings."
                        : "No battery added."}
                    </div>
                    <div className={styles.summaryButtonRow}>
                      <button
                        className={styles.summaryButtonPrimary}
                        type="button"
                        onClick={() =>
                          onSignUpForTariff?.(TARIFFS[0], message.summary)
                        }
                        data-summary-cta
                      >
                        Sign up for solar
                      </button>
                    </div>
                  </div>
                )}
                {!message.typing && message.options && message.options.length > 0 && (
                  <div className={styles.optionRow}>
                    {message.options.map((option) => (
                      <button
                        key={option}
                        className={styles.optionButton}
                        type="button"
                        onClick={() => handleOptionSelect(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {messages.length === 0 && (
        <div className={styles.quickActions}>
          <button className={styles.quickChip} type="button">
            Compare solar tariffs
          </button>
          <button
            className={`${styles.quickChip} ${styles.quickChipSavings}`}
            type="button"
            onClick={() => {
              void startSolarSavingsFlow();
            }}
          >
            Estimate solar savings
          </button>
          <button
            className={`${styles.quickChip} ${styles.quickChipRoof}`}
            type="button"
            onClick={() => {
              setFlowStep("ASK_HOUSE_IMAGE");
              appendMessages(
                buildUserMessage("Check my roof eligibility for solar."),
                buildAssistantMessage(
                  "To check roof eligibility, upload a photo of your house or choose a roof type.",
                  ["Flat roof", "Sloped roof", "Not sure"]
                )
              );
            }}
          >
            Check roof eligibility
          </button>
          <button className={styles.quickChip} type="button">
            Chat history
          </button>
        </div>
      )}

      <div className={styles.inputDock}>
        <div className={styles.inputShell}>
          <label className={styles.plusButton} aria-label="Upload file">
            +
            <input
              className={styles.fileInput}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFiles}
            />
          </label>
          <input
            id="genai-input"
            className={styles.textInput}
            placeholder="Ask anything..."
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend();
              }
            }}
          />
          <button className={styles.iconButton} type="button" aria-label="Voice">
            🎙️
          </button>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Waveform"
          >
            📶
          </button>
        </div>
        <div className={styles.inputActions}>
          <button
            className={styles.callButton}
            type="button"
            aria-label="Connect to voice agent"
            title="Connect to voice agent"
          >
            📞
          </button>
          <button
            className={styles.callButton}
            type="button"
            aria-label="Connect to human agent"
            title="Connect to human agent"
          >
            🧑‍💼
          </button>
          <button
            className={styles.callButton}
            type="button"
            aria-label="Send"
            onClick={handleSend}
            disabled={!canSend}
          >
            ➤
          </button>
        </div>
      </div>

      <h2 className={styles.srOnly} id="genai-title">
        Kenton Energy AI chat experience
      </h2>
    </section>
  );
};

export default GenAiAssistant;
