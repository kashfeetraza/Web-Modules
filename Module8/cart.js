// cart.js — localStorage cart for static websites

const CART_KEY = "blossom_cart_v1";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart:updated"));
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

export function addToCart(product, qty = 1, variant = "") {
  const cart = getCart();

  const key = `${product.id}__${variant || ""}`;
  const existing = cart.find(i => `${i.id}__${i.variant || ""}` === key);

  const safeQty = Math.max(1, Number(qty) || 1);

  if (existing) {
    existing.qty += safeQty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || "",
      variant: variant || "",
      qty: safeQty
    });
  }

  saveCart(cart);
}

export function updateQty(id, variant, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && (i.variant || "") === (variant || ""));
  if (!item) return;

  item.qty = Math.max(1, Number(qty) || 1);
  saveCart(cart);
}

export function removeItem(id, variant) {
  const cart = getCart().filter(i => !(i.id === id && (i.variant || "") === (variant || "")));
  saveCart(cart);
}

export function clearCart() {
  saveCart([]);
}

export function cartTotal() {
  return getCart().reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
}

export function money(n) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(n) || 0);
}

// Put <span data-cart-count>0</span> anywhere to show cart count
export function bindCartCount() {
  const update = () => {
    const count = getCartCount();
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      el.textContent = String(count);
    });
  };

  update();
  window.addEventListener("cart:updated", update);
  window.addEventListener("storage", update);
}
