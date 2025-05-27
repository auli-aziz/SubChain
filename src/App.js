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
  const [searchQuery, setSearchQuery] = useState("");

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

    const contract = new Contract(subChainAddress, SubChainABI, signer);
    setSubChain(contract);

    const totalSubs = await contract.totalSubscriptions();
    const loadedSubs = [];

    for (let i = 1; i <= totalSubs; i++) {
      const subscriptionData = await contract.getSubscription(i);
      // console.log("Raw subscription data from contract:", i, subscriptionData); // Untuk melihat struktur asli

      // Membuat objek langganan dengan properti bernama yang jelas
      // Sesuaikan indeks array (0, 1, 2, dst.) dengan urutan field di Subscription struct Anda
      // dan ABI terbaru Anda.
      const finalSubscriptionObject = {
        idFromContract: subscriptionData[0], // Ini adalah id dari kontrak (BigInt)
        name: subscriptionData[1],           // String nama
        cost: subscriptionData[2],           // BigInt cost
        months: subscriptionData[3],         // BigInt months (sesuai ABI Anda)
        maxMonths: subscriptionData[4],      // BigInt maxMonths
        date: subscriptionData[5],           // String date
        time: subscriptionData[6],           // String time
        provider: subscriptionData[7],       // String provider
        category: subscriptionData[8],       // String category
        localId: i,                          // id lokal untuk key React
      };

      // console.log(`Processed Subscription ${i}:`, finalSubscriptionObject.name, "Category:", finalSubscriptionObject.category, "Provider:", finalSubscriptionObject.provider);
      loadedSubs.push(finalSubscriptionObject);
    }
    // console.log("Structure of items in allSubscriptions (before set):", loadedSubs.length > 0 ? loadedSubs[0] : "No subs loaded");

    setAllSubscriptions(loadedSubs);
    applyFilters(loadedSubs, "All", "");

    window.ethereum.on("accountsChanged", async (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setAllSubscriptions([]);
        applyFilters([], currentCategory, searchQuery);
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

  const applyFilters = useCallback(
    (subsToFilter, category, query) => {
      let tempFiltered = subsToFilter;

      // 1. Filter berdasarkan kategori
      if (category !== "All") {
        tempFiltered = tempFiltered.filter(
          (sub) => {
            const isMatch = sub.category && sub.category.toLowerCase() === category.toLowerCase();
            console.log("Filtered Provider:", sub.provider, "Filtered Name:", sub.name);
            return isMatch;
          }
        );

        
      }

      // 2. Filter berdasarkan search query (pada hasil filter kategori)
      if (query) {
        const lowerCaseQuery = query.toLowerCase();
        console.log("Applying search for query:", lowerCaseQuery);
        tempFiltered = tempFiltered.filter(
          (sub) => {
            const nameMatch = sub.name && sub.name.toLowerCase().includes(lowerCaseQuery);
            const providerMatch = sub.provider && sub.provider.toLowerCase().includes(lowerCaseQuery);
            console.log(`Searching in: "<span class="math-inline">\{sub\.name\}" \(Provider\: "</span>{sub.provider}") for "${lowerCaseQuery}". NameMatch: ${nameMatch}, ProviderMatch: ${providerMatch}`);
            return nameMatch || providerMatch;
          }
        );
      }
      setFilteredSubscriptions(tempFiltered);
    },
    [] // Dependencies akan di-handle oleh useCallback pemanggilnya
  );

  // Fungsi untuk menangani perubahan kategori
  const handleCategoryChange = useCallback(
    (category) => {
      setCurrentCategory(category);
      applyFilters(allSubscriptions, category, searchQuery);
    },
    [allSubscriptions, searchQuery, applyFilters]
  );

  const handleSearchChange = useCallback(
    (query) => {
      setSearchQuery(query);
      applyFilters(allSubscriptions, currentCategory, query);
    },
    [allSubscriptions, currentCategory, applyFilters]
  );

  return (
    console.log("Rendering App with account:", account, "currentCategory:", currentCategory), // Debug log
    <div className="app">
      <Navigation
        account={account}
        setAccount={setAccount}
        currentCategory={currentCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
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