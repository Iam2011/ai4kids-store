const valuePillars = [
  {
    title: "Creative Learning Toys",
    text: "Curated picks that spark curiosity, imagination, and hands-on play at home.",
  },
  {
    title: "Screen-Free Smart Play",
    text: "Activity-led toys that help children stay engaged beyond passive screen time.",
  },
  {
    title: "Curated for Families",
    text: "Fast-moving toys, gifting options, and combo picks chosen for easy mobile shopping.",
  },
];

const supportPoints = [
  {
    label: "Call us",
    value: "8469023717",
    href: "tel:8469023717",
  },
  {
    label: "Email support",
    value: "info@ai4kids.in",
    href: "mailto:info@ai4kids.in",
  },
  {
    label: "Visit website",
    value: "www.ai4kids.in",
    href: "https://www.ai4kids.in",
  },
];

const deliveryNotes = [
  "India-wide delivery with order support you can trust.",
  "COD and online payment options aligned with the live store flow.",
  "Clear pricing, curated products, and quick help when families need it.",
];

export const AboutPage = () => (
  <div className="page-stack static-page about-page">
    <section className="section-panel static-page-panel about-brand-card">
      <span className="eyebrow">About AI4Kids</span>
      <div className="about-brand-hero">
        <div className="about-brand-copy">
          <span className="about-brand-kicker">Smart Fun For Children</span>
          <h1>Learning-led toys and playful gifting, curated for modern family shopping.</h1>
          <p>
            AI4Kids is built around one simple idea: make toy buying feel joyful, clear, and
            trustworthy on mobile. We curate exciting toys that help kids play, learn, and explore
            without making parents scroll through marketplace clutter.
          </p>
        </div>
        <div className="about-logo-card" aria-hidden="true">
          <img src="/logo.png" alt="" className="about-logo-image" />
          <div className="about-logo-glow" />
        </div>
      </div>
    </section>

    <section className="section-panel about-values-panel">
      <div className="section-heading-row">
        <div>
          <span className="eyebrow">Why families choose us</span>
          <h2>Thoughtful toys, clean shopping, and support-led trust.</h2>
        </div>
      </div>
      <div className="about-value-grid">
        {valuePillars.map((item) => (
          <article key={item.title} className="about-value-card">
            <span className="about-value-icon" aria-hidden="true">
              ●
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="section-panel about-support-panel">
      <div className="section-heading-row">
        <div>
          <span className="eyebrow">Contact & support</span>
          <h2>Reach AI4Kids quickly whenever you need help.</h2>
        </div>
      </div>
      <div className="about-contact-grid">
        {supportPoints.map((item) => (
          <a key={item.label} href={item.href} className="about-contact-card">
            <span className="about-contact-label">{item.label}</span>
            <strong>{item.value}</strong>
          </a>
        ))}
      </div>
    </section>

    <section className="section-panel about-delivery-panel">
      <div className="section-heading-row">
        <div>
          <span className="eyebrow">Our promise</span>
          <h2>Curated toys with simple ordering and dependable delivery support.</h2>
        </div>
      </div>
      <div className="about-note-stack">
        {deliveryNotes.map((note) => (
          <div key={note} className="about-note-row">
            <span className="about-note-marker" aria-hidden="true" />
            <p>{note}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section-panel about-tagline-banner">
      <span className="eyebrow">AI4Kids promise</span>
      <h2>Make Your Kids Learn While They Play</h2>
      <p>
        We bring together fun, gifting, and curiosity-driven products so families can shop with
        confidence and children can enjoy smarter play every day.
      </p>
    </section>
  </div>
);
