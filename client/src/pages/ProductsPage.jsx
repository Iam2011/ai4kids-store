import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/storeApi.js";
import { ProductCard } from "../components/ProductCard.jsx";

const categoryOptions = [
  "Remote Toys",
  "Action Toys",
  "Outdoor",
  "Educational",
  "Kids Toys",
  "Board Games",
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "discount", label: "Best Deals" },
  { value: "priceAsc", label: "Price Low to High" },
  { value: "priceDesc", label: "Price High to Low" },
  { value: "latest", label: "New Arrivals" },
];

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "featured";
  const featured = searchParams.get("featured") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const data = await getProducts({
          category,
          sort,
          featured,
          search: searchParams.get("search") || "",
          limit: 60,
        });
        setProducts(data.products || []);
        setErrorMessage("");
      } catch (error) {
        setProducts([]);
        setErrorMessage(error.response?.data?.message || "Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sort, featured, searchParams]);

  const updateFilters = (updates) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    setSearchParams(next);
  };

  return (
    <div className="page-stack app-listing-page">
      <section className="section-panel listing-search-card">
        <div className="listing-header-copy">
          <span className="eyebrow">Toy catalog</span>
          <h1>Best Sellers and trending picks</h1>
          <p className="section-copy">
            Browse mobile-friendly product cards with clear pricing, reviews, and quick buy actions.
          </p>
        </div>

        <div className="listing-controls">
          <input
            className="text-input"
            placeholder="Search toy name"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                updateFilters({ search: searchInput });
              }
            }}
          />

          <div className="listing-control-row">
            <button
              type="button"
              className="primary-button inline-pill-button"
              onClick={() => updateFilters({ search: searchInput })}
            >
              Search
            </button>

            <select
              className="text-input compact-select"
              value={sort}
              onChange={(event) => updateFilters({ sort: event.target.value })}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="chip-row listing-chip-row">
        <button
          type="button"
          className={`filter-chip ${featured === "true" ? "active" : ""}`}
          onClick={() => updateFilters({ featured: featured === "true" ? "" : "true" })}
        >
          Best Sellers
        </button>
        {categoryOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={`filter-chip ${category === option ? "active" : ""}`}
            onClick={() => updateFilters({ category: category === option ? "" : option })}
          >
            {option}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="catalog-card-list">
          {Array.from({ length: 3 }, (_, index) => (
            <article key={index} className="product-card showcase-card placeholder-card">
              <div className="placeholder-image" />
              <div className="placeholder-line" />
              <div className="placeholder-line short" />
            </article>
          ))}
        </div>
      ) : errorMessage ? (
        <div className="empty-state">{errorMessage}</div>
      ) : products.length ? (
        <div className="catalog-card-list">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} variant="showcase" />
          ))}
        </div>
      ) : (
        <div className="empty-state">No products match these filters yet.</div>
      )}
    </div>
  );
};
