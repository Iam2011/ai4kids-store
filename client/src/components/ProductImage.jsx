import { useState } from "react";

export const ProductImage = ({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  loading = "lazy",
  fallbackSrc = "/logo.png",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const resolvedSrc = useFallback ? fallbackSrc : src || fallbackSrc;
  const wrapperClasses = ["product-image-shell", wrapperClassName].filter(Boolean).join(" ");
  const imageClasses = ["product-image", className, isLoaded ? "is-loaded" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      {!isLoaded ? <span className="image-skeleton" aria-hidden="true" /> : null}
      <img
        src={resolvedSrc}
        alt={alt}
        loading={loading}
        className={imageClasses}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!useFallback) {
            setUseFallback(true);
            setIsLoaded(false);
            return;
          }

          setIsLoaded(true);
        }}
      />
    </div>
  );
};
