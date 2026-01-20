import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <img
            className={styles.logo}
            src="/kenton-logo-in-white.png"
            alt="Kenton Energy logo"
          />
          <p className={styles.copy}>
            Kenton Energy provides progressive and affordable energy solutions
            for residential customers.
          </p>
          <span className={styles.meta}>© Kenton Energy 2026</span>
        </div>
        <div className={styles.links}>
          <div>
            <h4>Company</h4>
            <span>About</span>
            <span>Contact</span>
            <span>Careers</span>
          </div>
          <div>
            <h4>Region</h4>
            <span>Indonesia</span>
            <span>Singapore</span>
            <span>Canada</span>
          </div>
          <div>
            <h4>Help</h4>
            <span>Help Center</span>
            <span>Contact Support</span>
            <span>How it works</span>
          </div>
        </div>
      </div>
      <img
        className={styles.cityscape}
        src="/cityscape-footer.png"
        alt=""
      />
    </footer>
  );
};

export default Footer;
