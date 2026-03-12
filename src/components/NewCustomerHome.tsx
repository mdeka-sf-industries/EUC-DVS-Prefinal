import { useState } from "react";
import styles from "./NewCustomerHome.module.css";

type BillingTab = "Monthly" | "Quarterly" | "Annually";

const PLANS = [
  {
    id: "electricity-saver",
    title: "Kenton Electricity Saver",
    description: "Low variable rates",
    detail: "Electricity 16% less than the Reference Price",
    priceAnnual: "$1,080",
    priceMonthly: "$95",
    featured: false,
  },
  {
    id: "netflix-bundle",
    title: "Kenton Netflix Bundle",
    description: "Great value electricity plan including Netflix",
    detail: "Electricity 14% less than the Reference Price",
    priceAnnual: "$1,248",
    priceMonthly: "$109",
    featured: true,
    featureTag: "Includes $120/yr RRP of Netflix value",
  },
  {
    id: "solar-boost",
    title: "Kenton Solar Boost",
    description: "Up to 8c/kWh solar FIT",
    detail: "Electricity 8% less than the Reference Price",
    priceAnnual: "$1,068",
    priceMonthly: "$89",
    featured: false,
  },
  {
    id: "ev-drive",
    title: "Kenton EV Drive",
    description: "EV charging rates & off-peak savings",
    detail: "Electricity 12% less than the Reference Price",
    priceAnnual: "$1,188",
    priceMonthly: "$99",
    featured: false,
  },
];

type NewCustomerHomeProps = {
  onExploreSolar?: (options?: { fromChatWithBill?: boolean }) => void;
};

type ChatAttachment = { name: string; url?: string };

type Plan = (typeof PLANS)[number];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachments?: ChatAttachment[];
  options?: string[];
  tariffCard?: Plan;
};

const SCRIPT = {
  welcome:
    "Hi, welcome to Kenton Energy. I can help you find a better tariff. How can I help today?",
  askForBill:
    "I can help you cut your electricity costs. To recommend the right plan I need to see your usage and rates — the easiest way is to upload a recent bill using the 📎 button below.",
  analyzing:
    "Thanks. Analysing your bill now.",
  diagnosis:
    "Here’s what I see from your bill:\n\n• Monthly bill: $412.75 | Usage: 520 kWh (~18.6 kWh/day)\n• Your usage is typical; the high bill is mainly from the rate you’re on (~$0.32/kWh, above market).\n\nTo suggest the best fit: do you live in a house or an apartment?",
  askHouseOrApt:
    "Do you live in a house or an apartment? That helps me tailor the best option.",
  commercialReply:
    "We have plans for commercial properties and a business team for custom quotes. Want to see commercial options?",
  regionalInsight:
    "Your address (Melbourne VIC) is in a high solar zone — good chance to cut bills long-term with solar, not just a cheaper tariff.",
  presentSolar:
    "I’d recommend our Solar Starter Plan. In your area customers often see bills drop 50–70% in year one (solar first, then grid; excess as credits). With your current bill, solar could give the biggest long-term saving. See the tariff and a personalised savings estimate in the card below.",
  solarCta: "Switch To Solar",
};

type ChatFlowStep =
  | "welcome"
  | "asked_upload"
  | "analyzing"
  | "asked_house"
  | "regional_done"
  | "options_done"
  | "persuasive_done"
  | "commercial_done";

const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: SCRIPT.welcome,
};

const addAssistantMessage = (
  text: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  options?: string[],
  tariffCard?: Plan
) => {
  setMessages((prev) => [
    ...prev,
    {
      id: `assistant-${Date.now()}`,
      role: "assistant" as const,
      text,
      options,
      tariffCard,
    },
  ]);
};

