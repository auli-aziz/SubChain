import { getAddress } from "ethers";
import "./Navigation.css";

const categories = ["All", "Design", "Cloud Service", "Entertainment", "Other"];

const Navigation = ({ account, setAccount, currentCategory, onCategoryChange, searchQuery, onSearchChange }) => {
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
      </div>
      <div className="nav__categories">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`nav__category-button ${currentCategory === category ? "active" : ""}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="nav__right-controls"> {/* Wrapper untuk search dan connect button */}
        <input
          className="nav__search"
          type="text"
          placeholder="Search by name or provider..." // Placeholder diperjelas
          aria-label="Search"
          value={searchQuery} // <-- Hubungkan dengan state
          onChange={(e) => onSearchChange(e.target.value)} // <-- Panggil fungsi saat berubah
        />
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
      </div>
    </nav>
  );
};

export default Navigation;
