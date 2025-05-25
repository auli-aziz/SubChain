// App.js
import { useEffect, useState, useCallback } from "react"; // useCallback ditambahkan
import { BrowserProvider, Contract, getAddress } from "ethers";

import Navigation from "./components/Navigation";
import Card from "./components/Card";
import SubChainABI from "./abis/SubChain.json"; // Pastikan nama file ABI benar
import config from "./config.json";
import "./App.css";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [subChain, setSubChain] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState([]); // Menyimpan semua langganan
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]); // Langganan yang sudah difilter
  const [currentCategory, setCurrentCategory] = useState("All"); // Kategori default

  // Fungsi loadBlockchainData tidak perlu di-memoize dengan useCallback karena hanya dipanggil sekali di useEffect mount
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
        alert(
          "Unsupported network. Please connect to a supported Ethereum network."
        );
        return;
      }

      const contract = new Contract(subChainAddress, SubChainABI, signer); // Menggunakan SubChainABI
      setSubChain(contract);

      const totalSubs = await contract.totalSubscriptions();
      const loadedSubs = [];

      for (let i = 1; i <= totalSubs; i++) {
        const subscription = await contract.getSubscription(i);
        console.log(`Subscription ${i}:`, subscription.name, "Category:", subscription.category); // Untuk debug
        loadedSubs.push({ ...subscription, idFromContract: subscription.id, localId: i, category: subscription.category }); // Simpan id asli dan id lokal
      }

      console.log("Structure of items in allSubscriptions (before set):", loadedSubs[0]);
      setAllSubscriptions(loadedSubs);
      setFilteredSubscriptions(loadedSubs); // Awalnya tampilkan semua

      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setAllSubscriptions([]);
          setFilteredSubscriptions([]);
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
  }, []); // Dependency array kosong, hanya jalan sekali saat mount

  // Fungsi untuk menangani perubahan kategori
  const handleCategoryChange = useCallback((category) => {
    setCurrentCategory(category);
    if (category === "All") {
      setFilteredSubscriptions(allSubscriptions);
    } else {
      const filtered = allSubscriptions.filter(
        (sub) => {
          const isMatch = sub.category && sub.category.toLowerCase() === category.toLowerCase();
          console.log(`Filtering by category: ${category}`, sub.category, "Match:", isMatch); // Debug log
          return isMatch;
        }
      );
      setFilteredSubscriptions(filtered);
    }
  }, [allSubscriptions]); // Dependency: allSubscriptions

  return (
    console.log("Rendering App with account:", account, "currentCategory:", currentCategory), // Debug log
    <div className="app">
      <Navigation
        account={account}
        setAccount={setAccount}
        currentCategory={currentCategory}
        onCategoryChange={handleCategoryChange}
      />
      <header>
        <h2 className="header__title">
          <strong>Service</strong> Subscriptions
        </h2>
      </header>
      <main className="app-main">
        {filteredSubscriptions.length > 0 ? (
          <div className="cards-grid">
            {filteredSubscriptions.map((subscription) => ( // Menggunakan filteredSubscriptions
              <Card
                key={subscription.localId} // Gunakan localId atau idFromContract yang unik
                subscription={subscription}
                id={subscription.localId} // Kirim id yang benar ke Card untuk interaksi kontrak
                tokenMaster={subChain}
                provider={provider}
                account={account}
              />
            ))}
          </div>
        ) : (
          <p className="no-subscriptions-message">
            {account
              ? currentCategory === "All"
                ? "Loading subscriptions or no subscriptions available..."
                : `No subscriptions found for category: ${currentCategory}`
              : "Please connect your wallet to see available subscriptions."}
          </p>
        )}
      </main>
    </div>
  );
}

export default App;