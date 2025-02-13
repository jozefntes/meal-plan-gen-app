import { useEffect, useState } from "react";

import "./EnergySummary.css";

export default function EnergySummary({ progress, userData }) {
  const [consumed, setConsumed] = useState(0);
  const [remaining, setRemaining] = useState(userData.targets[0].total);

  const [consumedPieStyle, setConsumedPieStyle] = useState({});

  const [remainingPieStyle, setRemainingPieStyle] = useState({});

  useEffect(() => {
    if (progress) {
      const newConsumed = progress[0].current;
      setConsumed(newConsumed);
      setRemaining(userData.targets[0].total - newConsumed);

      const fatCals = progress[3].current * 9;
      const carbCals = progress[2].current * 4;

      const fatPercent = Math.floor((fatCals / newConsumed) * 100);
      const carbsPercent = Math.floor((carbCals / newConsumed) * 100);

      const remainingPercent =
        100 - Math.floor((newConsumed / userData.targets[0].total) * 100);

      setConsumedPieStyle({
        background: `conic-gradient(var(--fat) 0% ${fatPercent}%, var(--carbs) ${fatPercent}% ${
          carbsPercent + fatPercent
        }%, var(--protein) ${carbsPercent + fatPercent}% 100%)`,
      });

      setRemainingPieStyle({
        background: `conic-gradient(var(--gray-100) 0% ${remainingPercent}%, var(--gray-400) ${remainingPercent}% 100%)`,
      });
    } else {
      setConsumed(0);
      setRemaining(userData.targets[0].total);
    }
  }, [progress, userData]);

  return (
    <div className="energy-smry">
      <h6>Energy Summary</h6>
      <div className="charts">
        <div className="pie-chart-container">
          <div
            className="pie-chart consumed"
            style={progress ? consumedPieStyle : {}}
          ></div>
          <div className="pie-chart-text">
            <p className="btn-text">
              {Math.floor(consumed)} <span>kcal</span>
            </p>
          </div>
          <p className="body-m">Consumed</p>
        </div>
        <div className="pie-chart-container">
          <div
            className="pie-chart remaining"
            style={progress ? remainingPieStyle : {}}
          ></div>
          <div className="pie-chart-text">
            <p className="btn-text">
              {Math.floor(remaining)} <span>kcal</span>
            </p>
          </div>
          <p className="body-m">Remaining</p>
        </div>
      </div>
    </div>
  );
}
