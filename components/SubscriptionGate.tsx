interface SubscriptionGateProps {
  isSubscribed: boolean;
}

export default function SubscriptionGate({ isSubscribed }: SubscriptionGateProps) {
  if (isSubscribed) return null;

  return (
    <div className="subscription-inline">
      <p>You’ve reached today’s free limit.</p>

      <div className="pricing-inline">
        <strong>₹199 / month</strong>
        <button className="btn btn-primary">
          Unlock unlimited structure
        </button>
      </div>

      <div className="one-time-pass">
        <strong>₹99 one-time pass</strong>
        <button className="btn btn-primary">
          Buy one-time pass
      </button>
     </div>
    </div>
  );
}
