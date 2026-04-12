import { Link } from "react-router-dom";
import { ProductImage } from "./ProductImage.jsx";
import { SectionHeading } from "./SectionHeading.jsx";

export const AgeSection = ({ cards }) => (
  <section className="section-panel age-discovery-panel">
    <SectionHeading
      eyebrow="Shop by age"
      title="Find the right toy match in one tap"
      description="Guided discovery keeps parents focused and helps ad traffic convert faster."
      actionLabel="Browse all toys"
      actionTo="/products"
    />

    <div className="age-discovery-grid">
      {cards.map((card) => (
        <article key={card.age} className={`age-discovery-card ${card.tone || ""}`}>
          <div className="age-card-copy">
            <span className="age-label">{card.age}</span>
            <h3>{card.title}</h3>
            <p>{card.guidance}</p>
            <Link className="text-button" to={card.to}>
              {card.cta}
            </Link>
          </div>
          <ProductImage
            src={card.image}
            alt={card.imageAlt}
            wrapperClassName="age-card-image-wrap"
            className="age-card-image"
          />
        </article>
      ))}
    </div>
  </section>
);
