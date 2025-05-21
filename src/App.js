import { useEffect, useState } from "react";
import { BrowserProvider, Contract, getAddress } from "ethers";

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
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [subChain, setSubChain] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  const [subscription, setSubscription] = useState({})
  const [toggle, setToggle] = useState(false)


  const loadBlockchainData = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      setProvider(provider);

      const signer = await provider.getSigner();
      const userAddress = getAddress(await signer.getAddress());
      setAccount(userAddress);

      const network = await provider.getNetwork();
      const address = config[network.chainId].SubChain.address;

      const subChain = new Contract(address, SubChain, signer);
      setSubChain(subChain);

      const totalSubscriptions = await subChain.totalSubscriptions();
      const subscriptions = [];

      for(var i = 1; i <= totalSubscriptions; i++) {
        const subscription = await subChain.getSubscription(i);
        subscriptions.push(subscription);
      }

      setSubscriptions(subscriptions)

      console.log(subscriptions);

      console.log("Contract Address:", subChain.target);

      window.ethereum.on("accountsChanged", async () => {
        const newSigner = await provider.getSigner();
        const newAddress = getAddress(await newSigner.getAddress());
        setAccount(newAddress);
      });
    } catch (error) {
      console.log("Error loading blockchain data:", error.message);
    }
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <header>
        <Navigation account={account} setAccount={setAccount} />
        <h2 className="header__title">
          <strong>Service</strong> Subscriptions
        </h2>
      </header>
      <div className="cards">
        {subscriptions.map((subscription, index) => (
          <Card
            subscription={subscription}
            id={index + 1}
            tokenMaster={subChain}
            provider={provider}
            account={account}
            toggle={toggle}
            setToggle={setToggle}
            setSubscription={setSubscription}
            key={subscription.name}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
