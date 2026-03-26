import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SolarSavingsSummary, Tariff } from "../types";
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
  onSignUpForTariff?: (tariff: Tariff, solarSummary?: SolarSavingsSummary) => void;
  initialConversationState?: AgentConversationState | null;
  onConversationStateChange?: (state: AgentConversationState) => void;
};

type ChatAttachment = {
  name: string;
  url?: string;
  kind?: "file" | "voice";
  durationLabel?: string;
  transcript?: string;
};

type Plan = (typeof PLANS)[number];

type BillInsightSummary = {
  monthlyBill: string;
  usage: string;
  dailyUsage: string;
  rate: string;
  insight: string;
};

type ZoneHighlight = {
  label: string;
  detail: string;
};

type ConsumptionHighlight = {
  label: string;
  value: string;
  detail: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachments?: ChatAttachment[];
  options?: string[];
  tariffCard?: Plan;
  summary?: SolarSavingsSummary;
  billInsight?: BillInsightSummary;
  zoneHighlight?: ZoneHighlight;
  consumptionHighlight?: ConsumptionHighlight;
};

export type AgentConversationState = {
  chatOpen: boolean;
  chatMessages: ChatMessage[];
  chatFlowStep: ChatFlowStep;
  chatInput: string;
  solarPanelCount: number | null;
};

const SCRIPT = {
  welcome:
    "Hi, welcome to Kenton Energy. I can help you find a better tariff. How can I help today?",
  askForBill:
    "I can help you cut your electricity costs. To recommend the right plan I need to see your usage and rates — the easiest way is to upload a recent bill using the + button below.",
  analyzing:
    "Thanks. Analysing your bill now.",
  diagnosis:
    "Here’s what I see from your bill.",
  askHouseOrApt:
    "Do you live in a house or an apartment? That helps me tailor the best option.",
  commercialReply:
    "We have plans for commercial properties and a business team for custom quotes. Want to see commercial options?",
  regionalInsight:
    "Your address (San Francisco, CA) is in a high solar zone — good chance to cut bills long-term with solar, not just a cheaper tariff.",
  presentSolar:
    "I’d recommend our Kenton Solar Boost plan. In your area customers often see bills drop 50–70% in year one (solar first, then grid; excess as credits). With your current bill, solar could give the biggest long-term saving. See the tariff and a personalised savings estimate in the card below.",
  solarCta: "Switch To Solar",
};

const DEFAULT_CHAT_ENQUIRY =
  "I have a high bill issue from the past couple of months from another provider. Can you help me find a better tariff plan?";
const DEFAULT_SOLAR_SQUARE_FEET = "1800";
const DEFAULT_VOICE_TRANSCRIPT = DEFAULT_CHAT_ENQUIRY;
const WELCOME_NOTE_SRC = "/Welcome%20note%20Kenton%20Energy.mp3";
const AGENT_RESPONSE_1_SRC = "/Agent%20response%201.mp3";
const ASK_FOR_BILL_MESSAGE_ID = "ask-for-bill";
const BUNDLED_VOICE_SAMPLE_SRC = "/rosa-high-bill-voice-input.mp3";
const BUNDLED_VOICE_SAMPLE_NAME = "Rosa voice input";
const BUNDLED_VOICE_SAMPLE_DURATION = "0:12";
const SOLAR_PIN_PREVIEW_SRC = "/solar-roof-pin-preview.png";
const SOLAR_PIN_PREVIEW_NAME = "roof-pin-preview";
const SOLAR_LAYOUT_PREVIEW_SRC = "/solar-panel-layout-preview.png";
const SOLAR_PIN_CONFIRM_OPTIONS = ["Yes, that's my house", "Try another address"];
const SOLAR_PIN_PREVIEW_ADDRESS = "1234 25th Street, San Francisco, CA 94110";
const SOLAR_PIN_PREVIEW_LAT_LNG = {
  lat: "37.7489",
  lng: "-122.4148",
};
const SOLAR_FLOW_STEPS: ChatFlowStep[] = [
  "solar_intro",
  "solar_confirm_pin",
  "solar_enter_address",
  "solar_ask_square_feet",
  "solar_ask_battery",
  "solar_summary",
];

type ChatFlowStep =
  | "welcome"
  | "asked_upload"
  | "analyzing"
  | "asked_house"
  | "regional_done"
  | "options_done"
  | "persuasive_done"
  | "commercial_done"
  | "solar_intro"
  | "solar_confirm_pin"
  | "solar_enter_address"
  | "solar_ask_square_feet"
  | "solar_ask_battery"
  | "solar_summary";

const INITIAL_CHAT_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: SCRIPT.welcome,
};

const SOLAR_SIGNUP_TARIFF: Tariff = {
  id: "solar-boost",
  name: "Kenton Solar Boost",
  price: "$89 / month",
  eyebrow: "Recommended solar plan",
  description: "Up to 8c/kWh solar FIT",
};

const SOLAR_ESTIMATE = {
  roofUtilization: 0.7,
  panelAreaSqM: 1.8,
  sqftToSqm: 0.092903,
  baseSystemCost: 8900,
  batteryCost: 2600,
  monthlySavingsRange: [62, 78] as const,
  savingsPercentRange: [42, 58] as const,
  twentyYearCostWithoutSolar: 38305.29,
  operatingCostWithSolarBase: 15869.35,
  breakEvenYears: 7,
  breakEvenYearsWithBattery: 9,
};

const BILL_DIAGNOSIS_SUMMARY: BillInsightSummary = {
  monthlyBill: "$412.75",
  usage: "520 kWh",
  dailyUsage: "~18.6 kWh/day",
  rate: "$0.32/kWh",
  insight: "Your usage is typical. The higher bill is mainly being driven by an above-market rate.",
};

