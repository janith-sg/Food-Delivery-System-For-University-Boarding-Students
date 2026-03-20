
import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const dummyItems = [
  {
    id: 1,
    name: "Bucket / 6PC",
    price: 3750,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Quarter / 2Pc",
    price: 1400,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Half / 4Pc",
    price: 2600,
    image: "https://via.placeholder.com/150",
  },
];

const Menu = () => {
  const { addToCart } = useContext(CartContext);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Food Menu</h2>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {dummyItems.map((item) => (
          <div
            key={item.id}
            style={{
              width: "220px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <h3>{item.name}</h3>
            <p>Rs. {item.price}</p>
            <button onClick={() => addToCart(item)}>Add to Bucket</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;