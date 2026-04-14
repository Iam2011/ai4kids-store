import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/storeApi.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { storefrontCategories } from "../constants/storefrontCategories.js";
import { buildProductBenefit } from "../utils/catalogMerchandising.js";

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
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const initialLoadDoneRef = useRef(false);

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "featured";
  const featured = searchParams.get("featured") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const fetchProducts = async () => {
    const isInitialLoad = !initialLoadDoneRef.current;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setErrorMessage("");

    try {
      const data = await getProducts({
        category,
        sort,
        featured,
        search,
        limit: 60,
      });
      setProducts(data.products || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Couldn’t load toys right now. Please try again.";
      setErrorMessage(message);
    } finally {
      initialLoadDoneRef.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sort, featured, search]);

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
          <h1>Explore toys by category</h1>
          <p className="section-copy">
            Find the right toy faster with search, smart filters, and best-seller picks.
          </p>
        </div>

        <div className="listing-controls">
          <input
            className="text-input"
            placeholder="Search toys"
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
        {storefrontCategories.map((option) => (
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

      {refreshing && !loading ? <p className="helper-text">We’re refreshing the catalog…</p> : null}

      {loading ? (
        <div className="catalog-card-list">
          {Array.from({ length: 4 }, (_, index) => (
            <article key={index} className="product-card showcase-card placeholder-card">
              <div className="placeholder-image" />
              <div className="placeholder-line" />
              <div className="placeholder-line short" />
            </article>
          ))}
        </div>
      ) : errorMessage && !products.length ? (
        <div className="empty-state">
          <p>{errorMessage}</p>
          <button type="button" className="primary-button" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      ) : (
        <div className="catalog-card-list">
          {errorMessage ? (
            <div className="empty-state">
              <p>{errorMessage}</p>
              <button type="button" className="secondary-button" onClick={fetchProducts}>
                Retry
              </button>
            </div>
          ) : null}

          {products.length ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={{
                  ...product,
                  shortDescription: buildProductBenefit(product),
                }}
                variant="showcase"
              />
            ))
          ) : (
            <div className="empty-state">No toys match these filters yet.</div>
          )}
        </div>
      )}
    </div>
  );
};
