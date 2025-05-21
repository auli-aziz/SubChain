import { getAddress } from "ethers";
import "./Navigation.css";

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = getAddress(accounts[0]);
      setAccount(account);
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  return (
    <nav className="nav">
      <div className="nav__brand">
        <h1 className="nav__logo">SubChain</h1>

        <input
          className="nav__search"
          type="text"
          placeholder="Search experiences, events..."
          aria-label="Search"
        />

        <ul className="nav__links">
          <li>
            <a href="/" className="nav__link">
              Concerts
            </a>
          </li>
          <li>
            <a href="/" className="nav__link">
              Sports
            </a>
          </li>
          <li>
            <a href="/" className="nav__link">
              Arts & Theater
            </a>
          </li>
          <li>
            <a href="/" className="nav__link">
              More
            </a>
          </li>
        </ul>
      </div>

      {account ? (
        <button type="button" className="nav__button nav__button--connected">
          {account.slice(0, 6) + "..." + account.slice(-4)}
        </button>
      ) : (
        <button
          type="button"
          className="nav__button"
          onClick={connectHandler}
          aria-label="Connect Wallet"
        >
          Connect Wallet
        </button>
      )}
    </nav>
  );
};

export default Navigation;
