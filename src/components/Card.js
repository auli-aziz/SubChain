// Card.js
import { formatUnits } from "ethers";
import React, { useState, useEffect, useCallback } from "react";
import "./Card.css";

const Card = ({
  subscription = {}, 
  subChain,
  id, // Ini adalah localId yang Anda kirim dari App.js
  account,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!subChain || !account || !id) return; // 'id' di sini adalah localId dari App.js
                                               // yang seharusnya cocok dengan id langganan di kontrak

    try {
      const subscribed = await subChain.hasBought(id, account);
      setAlreadySubscribed(subscribed);

      if (subscribed) {
        localStorage.setItem(`subscribed-${id}-${account}`, "true");
      } else {
        localStorage.removeItem(`subscribed-${id}-${account}`);
      }
    } catch (err) {
      const local = localStorage.getItem(`subscribed-${id}-${account}`);
      setAlreadySubscribed(local === "true");
    }
  }, [subChain, account, id]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const monthsToSubscribe = 1; // Atau ambil dari input pengguna jika ada
      
      // Menggunakan properti bernama dari objek subscription
      const costPerMonthWei = subscription.cost?.toString?.() || "0";
      const totalCost = BigInt(costPerMonthWei) * BigInt(monthsToSubscribe);

      // 'id' di sini haruslah id yang dikenali oleh smart contract
      const tx = await subChain.mint(id, monthsToSubscribe, {
        from: account,
        value: totalCost.toString(),
      });

      await tx.wait();
      alert("Subscription successful!");

      setAlreadySubscribed(true);
      localStorage.setItem(`subscribed-${id}-${account}`, "true");
    } catch (err) {
      console.error("Subscription failed:", err);
      alert("Subscription failed: " + (err?.reason || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  // Menggunakan properti bernama dari objek subscription
  const costInEther = formatUnits(subscription.cost?.toString?.() || "0", "ether");
  const serviceName = subscription.name || "Subscription Name";
  const serviceProvider = subscription.provider || ""; // Sebelumnya subscription[7]
  const serviceDate = subscription.date || "";       // Sebelumnya subscription[5]
  const serviceTime = subscription.time || "";       // Sebelumnya subscription[6]
  // const serviceCategory = subscription.category || ""; // Jika Anda ingin menampilkannya di Card

  return (
    <div className="card">
      <div className="card__info">
        <p className="card__date">
          <strong>{serviceDate}</strong>
          {serviceDate && serviceTime && <br />} {/* Tampilkan <br /> hanya jika keduanya ada */}
          {serviceTime}
        </p>

        <h3 className="card__name">{serviceName}</h3>

        {/* Menampilkan provider (sebelumnya card__location) */}
        {serviceProvider && (
          <p className="card__location"> {/* Tetap gunakan class card__location jika stylingnya sesuai */}
            <small>{serviceProvider}</small>
          </p>
        )}
        
        {/* Jika Anda ingin menampilkan kategori di kartu: */}
        {/* {serviceCategory && (
          <p className="card__category">
            <small>Category: {serviceCategory}</small>
          </p>
        )} */}

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
            disabled={isProcessing || !account} // Tambahkan !account untuk disable jika wallet tidak konek
          >
            {isProcessing ? "Processing..." : "Subscribe"}
          </button>
        )}
      </div>
      {/* <hr />  Bisa dihilangkan jika tidak terlalu penting secara visual */}
    </div>
  );
};

export default Card;