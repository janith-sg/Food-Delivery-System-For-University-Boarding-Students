const Stripe = require("stripe");

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !String(key).trim()) return null;
  return new Stripe(key);
}

const createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({
        message: "Payment is not configured. Set STRIPE_SECRET_KEY in backend/.env.",
      });
    }

    const { amountLKR } = req.body;

    if (!amountLKR || amountLKR <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // Demo conversion rate for project/testing
    const USD_RATE = 300; // 1 USD = 300 LKR
    const amountUSD = amountLKR / USD_RATE;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amountUSD * 100), // cents
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create payment intent",
      error: error.message,
    });
  }
};

module.exports = { createPaymentIntent };