const SAN_FRANCISCO_SOLAR_ZONE: ZoneHighlight = {
  label: "High solar zone",
  detail: "San Francisco has strong long-term solar potential, making solar savings more compelling than a tariff-only switch.",
};

const ANNUAL_CONSUMPTION_HIGHLIGHT: ConsumptionHighlight = {
  label: "Annual consumption",
  value: "6,240 kWh/year",
  detail: "We’ll use this annual usage from your bill to estimate solar production, bill offset, and savings.",
};

const estimatePanelCount = (squareFeet: number) => {
  const roofSqm = squareFeet * SOLAR_ESTIMATE.sqftToSqm;
  const usableSqm = roofSqm * SOLAR_ESTIMATE.roofUtilization;
  return Math.min(16, Math.max(4, Math.round(usableSqm / SOLAR_ESTIMATE.panelAreaSqM)));
};

const estimateSolarSummary = (
  batterySelected: boolean,
  panelCount: number
): SolarSavingsSummary => {
  const totalCost =
    SOLAR_ESTIMATE.baseSystemCost + (batterySelected ? SOLAR_ESTIMATE.batteryCost : 0);
  const costWithoutSolar = SOLAR_ESTIMATE.twentyYearCostWithoutSolar;
  const costWithSolar = SOLAR_ESTIMATE.operatingCostWithSolarBase + totalCost;
  const breakEvenYears = batterySelected
    ? SOLAR_ESTIMATE.breakEvenYearsWithBattery
    : SOLAR_ESTIMATE.breakEvenYears;

  return {
    panelCount,
    totalCost,
    estimatedMonthlySavings: batterySelected
      ? SOLAR_ESTIMATE.monthlySavingsRange[1]
      : SOLAR_ESTIMATE.monthlySavingsRange[0],
    estimatedSavingsPercentage: batterySelected
      ? SOLAR_ESTIMATE.savingsPercentRange[1]
      : SOLAR_ESTIMATE.savingsPercentRange[0],
    costWithoutSolar,
    costWithSolar,
    lifetimeSavings: costWithoutSolar - costWithSolar,
    breakEvenYear: new Date().getFullYear() + breakEvenYears,
    breakEvenYears,
    batterySelected,
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const formatCurrencyDetailed = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatVoiceDuration = (seconds: number) => {
  const safeSeconds = Math.max(1, seconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const addAssistantMessage = (
  text: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  options?: string[],
  tariffCard?: Plan,
  summary?: SolarSavingsSummary
) => {
  setMessages((prev) => [
    ...prev,
    {
      id: `assistant-${Date.now()}`,
      role: "assistant" as const,
      text,
      options,
      tariffCard,
      summary,
    },
  ]);
};

const addAssistantRichMessage = (
  text: string,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  extras: Partial<
    Pick<
      ChatMessage,
      | "attachments"
      | "options"
      | "tariffCard"
      | "summary"
      | "billInsight"
      | "zoneHighlight"
      | "consumptionHighlight"
    >
  >
) => {
  setMessages((prev) => [
    ...prev,
    {
      id: `assistant-${Date.now()}`,
      role: "assistant" as const,
      text,
      ...extras,
    },
  ]);
};

const NewCustomerHome = ({
  onSignUpForTariff,
  initialConversationState,
  onConversationStateChange,
}: NewCustomerHomeProps) => {
  const [address, setAddress] = useState("");
  const [lookingForElectricity, setLookingForElectricity] = useState(true);
  const [lookingForGas, setLookingForGas] = useState(false);
  const [hasEV, setHasEV] = useState(false);
  const [hasSolar, setHasSolar] = useState(false);
  const [billingTab, setBillingTab] = useState<BillingTab>("Annually");
  const [chatOpen, setChatOpen] = useState(initialConversationState?.chatOpen ?? false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialConversationState?.chatMessages ?? [INITIAL_CHAT_MESSAGE]
  );
  const [chatFlowStep, setChatFlowStep] = useState<ChatFlowStep>(
    initialConversationState?.chatFlowStep ?? "welcome"
  );
  const [chatInput, setChatInput] = useState(initialConversationState?.chatInput ?? "");
  const [chatPendingFiles, setChatPendingFiles] = useState<ChatAttachment[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatVoiceRecording, setChatVoiceRecording] = useState(false);
  const [chatVoicePlaying, setChatVoicePlaying] = useState(false);
  const [chatVoiceElapsed, setChatVoiceElapsed] = useState(0);
  const [chatWelcomePlaying, setChatWelcomePlaying] = useState(false);
  const [chatWelcomeRevealText, setChatWelcomeRevealText] = useState(SCRIPT.welcome);
  const [chatAskForBillPlaying, setChatAskForBillPlaying] = useState(false);
  const [chatAskForBillRevealText, setChatAskForBillRevealText] = useState(
    SCRIPT.askForBill
  );
  const [chatExpandedImage, setChatExpandedImage] = useState<{
    src: string;
    name: string;
  } | null>(null);
  const [solarPanelCount, setSolarPanelCount] = useState<number | null>(
    initialConversationState?.solarPanelCount ?? null
  );
  const [floatingRoot, setFloatingRoot] = useState<HTMLElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const chatWelcomeAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatWelcomeRevealTimerRef = useRef<number | null>(null);
  const chatAskForBillAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatAskForBillRevealTimerRef = useRef<number | null>(null);
  const chatVoiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const latestPlayableVoiceAttachment =
    [...chatPendingFiles].reverse().find((att) => att.kind === "voice" && att.url) ?? null;

  const openChat = async () => {
    setChatOpen(true);
    const shouldAnimateWelcome =
      chatFlowStep === "welcome" &&
      chatMessages.length === 1 &&
      chatMessages[0]?.id === INITIAL_CHAT_MESSAGE.id;

    const welcomeAudio =
      chatWelcomeAudioRef.current ?? new Audio(WELCOME_NOTE_SRC);

    if (chatWelcomeAudioRef.current == null) {
      chatWelcomeAudioRef.current = welcomeAudio;
    }

    welcomeAudio.currentTime = 0;
    if (chatWelcomeRevealTimerRef.current != null) {
      window.clearInterval(chatWelcomeRevealTimerRef.current);
      chatWelcomeRevealTimerRef.current = null;
    }

    if (shouldAnimateWelcome) {
      setChatWelcomePlaying(true);
      setChatWelcomeRevealText("");
      const revealDurationMs = 4200;
      const revealStepMs = Math.max(
        24,
        Math.floor(revealDurationMs / Math.max(1, SCRIPT.welcome.length))
      );
      let revealIndex = 0;
      chatWelcomeRevealTimerRef.current = window.setInterval(() => {
        revealIndex += 1;
        setChatWelcomeRevealText(SCRIPT.welcome.slice(0, revealIndex));
        if (revealIndex >= SCRIPT.welcome.length) {
          if (chatWelcomeRevealTimerRef.current != null) {
            window.clearInterval(chatWelcomeRevealTimerRef.current);
            chatWelcomeRevealTimerRef.current = null;
          }
        }
      }, revealStepMs);
    } else {
      setChatWelcomePlaying(false);
      setChatWelcomeRevealText(SCRIPT.welcome);
    }

    try {
      await welcomeAudio.play();
    } catch {
      if (chatWelcomeRevealTimerRef.current != null) {
        window.clearInterval(chatWelcomeRevealTimerRef.current);
        chatWelcomeRevealTimerRef.current = null;
      }
      setChatWelcomePlaying(false);
      setChatWelcomeRevealText(SCRIPT.welcome);
      // Ignore autoplay/playback failures for this mock welcome note.
    }
  };

  const playAskForBillAudio = async () => {
    const responseAudio =
      chatAskForBillAudioRef.current ?? new Audio(AGENT_RESPONSE_1_SRC);

    if (chatAskForBillAudioRef.current == null) {
      chatAskForBillAudioRef.current = responseAudio;
    }

    responseAudio.currentTime = 0;
    if (chatAskForBillRevealTimerRef.current != null) {
      window.clearInterval(chatAskForBillRevealTimerRef.current);
      chatAskForBillRevealTimerRef.current = null;
    }

    setChatAskForBillPlaying(true);
    setChatAskForBillRevealText("");
    const revealDurationMs = 5200;
    const revealStepMs = Math.max(
      24,
      Math.floor(revealDurationMs / Math.max(1, SCRIPT.askForBill.length))
    );
    let revealIndex = 0;
    chatAskForBillRevealTimerRef.current = window.setInterval(() => {
      revealIndex += 1;
      setChatAskForBillRevealText(SCRIPT.askForBill.slice(0, revealIndex));
      if (revealIndex >= SCRIPT.askForBill.length) {
        if (chatAskForBillRevealTimerRef.current != null) {
          window.clearInterval(chatAskForBillRevealTimerRef.current);
          chatAskForBillRevealTimerRef.current = null;
        }
      }
    }, revealStepMs);

    try {
      await responseAudio.play();
    } catch {
      if (chatAskForBillRevealTimerRef.current != null) {
        window.clearInterval(chatAskForBillRevealTimerRef.current);
        chatAskForBillRevealTimerRef.current = null;
      }
      setChatAskForBillPlaying(false);
      setChatAskForBillRevealText(SCRIPT.askForBill);
    }
  };

  const closeChat = () => {
    chatWelcomeAudioRef.current?.pause();
    if (chatWelcomeAudioRef.current) {
      chatWelcomeAudioRef.current.currentTime = 0;
    }
    if (chatWelcomeRevealTimerRef.current != null) {
      window.clearInterval(chatWelcomeRevealTimerRef.current);
      chatWelcomeRevealTimerRef.current = null;
    }
    setChatWelcomePlaying(false);
    setChatWelcomeRevealText(SCRIPT.welcome);
    chatAskForBillAudioRef.current?.pause();
    if (chatAskForBillAudioRef.current) {
      chatAskForBillAudioRef.current.currentTime = 0;
    }
    if (chatAskForBillRevealTimerRef.current != null) {
      window.clearInterval(chatAskForBillRevealTimerRef.current);
      chatAskForBillRevealTimerRef.current = null;
    }
    setChatAskForBillPlaying(false);
    setChatAskForBillRevealText(SCRIPT.askForBill);
    chatVoiceAudioRef.current?.pause();
    chatVoiceAudioRef.current = null;
    setChatOpen(false);
    setChatVoiceRecording(false);
    setChatVoicePlaying(false);
    setChatVoiceElapsed(0);
    setChatExpandedImage(null);
    setSolarPanelCount(null);
  };

  const openExpandedChatImage = (src: string, name: string) => {
    setChatExpandedImage({ src, name });
  };

  const closeExpandedChatImage = () => {
    setChatExpandedImage(null);
  };

  const openSolarConcierge = () => {
    const solarPlan = PLANS.find((p) => p.id === "solar-boost");
    setChatOpen(true);
    setSolarPanelCount(null);
    setChatFlowStep("solar_intro");
    setChatMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.text === "I can help with a recommended solar plan, roof eligibility, and a personalised savings estimate based on the bill context we already have.") {
        return prev;
      }

      return [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text:
            "I can help with a recommended solar plan, roof eligibility, and a personalised savings estimate based on the bill context we already have.",
          tariffCard: solarPlan,
        },
      ];
    });
  };

  const processReply = (userText: string, hasDocumentAttachments: boolean) => {
    const lower = userText.toLowerCase();
    const isSolarFlow = SOLAR_FLOW_STEPS.includes(chatFlowStep);

    if (isSolarFlow) {
      if (chatFlowStep === "solar_confirm_pin") {
        const confirmsPin =
          lower.includes("yes") ||
          lower.includes("that's my house") ||
          lower.includes("that’s my house") ||
          lower.includes("confirm");
        const wantsAnotherAddress =
          lower.includes("try another") ||
          lower.includes("not my house") ||
          lower.includes("another address") ||
          lower.includes("different address");

        if (confirmsPin) {
          setChatFlowStep("solar_ask_square_feet");
          setChatLoading(true);
          setTimeout(() => {
            addAssistantMessage(
              "Great, I’ll use this pinned roof view for the estimate. What’s your home’s approximate square footage? (e.g., 1400)",
              setChatMessages
            );
            setChatLoading(false);
          }, 350);
          return;
        }

        if (wantsAnotherAddress) {
          setChatFlowStep("solar_enter_address");
          setChatLoading(true);
          setTimeout(() => {
            addAssistantMessage(
              "Enter your street address or ZIP code and I’ll refresh the pinned roof preview.",
              setChatMessages
            );
            setChatLoading(false);
          }, 350);
          return;
        }

        setChatLoading(true);
        setTimeout(() => {
          addAssistantMessage(
            "Please confirm the pinned rooftop or choose another address so I can continue.",
            setChatMessages
          );
          setChatLoading(false);
        }, 350);
        return;
      }

      if (chatFlowStep === "solar_enter_address") {
        setChatFlowStep("solar_confirm_pin");
        setChatLoading(true);
        setTimeout(() => {
          addAssistantRichMessage(
            `I found a likely roof match for ${userText}. Please confirm the pinned location below so I can continue.`,
            setChatMessages,
            {
              attachments: [{ name: "roof-pin-preview", url: SOLAR_PIN_PREVIEW_SRC }],
              options: SOLAR_PIN_CONFIRM_OPTIONS,
            }
          );
          setChatLoading(false);
        }, 400);
        return;
      }

      if (chatFlowStep === "solar_ask_square_feet") {
        const numericValue = Number(userText.trim().replace(/,/g, ""));

        if (Number.isNaN(numericValue) || numericValue <= 0) {
          setChatLoading(true);
          setTimeout(() => {
            addAssistantMessage(
              "That doesn’t look like a valid number. Please enter a square-foot value like 1200 or 1850.",
              setChatMessages
            );
            setChatLoading(false);
          }, 350);
          return;
        }

        const panelCount = estimatePanelCount(numericValue);
        const summary = estimateSolarSummary(false, panelCount);
        setSolarPanelCount(panelCount);
        setChatFlowStep("solar_ask_battery");
        setChatLoading(true);
        setTimeout(() => {
          addAssistantMessage(
            `Based on ${numericValue.toLocaleString()} sq ft, you’re estimated for about ${summary.panelCount} panels. Total system cost ${formatCurrency(
              summary.totalCost
            )}. Monthly savings ${formatCurrency(summary.estimatedMonthlySavings)} (~${
              summary.estimatedSavingsPercentage
            }% of your bill).`,
            setChatMessages
          );
        }, 350);
        setTimeout(() => {
          addAssistantRichMessage(
            "Here’s an optimized panel layout for the best result on your roof.",
            setChatMessages,
            {
              attachments: [
                { name: "solar-layout-preview", url: SOLAR_LAYOUT_PREVIEW_SRC },
              ],
            }
          );
        }, 620);
        setTimeout(() => {
          addAssistantMessage(
            "A battery can store excess solar for evening use and improve savings stability. Want to add a battery?",
            setChatMessages,
            ["Add battery", "Skip"]
          );
          setChatLoading(false);
        }, 980);
        return;
      }

      if (chatFlowStep === "solar_ask_battery") {
        const wantsBattery = lower.includes("add");
        const skipsBattery = lower.includes("skip") || lower.includes("no");

        if (!wantsBattery && !skipsBattery) {
          setChatLoading(true);
          setTimeout(() => {
            addAssistantMessage("Please choose “Add battery” or “Skip”.", setChatMessages);
            setChatLoading(false);
          }, 350);
          return;
        }

        const summary = estimateSolarSummary(wantsBattery, solarPanelCount ?? 8);
        setChatFlowStep("solar_summary");
        setChatLoading(true);
        setTimeout(() => {
          addAssistantMessage("Summary ready.", setChatMessages, undefined, undefined, summary);
          setChatLoading(false);
        }, 400);
        return;
      }
    }

    if (chatFlowStep === "welcome") {
      setChatFlowStep("asked_upload");
      setChatLoading(true);
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: ASK_FOR_BILL_MESSAGE_ID,
            role: "assistant",
            text: SCRIPT.askForBill,
          },
        ]);
        setChatLoading(false);
        void playAskForBillAudio();
      }, 600);
      return;
    }

    if (chatFlowStep === "asked_upload" && hasDocumentAttachments) {
      setChatFlowStep("analyzing");
      setChatLoading(true);
      setTimeout(() => {
        addAssistantMessage(SCRIPT.analyzing, setChatMessages);
      }, 400);
      setTimeout(() => {
        setChatFlowStep("asked_house");
        addAssistantRichMessage(SCRIPT.diagnosis, setChatMessages, {
          billInsight: BILL_DIAGNOSIS_SUMMARY,
        });
        addAssistantMessage(SCRIPT.askHouseOrApt, setChatMessages, [
          "Independent house",
          "Apartment",
          "Commercial",
        ]);
        setChatLoading(false);
      }, 2200);
      return;
    }

    if (chatFlowStep === "asked_upload" && !hasDocumentAttachments) {
      setChatLoading(true);
      setTimeout(() => {
        addAssistantMessage(
          "Upload a recent bill using the + button below so I can give you a tailored recommendation.",
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
        setTimeout(() => {
          addAssistantRichMessage(SCRIPT.regionalInsight, setChatMessages, {
            zoneHighlight: SAN_FRANCISCO_SOLAR_ZONE,
          });
        }, 500);
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
          "I’ll show you the solar recommendation here in chat.",
          setChatMessages
        );
        openSolarConcierge();
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
          "Want to explore Kenton Solar Boost? I can show personalised solar estimates here in chat.",
          setChatMessages
        );
        setChatLoading(false);
      }, 400);
    }
  };

  const sendChatMessage = () => {
    const trimmed = chatInput.trim();
    const voiceTranscript =
      chatPendingFiles.find((att) => att.kind === "voice")?.transcript?.trim() ?? "";
    const hasAttachments = chatPendingFiles.length > 0;
    const hasDocumentAttachments = chatPendingFiles.some((att) => att.kind !== "voice");
    if (!trimmed && !voiceTranscript && !hasAttachments) return;
    const messageText = trimmed || voiceTranscript || "Attachment(s)";
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: messageText,
      attachments: hasAttachments ? [...chatPendingFiles] : undefined,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatPendingFiles([]);
    processReply(messageText, hasDocumentAttachments);
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
      const isAudio = f.type.startsWith("audio/");
      return {
        name: isAudio ? `Voice upload: ${f.name}` : f.name,
        kind: isAudio ? "voice" : "file",
        durationLabel: isAudio ? "0:12" : undefined,
        transcript: isAudio ? DEFAULT_VOICE_TRANSCRIPT : undefined,
        url: isImage || isAudio ? URL.createObjectURL(f) : undefined,
      };
    });
    setChatPendingFiles((prev) => [...prev, ...newAttachments]);
    e.target.value = "";

  };

  const removePendingAttachment = (index: number) => {
    setChatPendingFiles((prev) => {
      const removedAttachment = prev[index];
      if (removedAttachment?.kind === "voice" && removedAttachment.url) {
        chatVoiceAudioRef.current?.pause();
        chatVoiceAudioRef.current = null;
        setChatVoicePlaying(false);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const appendBundledVoiceAttachment = () => {
    setChatPendingFiles((prev) => {
      const alreadyAdded = prev.some(
        (att) => att.kind === "voice" && att.url === BUNDLED_VOICE_SAMPLE_SRC
      );
      if (alreadyAdded) return prev;
      return [
        ...prev,
        {
          name: BUNDLED_VOICE_SAMPLE_NAME,
          kind: "voice",
          durationLabel: BUNDLED_VOICE_SAMPLE_DURATION,
          transcript: DEFAULT_VOICE_TRANSCRIPT,
          url: BUNDLED_VOICE_SAMPLE_SRC,
        },
      ];
    });
  };

  const startVoiceCapture = async () => {
    if (latestPlayableVoiceAttachment?.url || BUNDLED_VOICE_SAMPLE_SRC) {
      const activeVoiceAttachment =
        latestPlayableVoiceAttachment ??
        ({
          name: BUNDLED_VOICE_SAMPLE_NAME,
          kind: "voice",
          durationLabel: BUNDLED_VOICE_SAMPLE_DURATION,
          transcript: DEFAULT_VOICE_TRANSCRIPT,
          url: BUNDLED_VOICE_SAMPLE_SRC,
        } satisfies ChatAttachment);
      const activeVoiceSrc = activeVoiceAttachment.url ?? BUNDLED_VOICE_SAMPLE_SRC;

      const currentAudio =
        chatVoiceAudioRef.current ?? new Audio(activeVoiceSrc);

      if (chatVoiceAudioRef.current == null) {
        chatVoiceAudioRef.current = currentAudio;
      }

      if (currentAudio.src !== activeVoiceSrc) {
        currentAudio.src = activeVoiceSrc;
      }

      if (currentAudio.ended) {
        currentAudio.currentTime = 0;
      }

      if (chatVoicePlaying) {
        currentAudio.pause();
        setChatVoicePlaying(false);
        return;
      }

      try {
        await currentAudio.play();
        setChatVoicePlaying(true);
      } catch {
        setChatVoicePlaying(false);
      }
      return;
    }

    setChatVoiceElapsed(0);
    setChatVoiceRecording(true);
  };

  const cancelVoiceCapture = () => {
    setChatVoiceRecording(false);
    setChatVoiceElapsed(0);
  };

  const stopVoicePlayback = () => {
    chatVoiceAudioRef.current?.pause();
    setChatVoicePlaying(false);
  };

  const saveVoiceCapture = () => {
    const durationLabel = formatVoiceDuration(chatVoiceElapsed || 4);
    setChatPendingFiles((prev) => [
      ...prev,
      {
        name: `Voice note ${durationLabel}`,
        kind: "voice",
        durationLabel,
        transcript: DEFAULT_VOICE_TRANSCRIPT,
      },
    ]);
    setChatInput((prev) => (prev.trim().length > 0 ? prev : DEFAULT_VOICE_TRANSCRIPT));
    setChatVoiceRecording(false);
    setChatVoiceElapsed(0);
  };

  useEffect(() => {
    setFloatingRoot(document.getElementById("device-floating-root"));
  }, []);

  useEffect(() => {
    if (!chatOpen) return;

    const frameId = requestAnimationFrame(() => {
      chatBottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [chatOpen, chatLoading, chatMessages]);

  useEffect(() => {
    if (!chatVoiceRecording) return;
    const intervalId = window.setInterval(() => {
      setChatVoiceElapsed((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [chatVoiceRecording]);

  useEffect(() => {
    const audio = chatVoiceAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setChatVoicePlaying(false);
      if (audio.src.endsWith(BUNDLED_VOICE_SAMPLE_SRC)) {
        appendBundledVoiceAttachment();
      }
      setChatInput((prev) => (prev.trim().length > 0 ? prev : DEFAULT_VOICE_TRANSCRIPT));
    };
    const handlePause = () => setChatVoicePlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
    };
  }, [chatVoiceAudioRef.current]);

  useEffect(() => {
    const audio = chatWelcomeAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setChatWelcomePlaying(false);
      setChatWelcomeRevealText(SCRIPT.welcome);
      if (chatWelcomeRevealTimerRef.current != null) {
        window.clearInterval(chatWelcomeRevealTimerRef.current);
        chatWelcomeRevealTimerRef.current = null;
      }
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [chatWelcomeAudioRef.current]);

  useEffect(() => {
    const audio = chatAskForBillAudioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setChatAskForBillPlaying(false);
      setChatAskForBillRevealText(SCRIPT.askForBill);
      if (chatAskForBillRevealTimerRef.current != null) {
        window.clearInterval(chatAskForBillRevealTimerRef.current);
        chatAskForBillRevealTimerRef.current = null;
      }
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [chatAskForBillAudioRef.current]);

  useEffect(() => {
    if (chatFlowStep !== "solar_ask_square_feet") return;
    if (chatInput.trim().length > 0) return;
    setChatInput(DEFAULT_SOLAR_SQUARE_FEET);
  }, [chatFlowStep, chatInput]);

  useEffect(() => {
    onConversationStateChange?.({
      chatOpen,
      chatMessages,
      chatFlowStep,
      chatInput,
      solarPanelCount,
    });
  }, [chatFlowStep, chatInput, chatMessages, chatOpen, onConversationStateChange, solarPanelCount]);

  const handleSolarQuickAction = (action: "recommended" | "savings" | "roof") => {
    if (action === "recommended") {
      const solarPlan = PLANS.find((p) => p.id === "solar-boost");
      setChatMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          text: "Show me the recommended solar plan.",
        },
      ]);
      setChatLoading(true);
      setTimeout(() => {
        addAssistantMessage(
          "Based on your recent bill and usage pattern, our recommended option is Kenton Solar Boost for steady bill reduction and export credit value.",
          setChatMessages,
          undefined,
          solarPlan
        );
        setChatLoading(false);
      }, 350);
      return;
    }

    if (action === "savings") {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: "user",
          text: "Estimate my solar savings.",
        },
      ]);
      setChatFlowStep("solar_confirm_pin");
      setChatLoading(true);
      setTimeout(() => {
        addAssistantRichMessage(
          "Based on the bill you shared earlier, we will calculate savings based on your annual consumption of 6,240 kWh per year.",
          setChatMessages,
          {
            consumptionHighlight: ANNUAL_CONSUMPTION_HIGHLIGHT,
          }
        );
        addAssistantRichMessage(
          "Please confirm your address using the pinned roof view below so I can estimate usable roof space for solar panels.",
          setChatMessages,
          {
            attachments: [{ name: "roof-pin-preview", url: SOLAR_PIN_PREVIEW_SRC }],
            options: SOLAR_PIN_CONFIRM_OPTIONS,
          }
        );
        setChatLoading(false);
      }, 350);
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: "Check my roof eligibility for solar.",
      },
    ]);
    setChatFlowStep("solar_confirm_pin");
    setChatLoading(true);
    setTimeout(() => {
      addAssistantRichMessage(
        "Please confirm your address using the pinned rooftop view below so I can check roof eligibility.",
        setChatMessages,
        {
          attachments: [{ name: "roof-pin-preview", url: SOLAR_PIN_PREVIEW_SRC }],
          options: SOLAR_PIN_CONFIRM_OPTIONS,
        }
      );
      setChatLoading(false);
    }, 350);
  };

  const helpWidget = (
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
            onClick={openChat}
            aria-expanded="false"
            aria-haspopup="dialog"
            aria-label="Open Kenton agent chat"
            title="Open Kenton agent chat"
          >
            <img
              className={styles.helpAvatar}
              src="/agent-avatar.png"
              alt=""
              aria-hidden
            />
            <span className={styles.helpStatus} aria-hidden />
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className={styles.chatScrim}
            aria-label="Close chat"
            onClick={closeChat}
          />
          <div className={styles.chatWindow} role="dialog" aria-label="Kenton Agent chat">
            <div className={styles.chatHeader}>
              <h3 className={styles.chatTitle}>Kenton Agent</h3>
              <button
                type="button"
                className={styles.chatClose}
                onClick={closeChat}
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
                        <p className={styles.chatBubbleText}>
                          {msg.id === INITIAL_CHAT_MESSAGE.id
                            ? chatWelcomeRevealText
                            : msg.id === ASK_FOR_BILL_MESSAGE_ID
                              ? chatAskForBillRevealText
                              : msg.text}
                        </p>
                        {msg.id === INITIAL_CHAT_MESSAGE.id && chatWelcomePlaying && (
                          <div className={styles.chatWelcomeProgress} aria-hidden>
                            <span />
                            <span />
                            <span />
                          </div>
                        )}
                        {msg.id === ASK_FOR_BILL_MESSAGE_ID && chatAskForBillPlaying && (
                          <div className={styles.chatWelcomeProgress} aria-hidden>
                            <span />
                            <span />
                            <span />
                          </div>
                        )}
                        {msg.role === "assistant" && msg.billInsight && (
                          <div className={styles.chatBillCard}>
                            <h4 className={styles.chatBillTitle}>Bill analysis</h4>
                            <div className={styles.chatBillGrid}>
                              <span className={styles.chatBillMetric}>
                                <span>Monthly bill</span>
                                <strong>{msg.billInsight.monthlyBill}</strong>
                              </span>
                              <span className={styles.chatBillMetric}>
                                <span>Usage</span>
                                <strong>{msg.billInsight.usage}</strong>
                              </span>
                              <span className={styles.chatBillMetric}>
                                <span>Daily usage</span>
                                <strong>{msg.billInsight.dailyUsage}</strong>
                              </span>
                              <span className={styles.chatBillMetric}>
                                <span>Rate</span>
                                <strong>{msg.billInsight.rate}</strong>
                              </span>
                            </div>
                            <p className={styles.chatBillInsight}>{msg.billInsight.insight}</p>
                          </div>
                        )}
                        {msg.role === "assistant" && msg.zoneHighlight && (
                          <div className={styles.chatZoneCard}>
                            <span className={styles.chatZoneBadge}>{msg.zoneHighlight.label}</span>
                            <p className={styles.chatZoneDetail}>{msg.zoneHighlight.detail}</p>
                          </div>
                        )}
                        {msg.role === "assistant" && msg.consumptionHighlight && (
                          <div className={styles.chatConsumptionCard}>
                            <span className={styles.chatConsumptionLabel}>
                              {msg.consumptionHighlight.label}
                            </span>
                            <strong className={styles.chatConsumptionValue}>
                              {msg.consumptionHighlight.value}
                            </strong>
                            <p className={styles.chatConsumptionDetail}>
                              {msg.consumptionHighlight.detail}
                            </p>
                          </div>
                        )}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={styles.chatAttachments}>
                            {msg.attachments.map((att, i) =>
                              att.kind === "voice" ? (
                                <div key={i} className={styles.chatVoiceAttachment}>
                                  <span className={styles.chatVoiceIcon} aria-hidden>
                                    <img
                                      src="/chat-mic-icon.png"
                                      alt=""
                                      className={styles.chatVoiceIconImage}
                                    />
                                  </span>
                                  <div className={styles.chatVoiceAttachmentMeta}>
                                    <span className={styles.chatVoiceAttachmentTitle}>
                                      Voice message
                                    </span>
                                    <span className={styles.chatVoiceAttachmentDuration}>
                                      {att.durationLabel ?? "0:04"}
                                    </span>
                                  </div>
                                </div>
                              ) : att.url ? (
                                <div key={i} className={styles.chatAttachmentPreview}>
                                  <button
                                    type="button"
                                    className={styles.chatImagePreviewButton}
                                    onClick={() => openExpandedChatImage(att.url!, att.name)}
                                    aria-label={`Open ${att.name}`}
                                  >
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      className={styles.chatAttachmentImage}
                                    />
                                  </button>
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
                              onClick={() => onSignUpForTariff?.(SOLAR_SIGNUP_TARIFF)}
                            >
                              Sign up for solar
                            </button>
                          </div>
                        )}
                        {msg.role === "assistant" && msg.summary && (
                          <div className={styles.chatTariffCard}>
                            <h4 className={styles.chatTariffTitle}>Solar Savings Summary</h4>
                            <div className={styles.chatTariffPrices}>
                              <span className={styles.chatTariffPriceRow}>
                                <span>Panels estimated</span>
                                <strong>{msg.summary.panelCount}</strong>
                              </span>
                              <span className={styles.chatTariffPriceRow}>
                                <span>Total cost</span>
                                <strong>{formatCurrency(msg.summary.totalCost)}</strong>
                              </span>
                              <span className={styles.chatTariffPriceRow}>
                                <span>Monthly savings</span>
                                <strong>{formatCurrency(msg.summary.estimatedMonthlySavings)}</strong>
                              </span>
                              <span className={styles.chatTariffPriceRow}>
                                <span>Bill savings</span>
                                <strong>~{msg.summary.estimatedSavingsPercentage}%</strong>
                              </span>
                              <span className={styles.chatTariffPriceRow}>
                                <span>20-year cost without solar</span>
                                <strong>{formatCurrencyDetailed(msg.summary.costWithoutSolar)}</strong>
                              </span>
                              <span className={styles.chatTariffPriceRow}>
                                <span>20-year cost with solar</span>
                                <strong>{formatCurrencyDetailed(msg.summary.costWithSolar)}</strong>
                              </span>
                              <span className={styles.chatTariffPriceRow}>
                                <span>20-year savings</span>
                                <strong>{formatCurrencyDetailed(msg.summary.lifetimeSavings)}</strong>
                              </span>
                              <span className={styles.chatTariffPriceRow}>
                                <span>Break even</span>
                                <strong>
                                  {msg.summary.breakEvenYear} in {msg.summary.breakEvenYears} years
                                </strong>
                              </span>
                            </div>
                            <p className={styles.chatTariffDetail}>
                              {msg.summary.batterySelected
                                ? "Battery included for steadier savings."
                                : "No battery added."}
                            </p>
                            <button
                              type="button"
                              className={styles.chatTariffCta}
                              onClick={() =>
                                onSignUpForTariff?.(SOLAR_SIGNUP_TARIFF, msg.summary)
                              }
                            >
                              Sign up for solar
                            </button>
                          </div>
                        )}
                      </div>
                      {msg.role === "assistant" &&
                        msg.tariffCard?.id === "solar-boost" && (
                          <div className={styles.chatOptionRow}>
                            <button
                              type="button"
                              className={styles.chatOptionButton}
                              onClick={() => handleSolarQuickAction("savings")}
                            >
                              Estimate solar savings
                            </button>
                            <button
                              type="button"
                              className={styles.chatOptionButton}
                              onClick={() => handleSolarQuickAction("roof")}
                            >
                              Check roof eligibility
                            </button>
                          </div>
                        )}
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
                  <div ref={chatBottomRef} aria-hidden />
            </div>
            {chatPendingFiles.length > 0 && (
              <div className={styles.chatPendingRow}>
                    {chatPendingFiles.map((att, i) => (
                      <span key={i} className={styles.chatPendingChip}>
                        {att.kind === "voice" ? (
                          <span className={styles.chatPendingVoice}>
                            <span className={styles.chatVoiceIcon} aria-hidden>
                              <img
                                src="/chat-mic-icon.png"
                                alt=""
                                className={styles.chatVoiceIconImage}
                              />
                            </span>
                            <span className={styles.chatPendingVoiceMeta}>
                              <span className={styles.chatPendingName}>{att.name}</span>
                              <span className={styles.chatPendingDuration}>
                                {att.durationLabel}
                              </span>
                            </span>
                          </span>
                        ) : att.url ? (
                          <span className={styles.chatPendingPreview}>
                            <button
                              type="button"
                              className={styles.chatImagePreviewButton}
                              onClick={() => openExpandedChatImage(att.url!, att.name)}
                              aria-label={`Open ${att.name}`}
                            >
                              <img src={att.url} alt={att.name} className={styles.chatPendingThumb} />
                            </button>
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
                  {chatVoiceRecording ? (
                    <div className={styles.chatVoiceRecorder}>
                      <button
                        type="button"
                        className={styles.chatVoiceCancel}
                        onClick={cancelVoiceCapture}
                        aria-label="Cancel voice recording"
                      >
                        ×
                      </button>
                      <div className={styles.chatVoiceRecorderBody}>
                        <div className={styles.chatVoiceWave} aria-hidden>
                          <span />
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className={styles.chatVoiceRecorderMeta}>
                          <span className={styles.chatVoiceRecorderLabel}>Listening...</span>
                          <span className={styles.chatVoiceRecorderTime}>
                            {formatVoiceDuration(chatVoiceElapsed)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.chatVoiceSave}
                        onClick={saveVoiceCapture}
                        aria-label="Use voice recording"
                      >
                        Done
                      </button>
                    </div>
                  ) : chatVoicePlaying ? (
                    <div className={styles.chatVoiceRecorder}>
                      <button
                        type="button"
                        className={styles.chatVoiceCancel}
                        onClick={stopVoicePlayback}
                        aria-label="Stop voice playback"
                      >
                        ×
                      </button>
                      <div className={styles.chatVoiceRecorderBody}>
                        <div className={styles.chatVoiceWave} aria-hidden>
                          <span />
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className={styles.chatVoiceRecorderMeta}>
                          <span className={styles.chatVoiceRecorderLabel}>
                            Playing voice note...
                          </span>
                          <span className={styles.chatVoiceRecorderTime}>
                            {latestPlayableVoiceAttachment?.durationLabel ?? "0:12"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.chatVoiceSave}
                        onClick={stopVoicePlayback}
                        aria-label="Pause voice playback"
                      >
                        Pause
                      </button>
                    </div>
                  ) : (
                    <>
                  <input
                    id="chat-file-input"
                    type="file"
                    className={styles.chatFileInput}
                    accept="image/*,audio/*,.pdf,.doc,.docx"
                    multiple
                    onChange={handleChatFileChange}
                    aria-label="Add image, audio, or document"
                  />
                  <label
                    htmlFor="chat-file-input"
                    className={styles.chatAttachButton}
                    aria-label="Add image, audio, or document"
                  >
                    <span className={styles.chatAttachPlus} aria-hidden>
                      +
                    </span>
                  </label>
                  <button
                    type="button"
                    className={styles.chatMicButton}
                    onClick={startVoiceCapture}
                    aria-label={
                      latestPlayableVoiceAttachment ? "Play uploaded voice note" : "Record voice note"
                    }
                    title={
                      latestPlayableVoiceAttachment ? "Play uploaded voice note" : "Record voice note"
                    }
                  >
                    <img
                      src="/chat-mic-icon.png"
                      alt=""
                      aria-hidden
                      className={styles.chatMicIcon}
                    />
                  </button>
                  <input
                    type="text"
                    className={styles.chatInput}
                    placeholder="start typing..."
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
                    <span className={styles.chatSendIcon} aria-hidden>
                      ↑
                    </span>
                  </button>
                    </>
                  )}
            </div>
            {chatExpandedImage && (
              <div
                className={styles.chatImageLightbox}
                role="dialog"
                aria-label="Expanded image preview"
              >
                <button
                  type="button"
                  className={styles.chatImageLightboxScrim}
                  onClick={closeExpandedChatImage}
                  aria-label="Close image preview"
                />
                <div className={styles.chatImageLightboxContent}>
                  <button
                    type="button"
                    className={styles.chatImageLightboxClose}
                    onClick={closeExpandedChatImage}
                    aria-label="Close image preview"
                  >
                    ×
                  </button>
                  <img
                    src={chatExpandedImage.src}
                    alt={chatExpandedImage.name}
                    className={styles.chatImageLightboxImage}
                  />
                  <p className={styles.chatImageLightboxCaption}>
                    {chatExpandedImage.name}
                  </p>
                  {chatExpandedImage.name === SOLAR_PIN_PREVIEW_NAME && (
                    <div className={styles.chatImageLightboxMeta}>
                      <div className={styles.chatImageLightboxMetaRow}>
                        <span className={styles.chatImageLightboxMetaLabel}>Address</span>
                        <strong className={styles.chatImageLightboxMetaValue}>
                          {SOLAR_PIN_PREVIEW_ADDRESS}
                        </strong>
                      </div>
                      <div className={styles.chatImageLightboxMetaRow}>
                        <span className={styles.chatImageLightboxMetaLabel}>Latitude</span>
                        <strong className={styles.chatImageLightboxMetaValue}>
                          {SOLAR_PIN_PREVIEW_LAT_LNG.lat}
                        </strong>
                      </div>
                      <div className={styles.chatImageLightboxMetaRow}>
                        <span className={styles.chatImageLightboxMetaLabel}>Longitude</span>
                        <strong className={styles.chatImageLightboxMetaValue}>
                          {SOLAR_PIN_PREVIEW_LAT_LNG.lng}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

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
                onClick={plan.id === "solar-boost" ? openSolarConcierge : undefined}
              >
                Select plan
              </button>
            </article>
          ))}
        </div>
      </section>

      {floatingRoot ? createPortal(helpWidget, floatingRoot) : null}
    </div>
  );
};

export default NewCustomerHome;
