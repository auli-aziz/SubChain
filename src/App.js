import { useEffect, useState } from "react";
import { BrowserProvider, Contract, getAddress } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Card from "./components/Card";

// ABIs
import SubChain from "./abis/SubChain.json";

// Config
import config from "./config.json";

import "./App.css";


function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [subChain, setSubChain] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isToggle, setIsToggle] = useState(false);

  const loadBlockchainData = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this app.");
      return;
    }

    try {
      const _provider = new BrowserProvider(window.ethereum);
      setProvider(_provider);

      const signer = await _provider.getSigner();
      const userAddress = getAddress(await signer.getAddress());
      setAccount(userAddress);

      const network = await _provider.getNetwork();
      const subChainAddress = config[network.chainId]?.SubChain?.address;

      if (!subChainAddress) {
        alert("Unsupported network. Please connect to a supported Ethereum network.");
        return;
      }

      const contract = new Contract(subChainAddress, SubChain, signer);
      setSubChain(contract);

      const totalSubs = await contract.totalSubscriptions();
      const loadedSubs = [];

      for (let i = 1; i <= totalSubs; i++) {
        const subscription = await contract.getSubscription(i);
        loadedSubs.push(subscription);
      }

      setSubscriptions(loadedSubs);

      // Listen for account changes
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setSubscriptions([]);
          setSubChain(null);
        } else {
          const newAccount = getAddress(accounts[0]);
          setAccount(newAccount);
        }
      });

    } catch (error) {
      console.error("Error loading blockchain data:", error);
      alert("Failed to load blockchain data. Check console for details.");
    }
  };

  useEffect(() => {
    loadBlockchainData();

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  return (
    <div className="app dark">
      <Navigation account={account} setAccount={setAccount} />

      <header className="app-header">
        <h2 className="header__title">
          <strong>Service</strong> Subscriptions
        </h2>
      </header>

      <main className="app-main">
        {subscriptions.length > 0 ? (
          <div className="cards-grid">
            {subscriptions.map((subscription, idx) => (
              <Card
                key={subscription.id || idx}
                subscription={subscription}
                id={idx + 1}
                tokenMaster={subChain}
                provider={provider}
                account={account}
                toggle={isToggle}
                setToggle={setIsToggle}
                setSubscription={setSelectedSubscription}
              />
            ))}
          </div>
        ) : (
          <p className="no-subscriptions-message">
            {account
              ? "Loading subscriptions..."
              : "Please connect your wallet to see available subscriptions."}
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
