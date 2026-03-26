import { useState, useCallback, useEffect, useRef } from "react";
import type { SolarSavingsSummary, Tariff } from "../types";
import styles from "./EnrollmentPage.module.css";

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

export type EnrollmentDetails = {
  fullName: string;
  address: string;
  email: string;
  phone: string;
  previousSupplier: string;
  meterNumber: string;
};

const MOCK_EXTRACTED: EnrollmentDetails = {
  fullName: "Rosa Holt",
  address: "1234 25th Street, San Francisco, CA 94110",
  email: "rosa.martinez@email.com",
  phone: "+1 415 555 0123",
  previousSupplier: "Pacific Gas & Electric",
  meterNumber: "PG&E-88472-01",
};

type EnrollmentPageProps = {
  tariff: Tariff;
  solarSummary?: SolarSavingsSummary | null;
  onBack: () => void;
  onComplete: () => void;
};

const EnrollmentPage = ({ tariff, solarSummary, onBack, onComplete }: EnrollmentPageProps) => {
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [utilityBillFile, setUtilityBillFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [details, setDetails] = useState<EnrollmentDetails>({
    fullName: "",
    address: "",
    email: "",
    phone: "",
    previousSupplier: "",
    meterNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [signedUp, setSignedUp] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const pageTopRef = useRef<HTMLDivElement | null>(null);

  const bothUploaded = govIdFile && utilityBillFile;

  const runMockOcrAndPalm = useCallback(() => {
    setProcessing(true);
    // Simulate document reading delay
    setTimeout(() => {
      setDetails(MOCK_EXTRACTED);
      setPrefilled(true);
      setEditingDetails(false);
      setProcessing(false);
    }, 2200);
  }, []);

  const handleGovIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setGovIdFile(file);
    e.target.value = "";
  };

  const handleUtilityBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUtilityBillFile(file);
    e.target.value = "";
  };

  const handleDetailChange = (field: keyof EnrollmentDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Mock sign-up API call
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSignedUp(true);
  };

  useEffect(() => {
    if (!prefilled) return;

    const frameId = requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLElement) {
        activeElement.blur();
      }
      pageTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [prefilled]);

  if (signedUp) {
    return (
      <section className={styles.page} aria-labelledby="enrollment-success-title">
        <div className={styles.inner}>
          <button className={styles.backButton} type="button" onClick={onComplete}>
            ← Back to Home
          </button>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.successTitle} id="enrollment-success-title">
              You’re signed up for {tariff.name}
            </h1>
            <p className={styles.successMessage}>
              We’ve received your details and documents. You’ll get a confirmation
              email shortly. Our team will complete verification and your new
              tariff will be active within 3–5 business days.
            </p>
            <button className={styles.primaryButton} type="button" onClick={onComplete}>
              Return to Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="enrollment-title">
      <div className={styles.inner}>
        <div ref={pageTopRef} />
        <button className={styles.backButton} type="button" onClick={onBack}>
          ← Back to Kenton Agent
        </button>
        <header className={styles.header}>
          <p className={styles.kicker}>Tariff enrollment</p>
          <h1 className={styles.title} id="enrollment-title">
            Sign up for {tariff.name}
          </h1>
          <p className={styles.subtitle}>
            Upload your documents and we’ll read them and fill in your details
            for you.
          </p>
        </header>

        <div className={styles.tariffBadge}>
          <span className={styles.tariffName}>{tariff.name}</span>
          <span className={styles.tariffPrice}>{tariff.price}</span>
        </div>

        {solarSummary && (
          <div className={styles.solarSummaryCard}>
            <h2 className={styles.solarSummaryTitle}>Solar Savings Summary</h2>
            <div className={styles.solarSummaryBody}>
              <div className={styles.solarSummaryRow}>
                <span>Panels estimated</span>
                <strong>{solarSummary.panelCount}</strong>
              </div>
              <div className={styles.solarSummaryRow}>
                <span>Total cost</span>
                <strong>{formatCurrency(solarSummary.totalCost)}</strong>
              </div>
              <div className={styles.solarSummaryRow}>
                <span>Monthly savings</span>
                <strong>
                  {formatCurrency(solarSummary.estimatedMonthlySavings)}
                </strong>
              </div>
              <div className={styles.solarSummaryRow}>
                <span>Bill savings</span>
                <strong>~{solarSummary.estimatedSavingsPercentage}%</strong>
              </div>
              <div className={styles.solarSummaryRow}>
                <span>20-year cost without solar</span>
                <strong>{formatCurrencyDetailed(solarSummary.costWithoutSolar)}</strong>
              </div>
              <div className={styles.solarSummaryRow}>
                <span>20-year cost with solar</span>
                <strong>{formatCurrencyDetailed(solarSummary.costWithSolar)}</strong>
              </div>
              <div className={styles.solarSummaryRow}>
                <span>20-year savings</span>
                <strong>{formatCurrencyDetailed(solarSummary.lifetimeSavings)}</strong>
              </div>
              <div className={styles.solarSummaryRow}>
                <span>Break even</span>
                <strong>
                  {solarSummary.breakEvenYear} in {solarSummary.breakEvenYears} years
                </strong>
              </div>
            </div>
            <div className={styles.solarSummaryFooter}>
              {solarSummary.batterySelected
                ? "Battery included for steadier savings."
                : "No battery added."}
            </div>
          </div>
        )}

        {/* Document upload */}
        <div className={styles.uploadSection}>
          <h2 className={styles.sectionTitle}>Required documents</h2>
          <div className={styles.uploadGrid}>
            <label className={styles.uploadCard}>
              <span className={styles.uploadLabel}>Government-issued ID</span>
              <span className={styles.uploadHint}>Passport, driving licence, etc.</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className={styles.fileInput}
                onChange={handleGovIdChange}
                disabled={prefilled}
              />
              {govIdFile ? (
                <span className={styles.fileName}>{govIdFile.name}</span>
              ) : (
                <span className={styles.uploadCta}>Choose file</span>
              )}
            </label>
            <label className={styles.uploadCard}>
              <span className={styles.uploadLabel}>Previous utility bill</span>
              <span className={styles.uploadHint}>Within last 3 months</span>
              <input
                type="file"
                accept="image/*,.pdf"
                className={styles.fileInput}
                onChange={handleUtilityBillChange}
                disabled={prefilled}
              />
              {utilityBillFile ? (
                <span className={styles.fileName}>{utilityBillFile.name}</span>
              ) : (
                <span className={styles.uploadCta}>Choose file</span>
              )}
            </label>
          </div>
          {bothUploaded && !prefilled && !processing && (
            <button
              type="button"
              className={styles.extractButton}
              onClick={runMockOcrAndPalm}
            >
              Auto-fill my details
            </button>
          )}
          {processing && (
            <div className={styles.processing}>
              <div className={styles.spinner} aria-hidden />
              <p>Reading your documents… filling in your details.</p>
            </div>
          )}
        </div>

        {/* Prefilled form */}
        {prefilled && (
          <div className={styles.form}>
            <h2 className={styles.sectionTitle}>Your details</h2>
            <p className={styles.prefillNote}>
              We’ve filled these in from your documents. Review and edit if
              needed, then complete sign-up.
            </p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setEditingDetails((prev) => !prev)}
            >
              {editingDetails ? "Done editing" : "Edit details"}
            </button>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Full name</span>
                {editingDetails ? (
                  <input
                    type="text"
                    name="enrollment_full_name_manual"
                    value={details.fullName}
                    onChange={(e) => handleDetailChange("fullName", e.target.value)}
                    className={styles.input}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                ) : (
                  <div className={styles.inputDisplay}>{details.fullName}</div>
                )}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Address</span>
                {editingDetails ? (
                  <input
                    type="text"
                    name="enrollment_address_manual"
                    value={details.address}
                    onChange={(e) => handleDetailChange("address", e.target.value)}
                    className={styles.input}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                ) : (
                  <div className={styles.inputDisplay}>{details.address}</div>
                )}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                {editingDetails ? (
                  <input
                    type="email"
                    name="enrollment_email_manual"
                    value={details.email}
                    onChange={(e) => handleDetailChange("email", e.target.value)}
                    className={styles.input}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                ) : (
                  <div className={styles.inputDisplay}>{details.email}</div>
                )}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Phone</span>
                {editingDetails ? (
                  <input
                    type="tel"
                    name="enrollment_phone_manual"
                    value={details.phone}
                    onChange={(e) => handleDetailChange("phone", e.target.value)}
                    className={styles.input}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                ) : (
                  <div className={styles.inputDisplay}>{details.phone}</div>
                )}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Previous supplier</span>
                {editingDetails ? (
                  <input
                    type="text"
                    name="enrollment_supplier_manual"
                    value={details.previousSupplier}
                    onChange={(e) =>
                      handleDetailChange("previousSupplier", e.target.value)
                    }
                    className={styles.input}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                ) : (
                  <div className={styles.inputDisplay}>{details.previousSupplier}</div>
                )}
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Meter number</span>
                {editingDetails ? (
                  <input
                    type="text"
                    name="enrollment_meter_manual"
                    value={details.meterNumber}
                    onChange={(e) =>
                      handleDetailChange("meterNumber", e.target.value)
                    }
                    className={styles.input}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                ) : (
                  <div className={styles.inputDisplay}>{details.meterNumber}</div>
                )}
              </div>
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Signing you up…" : "Complete sign-up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EnrollmentPage;
