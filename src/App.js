import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, Contract, getAddress } from "ethers";

import Navigation from "./components/Navigation";
import MainPage from "./pages/MainPage";
import PurchaseHistoryPage from "./pages/PurchaseHistoryPage";
import SubChainABI from "./abis/SubChain.json";
import config from "./config.json";
import "./App.css";

function App() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [subChain, setSubChain] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const applyFilters = useCallback((subsToFilter, category, query) => {
    let tempFiltered = subsToFilter;

    if (category !== "All") {
      tempFiltered = tempFiltered.filter(
        (sub) => sub.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (query) {
      const lower = query.toLowerCase();
      tempFiltered = tempFiltered.filter(
        (sub) =>
          sub.name?.toLowerCase().includes(lower) ||
          sub.provider?.toLowerCase().includes(lower)
      );
    }

    setFilteredSubscriptions(tempFiltered);
  }, []);

  const loadBlockchainData = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
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
        alert("Unsupported network.");
        return;
      }

      const contract = new Contract(subChainAddress, SubChainABI, signer);
      setSubChain(contract);

      const totalSubs = await contract.totalSubscriptions();
      const loadedSubs = [];

      for (let i = 1; i <= totalSubs; i++) {
        const sub = await contract.getSubscription(i);
        loadedSubs.push({
          idFromContract: sub.id,
          name: sub.name,
          cost: sub.cost,
          months: sub.months,
          maxMonths: sub.maxMonths,
          date: sub.date,
          time: sub.time,
          provider: sub.provider,
          category: sub.category,
          localId: i,
        });
      }

      setAllSubscriptions(loadedSubs);
      applyFilters(loadedSubs, currentCategory, searchQuery);

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
    } catch (err) {
      console.error("Blockchain error:", err);
      alert("Blockchain data failed to load.");
    }
  }, [applyFilters]);

  useEffect(() => {
    loadBlockchainData();
    return () => {
      window.ethereum?.removeListener("accountsChanged", () => {});
    };
  }, [loadBlockchainData]);

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
    <Router>
      <Navigation
        account={account}
        setAccount={setAccount}
        currentCategory={currentCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />
      <Routes>
        <Route
          path="/"
          element={
            <MainPage
              provider={provider}
              account={account}
              subChain={subChain}
              subscriptions={filteredSubscriptions}
            />
          }
        />
        <Route
          path="/history"
          element={
            <PurchaseHistoryPage
              provider={provider}
              account={account}
              subChain={subChain}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
