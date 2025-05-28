import { useEffect, useState } from "react";
import Card from "../components/Card";
import "./PurchaseHistoryPage.css";

function PurchaseHistoryPage({ account, subChain, provider }) {
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
  });
  const [isEditing, setIsEditing] = useState(false);

  const loadUserSubscriptions = async () => {
    if (!account || !subChain) {
      setError("Please connect your wallet to view your subscriptions");
      setUserSubscriptions([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const totalSubs = await subChain.totalSubscriptions();
      const userSubs = [];

      for (let i = 1; i <= totalSubs; i++) {
        try {
          const sub = await subChain.getSubscription(i);
          const hasBought = await subChain.hasBought(i, account);
          
          if (hasBought) {
            userSubs.push({
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
        } catch (subErr) {
          console.error(`Error loading subscription ${i}:`, subErr);
          // Continue with next subscription instead of failing completely
          continue;
        }
      }

      setUserSubscriptions(userSubs);
    } catch (err) {
      console.error("Error loading user subscriptions:", err);
      setError("Failed to load subscriptions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserSubscriptions();
  }, [account, subChain]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProfile = {
      name: formData.get('name'),
      email: formData.get('email'),
    };
    setUserProfile(newProfile);
    localStorage.setItem('userName', newProfile.name);
    localStorage.setItem('userEmail', newProfile.email);
    setIsEditing(false);
  };

  if (!account) {
    return (
      <div className="app-main">
        <h2 className="header__title">
          <strong>Your</strong> Subscriptions
        </h2>
        <div className="no-wallet-message">
          <p>Please connect your wallet to view your subscription history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-main">
      <h2 className="header__title">
        <strong>Your</strong> Subscriptions
      </h2>
      
      <div className="user-profile-section">
        <h3>Your Profile</h3>
        {isEditing ? (
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={userProfile.name}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={userProfile.email}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-button">Save</button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <p><strong>Wallet Address:</strong> {account}</p>
            <p><strong>Name:</strong> {userProfile.name || 'Not set'}</p>
            <p><strong>Email:</strong> {userProfile.email || 'Not set'}</p>
            <button
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-message">
          <p>Loading your subscriptions...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={loadUserSubscriptions}
          >
            Retry
          </button>
        </div>
      ) : userSubscriptions.length > 0 ? (
        <div className="cards-grid">
          {userSubscriptions.map((sub) => (
            <Card
              key={sub.localId}
              subscription={sub}
              id={sub.localId}
              subChain={subChain}
              provider={provider}
              account={account}
            />
          ))}
        </div>
      ) : (
        <div className="no-subscriptions-message">
          <p>You have no active subscriptions.</p>
        </div>
      )}
    </div>
  );
}

export default PurchaseHistoryPage;
