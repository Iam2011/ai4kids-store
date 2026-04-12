import { Link } from "react-router-dom";

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  actionLabel = "",
  actionTo = "",
}) => (
  <div className="section-head premium-head">
    <div>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {description ? <p className="section-copy">{description}</p> : null}
    </div>
    {actionLabel && actionTo ? (
      <Link className="section-link" to={actionTo}>
        {actionLabel}
      </Link>
    ) : null}
  </div>
);
