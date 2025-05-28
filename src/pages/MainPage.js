import Card from "../components/Card";

export default function MainPage({ provider, account, subChain, subscriptions }) {
  return (
    <div className="app">
      <header>
        <h2 className="header__title">
          <strong>Service</strong> Subscriptions
        </h2>
      </header>
      <main className="app-main">
        {subscriptions.length > 0 ? (
          <div className="cards-grid">
            {subscriptions.map((subscription) => (
              <Card
                key={subscription.localId}
                subscription={subscription}
                id={subscription.localId}
                subChain={subChain}
                provider={provider}
                account={account}
              />
            ))}
          </div>
        ) : (
          <p className="no-subscriptions-message">
            {account
              ? "Loading subscriptions or no subscriptions available..."
              : "Please connect your wallet to see available subscriptions."}
          </p>
        )}
      </main>
    </div>
  );
}
