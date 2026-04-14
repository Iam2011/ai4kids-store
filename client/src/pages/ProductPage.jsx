import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/storeApi.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { QuantitySelector } from "../components/QuantitySelector.jsx";
import { TrustMarkers } from "../components/TrustMarkers.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";
import { buildProductBenefit } from "../utils/catalogMerchandising.js";
import { trackStoreEvent } from "../utils/visitTracking.js";

export const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [data, setData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);

      try {
        const response = await getProduct(slug);
        setData(response);
        setSelectedMedia(response.product.gallery?.[0] || response.product.imageUrl);
        setQuantity(response.product.moq);
        setErrorMessage("");
        trackStoreEvent({
          eventType: "product_view",
          product: {
            productId: response.product._id,
            productName: response.product.name,
            category: response.product.category,
          },
        }).catch(() => {});
      } catch (error) {
        setData(null);
        setErrorMessage(error.response?.data?.message || "Unable to load this product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return <div className="empty-state">Loading product details...</div>;
  }

  if (!data?.product) {
    return <div className="empty-state">{errorMessage || "Product not found."}</div>;
  }

  const { product, relatedProducts } = data;
  const gallery = product.gallery?.length ? product.gallery : [product.imageUrl];
  const featureList = Array.isArray(product.features) && product.features.length ? product.features : [];

  const handleBuyNow = () => {
    trackStoreEvent({
      eventType: "buy_now_click",
      product: {
        productId: product._id,
        productName: product.name,
        category: product.category,
      },
    }).catch(() => {});
    addItem(product, quantity);
    navigate("/checkout");
  };

  return (
    <div className="page-stack product-layout">
      <section className="product-detail-panel">
        <div className="gallery-column">
          <div className="gallery-stage">
            <img src={selectedMedia} alt={product.name} className="gallery-stage-image" />
          </div>
          <div className="thumbnail-row">
            {gallery.map((image) => (
              <button
                key={image}
                type="button"
                className={`thumbnail-button ${selectedMedia === image ? "active" : ""}`}
                onClick={() => setSelectedMedia(image)}
              >
                <img src={image} alt={product.name} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-column">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-copy">{product.description}</p>

          <div className="product-proof-stack">
            <span className="mini-label">Shopper confidence</span>
            <p className="helper-text">
              Rated {Number(product.rating || 4.5).toFixed(1)} by {product.reviewCount || 0} buyers.
            </p>
          </div>

          <div className="detail-price-box">
            <div>
              <strong>{formatCurrency(product.price)}</strong>
              <span>{formatCurrency(product.originalPrice)}</span>
            </div>
            <span className="discount-pill">{product.discountPercent}% OFF</span>
          </div>

          <div className="detail-highlights">
            <div>
              <span>Recommended Age</span>
              <strong>{product.ageGroup}</strong>
            </div>
            <div>
              <span>Minimum Order Qty</span>
              <strong>{product.moq}</strong>
            </div>
            <div>
              <span>Urgency</span>
              <strong>{product.badge}</strong>
            </div>
          </div>

          {featureList.length ? (
            <div className="detail-highlights">
              {featureList.slice(0, 3).map((feature) => (
                <div key={feature}>
                  <span>Feature</span>
                  <strong>{feature}</strong>
                </div>
              ))}
            </div>
          ) : null}

          <div className="stock-banner">
            <strong>{product.limitedStock ? "Limited Stock" : "Sale Ending Soon"}</strong>
            <span>{product.stockCount} units currently available for this batch</span>
          </div>

          <div className="product-proof-stack">
            <span className="mini-label">Trending now</span>
            <p className="helper-text">
              {buildProductBenefit(product)}
            </p>
          </div>

          <div className="detail-actions">
            <QuantitySelector quantity={quantity} min={product.moq} onChange={setQuantity} />
            <button className="secondary-button" onClick={() => addItem(product, quantity)}>
              Add to Cart
            </button>
            <button className="primary-button" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>

          <TrustMarkers />
        </div>
      </section>

      <section className="sticky-buy-bar">
        <div>
          <strong>{formatCurrency(product.price)}</strong>
          <span>MOQ {product.moq} | {product.badge}</span>
        </div>
        <button className="primary-button" onClick={handleBuyNow}>
          Buy Now
        </button>
      </section>

      {relatedProducts?.length ? (
        <section className="section-panel">
          <div className="section-head">
            <div>
              <span className="eyebrow">You may also like</span>
              <h2>More products from the same collection</h2>
            </div>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`}>See all</Link>
          </div>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct._id}
                product={{
                  ...relatedProduct,
                  shortDescription: buildProductBenefit(relatedProduct),
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
