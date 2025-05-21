import { useEffect, useState } from "react";
import { getAddress } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Sort from "./components/Sort";
import Card from "./components/Card";
import SeatChart from "./components/SeatChart";

// ABIs
import SubChain from "./abis/SubChain.json";

// Config
import config from "./config.json";

function App() {
  const [account, setAccount] = useState(null);

  const loadBlockchainData = async () => {
    try {
      window.ethereum.on("accountsChanged", async () => {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const address = getAddress(accounts[0]);
        setAccount(address);
      });
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />
        <h2 className="header__title"><strong>Service</strong> Subscriptions</h2>
      </header>
      <h1>Hello World</h1>
      <p>{account}</p>
    </div>
  );
}

export default App;
