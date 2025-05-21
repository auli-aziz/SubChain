import { formatUnits } from "ethers";
import React, { useState, useEffect, useCallback } from "react";  // pakai useCallback
import "./Card.css";

const Card = ({
  subscription = [],
  toggle,
  setToggle,
  setSubscription,
  tokenMaster,
  id,
  account,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  // Fungsi cek status subscribe dari blockchain & localStorage, pakai useCallback
  const checkSubscriptionStatus = useCallback(async () => {
    if (!tokenMaster || !account || !id) return;

    try {
      const subscribed = await tokenMaster.isSubscribed(id, account);
      setAlreadySubscribed(subscribed);

      if (subscribed) {
        localStorage.setItem(`subscribed-${id}-${account}`, "true");
      } else {
        localStorage.removeItem(`subscribed-${id}-${account}`);
      }
    } catch (err) {
      // fallback cek dari localStorage jika error panggil kontrak
      const local = localStorage.getItem(`subscribed-${id}-${account}`);
      setAlreadySubscribed(local === "true");
    }
  }, [tokenMaster, account, id]);

  // Panggil cek status saat komponen mount / tokenMaster / account / id berubah
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // Saat subscribe berhasil
  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const monthsToSubscribe = 1;
      const costPerMonthWei = subscription[2]?.toString?.() || "0";
      const totalCost = BigInt(costPerMonthWei) * BigInt(monthsToSubscribe);

      const tx = await tokenMaster.mint(id, monthsToSubscribe, {
        from: account,
        value: totalCost.toString(),
      });

      await tx.wait();
      alert("Subscription successful!");

      // Update status langsung setelah sukses
      setAlreadySubscribed(true);
      localStorage.setItem(`subscribed-${id}-${account}`, "true");
    } catch (err) {
      console.error("Subscription failed:", err);
      alert("Subscription failed: " + (err?.reason || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  const costInEther = formatUnits(subscription[2]?.toString?.() || "0", "ether");

  return (
    <div className="card">
      <div className="card__info">
        <p className="card__date">
          <strong>{subscription[5] || ""}</strong>
          <br />
          {subscription[6] || ""}
        </p>

        <h3 className="card__name">{subscription[1] || "Subscription Name"}</h3>

        <p className="card__location">
          <small>{subscription[7] || ""}</small>
        </p>

        <p className="card__cost">
          <strong>{costInEther}</strong> ETH
        </p>

        {alreadySubscribed ? (
          <button type="button" className="card__button--out" disabled>
            Purchased
          </button>
        ) : (
          <button
            type="button"
            className="card__button"
            onClick={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Subscribe"}
          </button>
        )}
      </div>
      <hr />
    </div>
  );
};

export default Card;
