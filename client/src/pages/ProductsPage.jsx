import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../api/storeApi.js";
import { ProductCard } from "../components/ProductCard.jsx";

const ageOptions = ["0-2", "3-5", "6-8", "9+"];
const categoryOptions = [
  "Remote Toys",
  "Board Games",
  "Educational",
  "Outdoor",
  "Action Toys",
  "Kids Toys",
];

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const ageGroup = searchParams.get("ageGroup") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "featured";
  const featured = searchParams.get("featured") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const data = await getProducts({
          ageGroup,
          category,
          sort,
          featured,
          search: searchParams.get("search") || "",
          limit: 60,
        });
        setProducts(data.products);
        setErrorMessage("");
      } catch (error) {
        setProducts([]);
        setErrorMessage(error.response?.data?.message || "Unable to load products right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [ageGroup, category, sort, featured, searchParams]);

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
    <div className="page-stack listing-layout">
      <section className="section-panel listing-hero">
        <div className="listing-hero-copy">
          <span className="eyebrow">Toy catalog</span>
          <h1>Find the right toy in a few quick taps</h1>
          <p className="section-copy">
            Search, sort, and filter with a mobile-friendly browse flow built for faster buying decisions.
          </p>
        </div>
        <div className="toolbar-grid">
          <div className="search-field">
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
            <button
              type="button"
              className="secondary-button"
              onClick={() => updateFilters({ search: searchInput })}
            >
              Search
            </button>
          </div>
          <select className="text-input" value={ageGroup} onChange={(event) => updateFilters({ ageGroup: event.target.value })}>
            <option value="">All ages</option>
            {ageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select className="text-input" value={category} onChange={(event) => updateFilters({ category: event.target.value })}>
            <option value="">All categories</option>
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select className="text-input" value={sort} onChange={(event) => updateFilters({ sort: event.target.value })}>
            <option value="featured">Featured</option>
            <option value="discount">Highest Discount</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="latest">Latest</option>
          </select>
          <button
            type="button"
            className="text-button reset-filters-button"
            onClick={() => {
              setSearchInput("");
              setSearchParams(new URLSearchParams());
            }}
          >
            Reset filters
          </button>
        </div>
      </section>

      <div className="chip-row">
        <button className={`filter-chip ${featured === "true" ? "active" : ""}`} onClick={() => updateFilters({ featured: featured === "true" ? "" : "true" })}>
          Best Sellers
        </button>
        {categoryOptions.map((option) => (
          <button
            key={option}
            className={`filter-chip ${category === option ? "active" : ""}`}
            onClick={() => updateFilters({ category: category === option ? "" : option })}
          >
            {option}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Loading products...</div>
      ) : errorMessage ? (
        <div className="empty-state">{errorMessage}</div>
      ) : products.length ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No products match these filters yet.</div>
      )}
    </div>
  );
};
