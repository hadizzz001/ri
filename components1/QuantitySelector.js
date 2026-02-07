import React, { useState, useEffect } from "react";

const QuantitySelector = ({ initialQty = 1, productId, onChange, type, selectedColor, selectedSize }) => {
  const [qty, setQty] = useState(initialQty);
  const [maxStock, setMaxStock] = useState(null); // Store max stock

console.log("=== QuantitySelector RENDER ===");
console.log("initialQty:", initialQty);
console.log("productId:", productId);
console.log("selectedColor:", selectedColor);
console.log("selectedSize:", selectedSize);
console.log("type:", type);
console.log("Current qty state:", qty);
console.log("Current maxStock state:", maxStock); 


  useEffect(() => {
    console.log("=== useEffect TRIGGERED ===");
    console.log("productId:", productId);
    console.log("selectedColor:", selectedColor);
    console.log("selectedSize:", selectedSize);
    console.log("type:", type);
    
    // Guard: Don't run if productId is not available
    if (!productId) {
      console.log("⚠️ No productId yet, skipping stock fetch");
      return;
    }
    
    setQty(1);
    
    const fetchStock = async () => {
      console.log("📦 Fetching stock for SINGLE product...");
      console.log("URL: /api1/stock/" + productId);
      try {
        const response = await fetch(`/api1/stock/${productId}`);
        const data = await response.json();
        console.log("📦 Stock response:", data);
        console.log("📦 Response OK:", response.ok);

        if (response.ok && data.stock !== undefined) {
          console.log("✅ Setting maxStock to:", parseInt(data.stock, 10));
          setMaxStock(parseInt(data.stock, 10));
        } else {
          console.error("❌ Failed to fetch stock:", data.error);
          // Set a default max stock so increment works
          setMaxStock(99);
        }
      } catch (error) {
        console.error("❌ Error fetching stock:", error);
        // Set a default max stock so increment works
        setMaxStock(99);
      }
    };

    const fetchStock1 = async () => {
      console.log("📦 Fetching stock1 for COLLECTION (color only)...");
      console.log("URL: /api1/stock1/" + productId + "," + selectedColor);
      try {
        const response = await fetch(`/api1/stock1/${productId},${selectedColor}`);
        const data = await response.json();

        console.log("📦 Stock1 response:", data);

        if (response.ok && data.qty) {
          console.log("✅ Setting maxStock to:", parseInt(data.qty, 10));
          setMaxStock(parseInt(data.qty, 10));
        } else {
          console.error("❌ Failed to fetch stock1:", data.error);
          setMaxStock(99);
        }
      } catch (error) {
        console.error("❌ Error fetching stock1:", error);
        setMaxStock(99);
      }
    };

const fetchStock2 = async () => {
  console.log("📦 Fetching stock2 for COLLECTION (color + size)...");
  console.log("URL: /api1/stock2/" + productId + "," + selectedColor + "," + selectedSize);
  try {
    const response = await fetch(`/api1/stock2/${productId},${selectedColor},${selectedSize}`);
    const data = await response.json();

    console.log("📦 Stock2 response:", data);

    if (response.ok && data.qty !== undefined) {
      console.log("✅ Setting maxStock to:", parseInt(data.qty, 10));
      setMaxStock(parseInt(data.qty, 10));
    } else {
      console.error("❌ Failed to fetch stock2:", data.error || "Unknown error");
      setMaxStock(99);
    }
  } catch (error) {
    console.error("❌ Error fetching stock2:", error);
    setMaxStock(99);
  }
};



    if (type === "collection") {
      console.log("🔍 Type is COLLECTION");
      if (productId && selectedColor && selectedSize) {
        console.log("🔍 Has productId, selectedColor, AND selectedSize -> calling fetchStock2");
        fetchStock2();
      }
      else if (productId && selectedColor) {
        console.log("🔍 Has productId and selectedColor (no size) -> calling fetchStock1");
        fetchStock1();
      } else {
        console.log("⚠️ Missing productId or selectedColor, not fetching stock");
        // Still set a default so user can increment
        setMaxStock(99);
      }

    } else if (type === "single") {
      console.log("🔍 Type is SINGLE -> calling fetchStock");
      fetchStock();
    } else {
      console.log("⚠️ Unknown type:", type, "- setting default maxStock");
      setMaxStock(99);
    }
  }, [productId, selectedColor, selectedSize, type]);


  const handleIncrement = () => {
    console.log("=== INCREMENT CLICKED ===");
    console.log("Current qty:", qty);
    console.log("maxStock:", maxStock);
    console.log("maxStock !== null:", maxStock !== null);
    console.log("qty < maxStock:", qty < maxStock);
    console.log("Condition result (maxStock !== null && qty < maxStock):", maxStock !== null && qty < maxStock);
    
    if (maxStock !== null && qty < maxStock) { // Prevent exceeding max stock
      console.log("✅ Incrementing qty from", qty, "to", qty + 1);
      setQty(qty + 1);
      onChange(qty + 1);
    } else {
      console.log("❌ Cannot increment - maxStock is null or qty >= maxStock");
      if (maxStock === null) {
        console.log("   Reason: maxStock is null (stock not fetched yet)");
      } else {
        console.log("   Reason: qty (" + qty + ") >= maxStock (" + maxStock + ")");
      }
    }
  };

  const handleDecrement = () => {
    console.log("=== DECREMENT CLICKED ===");
    console.log("Current qty:", qty);
    console.log("qty > 1:", qty > 1);
    
    if (qty > 1) {
      console.log("✅ Decrementing qty from", qty, "to", qty - 1);
      setQty(qty - 1);
      onChange(qty - 1);
    } else {
      console.log("❌ Cannot decrement - qty is already 1");
    }
  };

  return (
    <div className="quantity-selector">
      <button
        className="myNewC"
        type="button"
        onClick={handleDecrement}
        style={{ width: "20px", backgroundColor: "initial", marginRight: "5px", fontWeight: "900" }}
      >
        -
      </button>
      <input
        type="number"
        value={qty}
        readOnly
        style={{ width: "30px", color: "initial" }}
      />
      <button
        className="myNewC"
        type="button"
        onClick={handleIncrement}
        style={{ width: "20px", backgroundColor: "initial", marginLeft: "5px", fontWeight: "900" }}
        disabled={maxStock !== null && qty >= maxStock} // Disable if at max stock
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
