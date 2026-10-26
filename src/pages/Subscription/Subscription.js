
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Subscription.css";

const API = "https://apex-streaming-backend.onrender.com/api/subscriptions";

async function readApiResponse(response) {
  const text = await response.text();
  let data = {};

  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      if (text.trimStart().startsWith("<")) {
        throw new Error(
          `Received an HTML response instead of JSON from the backend. URL: ${response.url}. Please check the backend routes.`
        );
      }

      throw new Error(
        `The server returned an invalid JSON response (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (HTTP ${response.status}).`
    );
  }

  return data;
}

export default function Subscription() {
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const token = localStorage.getItem("token");

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!token) {
      setSubscription(null);
      setError("Please log in to access APEX Premium membership.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await readApiResponse(response);
      setSubscription(data.isActive ? data.subscription : null);
    } catch (err) {
      console.error("Load subscription error:", err);
      setError(err.message || "Unable to load your subscription.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const choosePlan = (plan) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setSelectedPlan(plan);
    setPaymentMethod("upi");
    setUpiId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setPaymentSuccess(false);
    setError("");
    setMessage("");
  };

  const activatePlan = async (plan) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setError("");
    setMessage("");
    setActivating(plan);

    try {
      // DEMO ONLY: No payment gateway or real transaction is used.
      const response = await fetch(`${API}/activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await readApiResponse(response);

      setSubscription(data.subscription || null);
      setMessage(
        data.message || "Demo subscription activated successfully!"
      );
      setPaymentSuccess(true);
      setSelectedPlan(null);
      setUpiId("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    } catch (err) {
      console.error("Activate subscription error:", err);
      setError(
        err.message ||
          "Demo activation failed. Please check the backend."
      );
    } finally {
      setActivating("");
    }
  };

  const resetPayment = () => {
    setSelectedPlan(null);
    setError("");
    setMessage("");
  };

  if (loading) {
    return (
      <main className="subscription-page subscription-loading">
        <div className="subscription-spinner" />
        <p>Loading APEX Premium...</p>
      </main>
    );
  }

  const planPrice = selectedPlan === "yearly" ? "1,999" : "199";

  return (
    <main className="subscription-page">
      <nav className="subscription-nav">
        <button
          className="subscription-logo"
          onClick={() => navigate("/home")}
          aria-label="APEX home"
        >
          APEX<span>.</span>
        </button>

        <button
          className="subscription-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </nav>

      <section className="subscription-hero">
        <span className="subscription-eyebrow">
          <span className="premium-dot" />
          APEX MEMBERSHIP
        </span>

        <h1>
          Entertainment at the
          <br />
          <span>next level.</span>
        </h1>

        <p>
          Unlock premium movies and discover your next favourite
          entertainment experience.
        </p>

        <div className="subscription-benefits">
          <span>✓ Premium movies</span>
          <span>✓ Membership access</span>
          <span>✓ Demo checkout</span>
        </div>
      </section>

      {error && (
        <div
          className="subscription-alert subscription-error"
          role="alert"
        >
          <span>!</span>
          <div className="alert-content">
            <p>{error}</p>
            {!token ? (
              <button onClick={() => navigate("/login")}>
                Log In
              </button>
            ) : (
              <button onClick={() => setError("")}>
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {message && !paymentSuccess && (
        <div
          className="subscription-alert subscription-success"
          role="status"
        >
          <span>✓</span>
          <p>{message}</p>
        </div>
      )}

      {subscription && (
        <section className="active-subscription">
          <div className="active-icon">✓</div>

          <div className="active-details">
            <span className="active-label">YOUR MEMBERSHIP</span>
            <h2>Premium Is Active</h2>
            <p>
              Plan:{" "}
              {subscription.plan === "yearly" ? "Yearly" : "Monthly"}
              {" · "}
              Expires:{" "}
              {subscription.endDate
                ? new Date(subscription.endDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )
                : "Not available"}
            </p>
          </div>

          <span className="active-badge">ACTIVE</span>
        </section>
      )}

      {!paymentSuccess && !selectedPlan && (
        <section className="plans-section">
          <div className="plans-heading">
            <span>CHOOSE YOUR PLAN</span>
            <h2>Select Your Plan</h2>
            <p>Demo mode — no real payment will be collected.</p>
          </div>

          <div className="subscription-plans">
            <article className="plan-card">
              <div className="plan-top">
                <span className="plan-icon">◷</span>
                <span className="plan-period">1 MONTH</span>
              </div>

              <h3>Monthly</h3>
              <p className="plan-description">
                Premium entertainment, month by month.
              </p>

              <div className="plan-price">
                <strong>₹199</strong>
                <span>/ month</span>
              </div>

              <div className="plan-divider" />

              <ul className="plan-features">
                <li>✓ Premium movie access</li>
                <li>✓ 30 days of validity</li>
                <li>✓ Active membership access</li>
              </ul>

              <button
                className="plan-button plan-button-secondary"
                disabled={Boolean(subscription) || Boolean(activating)}
                onClick={() => choosePlan("monthly")}
              >
                {subscription ? "Already Subscribed" : "Choose Monthly"}
              </button>
            </article>

            <article className="plan-card plan-card-featured">
              <div className="plan-popular">BEST VALUE</div>

              <div className="plan-top">
                <span className="plan-icon">✦</span>
                <span className="plan-period">12 MONTHS</span>
              </div>

              <h3>Yearly</h3>
              <p className="plan-description">
                One plan, a whole year of entertainment.
              </p>

              <div className="plan-price">
                <strong>₹1,999</strong>
                <span>/ year</span>
              </div>

              <p className="plan-savings">
                Save ₹389 compared to the monthly plan.
              </p>

              <div className="plan-divider" />

              <ul className="plan-features">
                <li>✓ Premium movie access</li>
                <li>✓ 365 days of validity</li>
                <li>✓ Active membership access</li>
              </ul>

              <button
                className="plan-button plan-button-primary"
                disabled={Boolean(subscription) || Boolean(activating)}
                onClick={() => choosePlan("yearly")}
              >
                {subscription ? "Already Subscribed" : "Choose Yearly"}
              </button>
            </article>
          </div>

          <p className="subscription-disclaimer">
            Demo subscription only. No real payment is collected.
          </p>
        </section>
      )}

      {selectedPlan && !paymentSuccess && (
        <section className="checkout-section">
          <button className="checkout-back" onClick={resetPayment}>
            ← Back to Plans
          </button>

          <div className="demo-payment">
            <div className="payment-heading">
              <span>APEX CHECKOUT</span>
              <h2>Complete Your Payment</h2>
              <p>
                {selectedPlan === "yearly" ? "Yearly Plan" : "Monthly Plan"}
              </p>
            </div>

            <div className="checkout-total">
              <span>Total Payable</span>
              <strong>₹{planPrice}</strong>
            </div>

            <div className="demo-notice">
              DEMO MODE · No real money will be charged.
            </div>

            <h3 className="payment-method-title">
              Choose a Payment Method
            </h3>

            <div className="payment-methods">
              <button
                type="button"
                className={paymentMethod === "upi" ? "method active" : "method"}
                onClick={() => setPaymentMethod("upi")}
              >
                <span>▣</span>
                UPI
              </button>

              <button
                type="button"
                className={paymentMethod === "card" ? "method active" : "method"}
                onClick={() => setPaymentMethod("card")}
              >
                <span>▤</span>
                Card
              </button>
            </div>

            {paymentMethod === "upi" ? (
              <div className="payment-fields">
                <label htmlFor="demo-upi">UPI ID</label>
                <input
                  id="demo-upi"
                  type="text"
                  placeholder="demo@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  autoComplete="off"
                />
                <small>
                  Demo input only. No UPI app will be opened.
                </small>
              </div>
            ) : (
              <div className="payment-fields">
                <label htmlFor="demo-card">Card Number</label>
                <input
                  id="demo-card"
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(.{4})/g, "$1 ")
                        .trim()
                    )
                  }
                  autoComplete="off"
                />

                <div className="payment-card-row">
                  <div>
                    <label htmlFor="demo-expiry">Expiry Date</label>
                    <input
                      id="demo-expiry"
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => {
                        let value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);

                        if (value.length > 2) {
                          value =
                            value.slice(0, 2) + "/" + value.slice(2);
                        }

                        setCardExpiry(value);
                      }}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label htmlFor="demo-cvv">CVV</label>
                    <input
                      id="demo-cvv"
                      type="password"
                      inputMode="numeric"
                      placeholder="123"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(
                          e.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      autoComplete="off"
                    />
                  </div>
                </div>

                <small>
                  Use dummy details only. Do not enter real card details.
                </small>
              </div>
            )}

            <button
              type="button"
              className="demo-pay-button"
              disabled={Boolean(activating)}
              onClick={() => {
                setError("");

                if (paymentMethod === "upi" && !upiId.trim()) {
                  setError("Please enter a demo UPI ID.");
                  return;
                }

                if (
                  paymentMethod === "card" &&
                  (
                    cardNumber.replace(/\D/g, "").length < 12 ||
                    !/^\d{2}\/\d{2}$/.test(cardExpiry) ||
                    cardCvv.length < 3
                  )
                ) {
                  setError(
                    "Please enter a demo card number, expiry date, and CVV."
                  );
                  return;
                }

                activatePlan(selectedPlan);
              }}
            >
              {activating
                ? "Processing Demo Payment..."
                : `Pay ₹${planPrice} Now`}
            </button>

            <p className="payment-footnote">
              🔒 Demo checkout · No real payment is processed
            </p>
          </div>
        </section>
      )}

      {paymentSuccess && (
        <section className="checkout-section">
          <div className="demo-payment payment-success-screen">
            <div className="payment-success-icon">✓</div>
            <span className="success-overline">TRANSACTION COMPLETE</span>
            <h2>Payment Successful!</h2>
            <p>Your APEX Premium membership is now active.</p>

            <div className="demo-notice">
              Demo transaction only. No money was charged.
            </div>

            <button
              type="button"
              className="demo-pay-button"
              onClick={() => navigate("/home")}
            >
              Start Watching
            </button>

            <button
              type="button"
              className="payment-cancel"
              onClick={() => {
                setPaymentSuccess(false);
                setMessage("");
              }}
            >
              Back to Membership
            </button>
          </div>
        </section>
      )}

      <footer className="subscription-footer">
        <span>
          APEX<span className="footer-dot">.</span>
        </span>
        <p>Your next favourite story awaits.</p>
      </footer>
    </main>
  );
}
