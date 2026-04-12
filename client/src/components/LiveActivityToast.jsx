import { useEffect, useState } from "react";

const activityFeed = [
  "Ashish ordered the combo of 3 from Ahmedabad",
  "Popular in your area: ride-on scooters",
  "Recently ordered: RC combo from Surat",
  "Fast-moving this week: stunt car picks",
  "Most picked combo right now",
  "Viewed by shoppers looking for gift toys",
];

export const LiveActivityToast = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIndex((current) => (current + 1) % activityFeed.length);
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="live-activity-toast" aria-live="polite">
      <span className="live-dot" aria-hidden="true" />
      <p>{activityFeed[index]}</p>
    </div>
  );
};