const NewCustomerHome = ({ onExploreSolar }: NewCustomerHomeProps) => {
  const [address, setAddress] = useState("");
  const [lookingForElectricity, setLookingForElectricity] = useState(true);
  const [lookingForGas, setLookingForGas] = useState(false);
  const [hasEV, setHasEV] = useState(false);
  const [hasSolar, setHasSolar] = useState(false);
  const [billingTab, setBillingTab] = useState<BillingTab>("Annually");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    INITIAL_CHAT_MESSAGE,
  ]);
  const [chatFlowStep, setChatFlowStep] = useState<ChatFlowStep>("welcome");
  const [chatInput, setChatInput] = useState("");
  const [chatPendingFiles, setChatPendingFiles] = useState<ChatAttachment[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const processReply = (userText: string, hasAttachments: boolean) => {
    const lower = userText.toLowerCase();

    if (chatFlowStep === "welcome") {
      setChatFlowStep("asked_upload");
      setChatLoading(true);
      setTimeout(() => {
        addAssistantMessage(SCRIPT.askForBill, setChatMessages);
        setChatLoading(false);
      }, 600);
      return;
    }

    if (chatFlowStep === "asked_upload" && hasAttachments) {
      setChatFlowStep("analyzing");
      setChatLoading(true);
      setTimeout(() => {
        addAssistantMessage(SCRIPT.analyzing, setChatMessages);
      }, 400);
      setTimeout(() => {
        setChatFlowStep("asked_house");
        addAssistantMessage(SCRIPT.diagnosis, setChatMessages, [
          "Independent house",
          "Apartment",
          "Commercial",
        ]);
        setChatLoading(false);
      }, 2200);
      return;
    }

    if (chatFlowStep === "asked_upload" && !hasAttachments) {
      setChatLoading(true);
      setTimeout(() => {
        addAssistantMessage(
          "Upload a recent bill using the 📎 button below so I can give you a tailored recommendation.",
          setChatMessages
        );
        setChatLoading(false);
      }, 500);
      return;
    }

    if (chatFlowStep === "asked_house") {
      const isHouse =
        lower.includes("independent") ||
        lower.includes("house") ||
        lower.includes("home");
      const isApartment = lower.includes("apartment") || lower.includes("apt");
      const isCommercial = lower.includes("commercial");

      if (isHouse || isApartment) {
        setChatFlowStep("regional_done");
        setChatLoading(true);
        setTimeout(() => addAssistantMessage(SCRIPT.regionalInsight, setChatMessages), 500);
        setTimeout(() => {
          setChatFlowStep("persuasive_done");
          const solarPlan = PLANS.find((p) => p.id === "solar-boost");
          addAssistantMessage(SCRIPT.presentSolar, setChatMessages, undefined, solarPlan);
          setChatLoading(false);
        }, 800);
      } else if (isCommercial) {
        setChatFlowStep("commercial_done");
        setChatLoading(true);
        setTimeout(() => {
          addAssistantMessage(SCRIPT.commercialReply, setChatMessages);
          setChatLoading(false);
        }, 500);
      } else {
        setChatLoading(true);
        setTimeout(() => {
          addAssistantMessage(SCRIPT.askHouseOrApt, setChatMessages);
          setChatLoading(false);
        }, 500);
      }
      return;
    }

    if (chatFlowStep === "persuasive_done") {
      if (lower.includes("switch to solar") || lower.includes("view solar") || lower.includes("solar tariff")) {
        addAssistantMessage(
          "Taking you to the solar concierge.",
          setChatMessages
        );
        onExploreSolar?.({ fromChatWithBill: true });
        return;
      }
    }

    if (
      chatFlowStep === "regional_done" ||
      chatFlowStep === "options_done" ||
      chatFlowStep === "persuasive_done" ||
      chatFlowStep === "commercial_done"
    ) {
      setChatLoading(true);
      setTimeout(() => {
        addAssistantMessage(
          "Want to explore the Solar Starter Plan? I can take you to our solar concierge for personalised estimates.",
          setChatMessages
        );
        setChatLoading(false);
      }, 400);
    }
  };

  const sendChatMessage = () => {
    const trimmed = chatInput.trim();
    const hasAttachments = chatPendingFiles.length > 0;
    if (!trimmed && !hasAttachments) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed || "Attachment(s)",
      attachments: hasAttachments ? [...chatPendingFiles] : undefined,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatPendingFiles([]);
    processReply(trimmed, hasAttachments);
  };

  const handleChatOptionClick = (option: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: option,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    processReply(option, false);
  };

  const handleChatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newAttachments: ChatAttachment[] = Array.from(files).map((f) => {
      const isImage = f.type.startsWith("image/");
      return {
        name: f.name,
        url: isImage ? URL.createObjectURL(f) : undefined,
      };
    });
    setChatPendingFiles((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removePendingAttachment = (index: number) => {
    setChatPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.page}>
      {/* Hero - background image fits height, right-aligned; card sits on top */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Compare electricity and gas plans
          </h1>
          <p className={styles.heroSubtitle}>
            Find the perfect energy plan for your home. Enter your address to
            see personalized estimates.
          </p>
        </div>
        {/* Address card - on top of hero background */}
        <section className={styles.addressCard}>
        <h2 className={styles.addressCardTitle}>
          Enter your street address to see estimates
        </h2>
        <div className={styles.searchRow}>
          <span className={styles.searchIcon} aria-hidden aria-label="Search">⌕</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Start typing your address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            aria-label="Street address"
          />
        </div>
        <div className={styles.checkboxGroups}>
          <fieldset className={styles.checkboxGroup}>
            <legend className={styles.checkboxLegend}>I'm looking for</legend>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={lookingForElectricity}
                onChange={(e) => setLookingForElectricity(e.target.checked)}
              />
              <span>Electricity</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={lookingForGas}
                onChange={(e) => setLookingForGas(e.target.checked)}
              />
              <span>Gas</span>
            </label>
          </fieldset>
          <fieldset className={styles.checkboxGroup}>
            <legend className={styles.checkboxLegend}>I have</legend>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={hasEV}
                onChange={(e) => setHasEV(e.target.checked)}
              />
              <span>EV</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={hasSolar}
                onChange={(e) => setHasSolar(e.target.checked)}
              />
              <span>Solar</span>
            </label>
          </fieldset>
        </div>
        </section>
      </section>

      {/* View Estimates */}
      <section className={styles.estimatesSection}>
        <h2 className={styles.estimatesTitle}>View Estimates</h2>
        <div className={styles.tabs} role="tablist" aria-label="Billing frequency">
          {(["Monthly", "Quarterly", "Annually"] as BillingTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={billingTab === tab}
              className={
                billingTab === tab
                  ? `${styles.tab} ${styles.tabActive}`
                  : styles.tab
              }
              onClick={() => setBillingTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className={styles.planGrid}>
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={
                plan.featured
                  ? `${styles.planCard} ${styles.planCardFeatured}`
                  : styles.planCard
              }
            >
              {plan.featureTag && (
                <p className={styles.planTag}>{plan.featureTag}</p>
              )}
              <h3 className={styles.planTitle}>{plan.title}</h3>
              <div className={styles.planPrices}>
                <p className={styles.planPriceRow}>
                  <span className={styles.planPriceLabel}>Annually</span>
                  <span className={styles.planPriceValueAnnual}>{plan.priceAnnual}</span>
                </p>
                <p className={`${styles.planPriceRow} ${styles.planPriceRowSecondary}`}>
                  <span className={styles.planPriceLabel}>Monthly</span>
                  <span className={styles.planPriceValueMonthly}>{plan.priceMonthly}/mo</span>
                </p>
              </div>
              <p className={styles.planDescription}>{plan.description}</p>
              <p className={styles.planDetail}>{plan.detail}</p>
              <button
                type="button"
                className={styles.planSelectButton}
                onClick={
                  plan.id === "solar-boost"
                    ? () => onExploreSolar?.()
                    : undefined
                }
              >
                Select plan
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Help widget + chat window */}
      <div
        className={
          chatOpen ? `${styles.helpWidget} ${styles.helpWidgetChatOpen}` : styles.helpWidget
        }
      >
        {!chatOpen ? (
          <>
            <p className={styles.helpText}>Need help?</p>
            <button
              type="button"
              className={styles.helpButton}
              onClick={() => setChatOpen(true)}
              aria-expanded="false"
              aria-haspopup="dialog"
            >
              <span aria-hidden>💬</span> Start a chat
            </button>
          </>
        ) : (
          <div className={styles.chatWindow} role="dialog" aria-label="Kenton Agent chat">
            <div className={styles.chatHeader}>
              <h3 className={styles.chatTitle}>Kenton Agent</h3>
              <button
                type="button"
                className={styles.chatClose}
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
            <div className={styles.chatMessages}>
              {chatMessages.map((msg) => (
                <div key={msg.id} className={styles.chatMessageBlock}>
                  <div
                    className={
                      msg.role === "user"
                        ? styles.chatBubbleUser
                        : styles.chatBubbleAssistant
                    }
                  >
                    <p className={styles.chatBubbleText}>{msg.text}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className={styles.chatAttachments}>
                        {msg.attachments.map((att, i) =>
                          att.url ? (
                            <div key={i} className={styles.chatAttachmentPreview}>
                              <img
                                src={att.url}
                                alt={att.name}
                                className={styles.chatAttachmentImage}
                              />
                              <span className={styles.chatAttachmentName}>{att.name}</span>
                            </div>
                          ) : (
                            <span key={i} className={styles.chatAttachmentChip}>
                              📎 {att.name}
                            </span>
                          )
                        )}
                      </div>
                    )}
                    {msg.role === "assistant" && msg.tariffCard && (
                      <div className={styles.chatTariffCard}>
                        <h4 className={styles.chatTariffTitle}>{msg.tariffCard.title}</h4>
                        <div className={styles.chatTariffPrices}>
                          <span className={styles.chatTariffPriceRow}>
                            <span>Annually</span>
                            <strong>{msg.tariffCard.priceAnnual}</strong>
                          </span>
                          <span className={styles.chatTariffPriceRow}>
                            <span>Monthly</span>
                            <strong>{msg.tariffCard.priceMonthly}/mo</strong>
                          </span>
                        </div>
                        <p className={styles.chatTariffDescription}>{msg.tariffCard.description}</p>
                        <p className={styles.chatTariffDetail}>{msg.tariffCard.detail}</p>
                        <button
                          type="button"
                          className={styles.chatTariffCta}
                          onClick={() => onExploreSolar?.({ fromChatWithBill: true })}
                        >
                          {SCRIPT.solarCta}
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === "assistant" && msg.options && msg.options.length > 0 && (
                    <div className={styles.chatOptionRow}>
                      {msg.options.map((label) => (
                        <button
                          key={label}
                          type="button"
                          className={styles.chatOptionButton}
                          onClick={() => handleChatOptionClick(label)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {chatLoading && (
                <div className={styles.chatBubbleAssistant}>
                  <div className={styles.chatTyping} aria-label="Agent is typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              )}
            </div>
            {chatPendingFiles.length > 0 && (
              <div className={styles.chatPendingRow}>
                {chatPendingFiles.map((att, i) => (
                  <span key={i} className={styles.chatPendingChip}>
                    {att.url ? (
                      <span className={styles.chatPendingPreview}>
                        <img src={att.url} alt="" className={styles.chatPendingThumb} />
                        <span className={styles.chatPendingName}>{att.name}</span>
                      </span>
                    ) : (
                      <>📎 {att.name}</>
                    )}
                    <button
                      type="button"
                      className={styles.chatPendingRemove}
                      onClick={() => removePendingAttachment(i)}
                      aria-label={`Remove ${att.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className={styles.chatInputRow}>
              <input
                id="chat-file-input"
                type="file"
                className={styles.chatFileInput}
                accept="image/*,.pdf,.doc,.docx"
                multiple
                onChange={handleChatFileChange}
                aria-label="Add image or document"
              />
              <label
                htmlFor="chat-file-input"
                className={styles.chatAttachButton}
                aria-label="Add image or document"
              >
                📎
              </label>
              <input
                type="text"
                className={styles.chatInput}
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                aria-label="Message"
              />
              <button
                type="button"
                className={styles.chatSend}
                onClick={sendChatMessage}
                disabled={!chatInput.trim() && chatPendingFiles.length === 0}
                aria-label="Send"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewCustomerHome;
