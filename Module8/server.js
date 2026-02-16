import express from "express";
import cors from "cors";
import Stripe from "stripe";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Put your Stripe SECRET key here (from Stripe dashboard)
// Example: sk_test_************
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Convert cart items to Stripe line_items
    const line_items = cart.map(item => ({
      quantity: item.qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100), // dollars -> cents
        product_data: {
          name: item.name + (item.variant ? ` (${item.variant})` : ""),
          images: item.image ? [item.image] : []
        }
      }
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: "http://127.0.0.1:3000/Module8/success.html",
      cancel_url: "http://127.0.0.1:3000/Module8/cancel.html"

    });

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create session" });
  }
});

app.listen(4242, () => console.log("✅ Stripe server running on http://localhost:4242"));
