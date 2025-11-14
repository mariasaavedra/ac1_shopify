import { QuantitySelectorComponent } from '@theme/component-quantity-selector';

/**
 * A custom element that allows the user to select a quantity in the cart.
 * Extends QuantitySelectorComponent but uses absolute max limits instead of effective max.
 * Semantics: "What should the total quantity BE in the cart" vs "How many to ADD to cart"
 *
 * @extends {QuantitySelectorComponent}
 */
class CartQuantitySelectorComponent extends QuantitySelectorComponent {
  /**
   * Gets the effective maximum value for cart quantity selector
   * Cart page: uses absolute max (how much can be in cart total)
   * @returns {number | null} The effective max, or null if no max
   */
  getEffectiveMax() {
    const { max } = this.getCurrentValues();
    return max; // Cart uses absolute max, not max minus cart quantity
  }

  /**
   * Updates button states based on current value and limits
   * Cart buttons are always managed client-side, never server-disabled
   * In cart: allow minus button down to 0 (clicking at 1 will remove item)
   */
  updateButtonStates() {
    const { minusButton, plusButton } = this.refs;
    const { value } = this.getCurrentValues();
    const effectiveMax = this.getEffectiveMax();

    // Cart buttons are always dynamically managed
    // Allow minus button down to 0 (disabled only at 0)
    minusButton.disabled = value <= 0;
    plusButton.disabled = effectiveMax !== null && value >= effectiveMax;
  }

  /**
   * Handles the quantity decrease event.
   * Overrides parent to allow quantity to reach 0 (which triggers item removal)
   * @param {Event} event - The event.
   */
  decreaseQuantity(event) {
    if (!(event.target instanceof HTMLElement)) return;
    event.preventDefault();

    const { quantityInput } = this.refs;
    const { step, value } = this.getCurrentValues();
    const effectiveMax = this.getEffectiveMax();

    // Allow going to 0 in cart (triggers removal in cart-items-component)
    const newValue = Math.min(
      effectiveMax ?? Infinity,
      Math.max(0, value + step * -1)
    );

    quantityInput.value = newValue.toString();
    this.onQuantityChange();
    this.updateButtonStates();
  }
}

if (!customElements.get('cart-quantity-selector-component')) {
  customElements.define('cart-quantity-selector-component', CartQuantitySelectorComponent);
}
