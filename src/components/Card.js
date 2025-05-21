import { formatUnits } from "ethers";

const Card = ({
  subscription,
  toggle,
  setToggle,
  setSubscription,
  tokenMaster,
  id,
  account,
}) => {
  const handleSubscribe = async () => {
    try {
      const months = 1; // bisa disesuaikan jika kamu ingin menerima input dari user
      const costPerMonth = subscription[2].toString(); // cost dalam wei
      const totalCost = BigInt(costPerMonth) * BigInt(months);

      const tx = await tokenMaster.mint(id, months, {
        from: account,
        value: totalCost.toString(),
      });

      await tx.wait();
      alert("Subscription successful!");
    } catch (err) {
      console.error("Subscription failed:", err);
      alert("Subscription failed: " + (err?.reason || err.message));
    }
  };

  const togglePop = () => {
    setSubscription(subscription);
    setToggle(!toggle);
  };

  return (
    <div className="card">
      <div className="card__info">
        <p className="card__date">
          <strong>{subscription[5]}</strong>
          <br />
          {subscription[6]}
        </p>

        <h3 className="card__name">{subscription[1]}</h3>

        <p className="card__location">
          <small>{subscription[7]}</small>
        </p>

        <p className="card__cost">
          <strong>{formatUnits(subscription[2].toString(), "ether")}</strong>{" "}
          ETH
        </p>

        {subscription[3].toString() === "0" ? (
          <button type="button" className="card__button--out" disabled>
            Purchased
          </button>
        ) : (
          <button
            type="button"
            className="card__button"
            onClick={handleSubscribe}
          >
            Subscribe
          </button>
        )}
      </div>
      <hr />
    </div>
  );
};

export default Card;
