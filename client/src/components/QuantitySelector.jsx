export const QuantitySelector = ({ quantity, min = 1, onChange }) => (
  <div className="quantity-selector">
    <button type="button" onClick={() => onChange(Math.max(min, quantity - 1))}>
      -
    </button>
    <span>{quantity}</span>
    <button type="button" onClick={() => onChange(quantity + 1)}>
      +
    </button>
  </div>
);
