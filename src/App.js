import { useEffect, useState } from "react";
import { ethers } from "ethers";

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
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <h1>Hello World</h1>
      {account}
    </div>
  );
}

export default App;
