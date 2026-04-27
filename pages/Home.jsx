import { useState, useRef } from "react";
import { searchGroceryDeals } from "../api/backendFunctions";

const STORE_COLORS = {
  "Giant Food": "#e63946",
  "Giant Food Stores": "#e63946",
  "Martin's Food Market": "#2a9d8f",
  "ALDI": "#00adef",
  "Walmart": "#0071ce",
  "CVS Pharmacy": "#cc0000",
  "Walgreens": "#e31837",
  "Target": "#cc0000",
  "Kroger": "#003087",
  "Safeway": "#e41e2c",
  "Costco": "#005DAA",
  "Grocery Outlet": "#ff6f00",
  "Family Dollar": "#006400",
  "Dollar General": "#ffd700",
};

function getStoreColor(store) {
  for (const [key, color] of Object.entries(STORE_COLORS)) {
    if (store.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#6c757d";
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function DealCard({ deal }) {
  const storeColor = getStoreColor(deal.store);
  const savings = deal.original_price && deal.price ? deal.original_price - deal.price : null;
  const isOnline = deal.is_online;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      padding: "14px 16px",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      border: `2px solid ${storeColor}22`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 5,
        height: "100%",
        background: storeColor,
        borderRadius: "14px 0 0 14px",
      }} />
      {deal.image_url && (
        <img
          src={deal.image_url}
          alt={deal.item_name}
          style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 8, flexShrink: 0 }}
          onError={e => e.target.style.display = "none"}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#222", lineHeight: 1.3, marginBottom: 4 }}>
          {deal.item_name}
        </div>
        {deal.sale_story && (
          <div style={{ fontSize: 11, color: "#e85d04", fontStyle: "italic", marginBottom: 4, lineHeight: 1.3 }}>
            {deal.sale_story}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: storeColor }}>
            ${deal.price?.toFixed(2)}
          </span>
          {deal.original_price && (
            <span style={{ fontSize: 13, color: "#999", textDecoration: "line-through" }}>
              ${deal.original_price.toFixed(2)}
            </span>
          )}
          {savings && savings > 0 && (
            <span style={{
              background: "#d4edda",
              color: "#155724",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: 20,
            }}>
              Save ${savings.toFixed(2)}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
          <span style={{
            background: storeColor + "18",
            color: storeColor,
            fontWeight: 700,
            fontSize: 11,
            padding: "3px 9px",
            borderRadius: 20,
          }}>
            {deal.store}
          </span>
          {isOnline && (
            <span style={{
              background: "#e3f2fd",
              color: "#1565c0",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 9px",
              borderRadius: 20,
            }}>📦 Online</span>
          )}
          {deal.valid_from && deal.valid_to && (
            <span style={{ fontSize: 11, color: "#888" }}>
              {formatDate(deal.valid_from)}–{formatDate(deal.valid_to)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemSection({ itemName, deals }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? deals : deals.slice(0, 5);
  const best = deals[0];

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          fontWeight: 800,
          fontSize: 18,
          color: "#222",
          textTransform: "capitalize",
        }}>
          🛒 {itemName}
        </div>
        {best && (
          <div style={{
            background: "linear-gradient(135deg, #f8b400, #ff6b35)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 20,
          }}>
            Best: ${best.price?.toFixed(2)} @ {best.store}
          </div>
        )}
        <div style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>
          {deals.length} deal{deals.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {deals.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "20px",
          background: "#f8f9fa",
          borderRadius: 12,
          color: "#888",
          fontSize: 14,
        }}>
          No deals found in circulars for "{itemName}" right now. Try a shorter search term.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((deal, i) => (
            <DealCard key={i} deal={deal} />
          ))}
          {deals.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                background: "none",
                border: "2px solid #dee2e6",
                color: "#555",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {showAll ? "Show fewer" : `Show ${deals.length - 5} more deals`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function GroceryGames() {
  const [inputText, setInputText] = useState("");
  const [zipCode, setZipCode] = useState("21220");
  const [items, setItems] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const addItem = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (!items.includes(trimmed.toLowerCase())) {
      setItems([...items, trimmed.toLowerCase()]);
    }
    setInputText("");
    inputRef.current?.focus();
  };

  const removeItem = (item) => {
    setItems(items.filter(i => i !== item));
    if (results) {
      const newResults = { ...results };
      delete newResults[item];
      setResults(Object.keys(newResults).length > 0 ? newResults : null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addItem();
  };

  const search = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await searchGroceryDeals({ items, postal_code: zipCode });
      if (data.error) throw new Error(data.error);
      setResults(data.results);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalDeals = results ? Object.values(results).reduce((sum, arr) => sum + arr.length, 0) : 0;
  const bestStores = results ? (() => {
    const storeCounts = {};
    Object.values(results).forEach(deals => {
      if (deals[0]) storeCounts[deals[0].store] = (storeCounts[deals[0].store] || 0) + 1;
    });
    return Object.entries(storeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  })() : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #f8b400 0%, #ff6b35 100%)",
        padding: "24px 20px 28px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 40, marginBottom: 4 }}>🛒</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          Grocery Games
        </h1>
        <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 500 }}>
          Find the best deals from local circulars
        </p>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 16px" }}>
        {/* Search Box */}
        <div style={{
          background: "#fff",
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          marginBottom: 20,
        }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 700, fontSize: 13, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>
              📍 Your Zip Code
            </label>
            <input
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              placeholder="21220"
              maxLength={5}
              style={{
                display: "block",
                width: "100%",
                marginTop: 6,
                padding: "10px 14px",
                borderRadius: 10,
                border: "2px solid #e9ecef",
                fontSize: 15,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 700, fontSize: 13, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 }}>
              🛍️ Add Grocery Items
            </label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input
                ref={inputRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='e.g. "lactaid milk", "crackers", "eggs"'
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "2px solid #e9ecef",
                  fontSize: 15,
                  outline: "none",
                }}
              />
              <button
                onClick={addItem}
                disabled={!inputText.trim()}
                style={{
                  background: inputText.trim() ? "linear-gradient(135deg, #f8b400, #ff6b35)" : "#e9ecef",
                  color: inputText.trim() ? "#fff" : "#aaa",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 20,
                  cursor: inputText.trim() ? "pointer" : "default",
                  fontWeight: 700,
                  transition: "all 0.2s",
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Item Tags */}
          {items.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item} style={{
                  background: "#f0f4ff",
                  border: "2px solid #d0d8ff",
                  color: "#3a4a8a",
                  borderRadius: 20,
                  padding: "5px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  {item}
                  <button
                    onClick={() => removeItem(item)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#888",
                      fontSize: 16,
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={search}
            disabled={items.length === 0 || loading}
            style={{
              width: "100%",
              background: items.length > 0 && !loading
                ? "linear-gradient(135deg, #f8b400 0%, #ff6b35 100%)"
                : "#e9ecef",
              color: items.length > 0 && !loading ? "#fff" : "#aaa",
              border: "none",
              borderRadius: 12,
              padding: "14px 20px",
              fontSize: 16,
              fontWeight: 800,
              cursor: items.length > 0 && !loading ? "pointer" : "default",
              transition: "all 0.2s",
              letterSpacing: 0.3,
            }}
          >
            {loading ? "🔍 Searching circulars..." : `🎯 Find Best Deals (${items.length} item${items.length !== 1 ? "s" : ""})`}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fff3f3",
            border: "2px solid #ffcccc",
            borderRadius: 12,
            padding: 16,
            color: "#cc0000",
            marginBottom: 20,
            fontSize: 14,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>Scanning local circulars...</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6 }}>
              Checking Giant, Aldi, Walmart, and more near {zipCode}
            </div>
          </div>
        )}

        {/* Summary Banner */}
        {results && !loading && totalDeals > 0 && (
          <div style={{
            background: "linear-gradient(135deg, #2d6a4f, #1b4332)",
            borderRadius: 14,
            padding: 16,
            marginBottom: 20,
            color: "#fff",
          }}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>
              🎉 Found {totalDeals} deals across {Object.keys(results).length} items!
            </div>
            {bestStores.length > 0 && (
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                Best stores: {bestStores.map(([store, count]) => `${store} (${count} best price${count > 1 ? "s" : ""})`).join(" · ")}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div>
            {Object.entries(results).map(([item, deals]) => (
              <ItemSection key={item} itemName={item} deals={deals} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        input:focus { border-color: #f8b400 !important; box-shadow: 0 0 0 3px rgba(248,180,0,0.15); }
        button:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
