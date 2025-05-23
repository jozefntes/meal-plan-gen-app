import { useEffect, useState } from "react";

import "./EnergySummary.css";

export default function EnergySummary({ progress, userData }) {
  const [consumed, setConsumed] = useState(0);
  const [remaining, setRemaining] = useState(0);

  const [consumedPieStyle, setConsumedPieStyle] = useState({});
  const [remainingPieStyle, setRemainingPieStyle] = useState({});

  useEffect(() => {
    const targetEnergy = userData?.targets?.energy ?? 0;
    const newConsumed = progress?.energy?.current ?? 0;
  
    setConsumed(newConsumed);
    setRemaining(targetEnergy - newConsumed);
  
    if (progress && targetEnergy > 0) {
      const fatCals = (progress?.fat?.current ?? 0) * 9;
      const carbCals = (progress?.carbs?.current ?? 0) * 4;
  
      const fatPercent =
        newConsumed > 0 ? Math.floor((fatCals / newConsumed) * 100) : 0;
      const carbsPercent =
        newConsumed > 0 ? Math.floor((carbCals / newConsumed) * 100) : 0;
      const remainingPercent =
        targetEnergy > 0
          ? 100 - Math.floor((newConsumed / targetEnergy) * 100)
          : 0;
  
      setConsumedPieStyle({
        background: newConsumed > 0
          ? `conic-gradient(var(--fat) 0% ${fatPercent}%, var(--carbs) ${fatPercent}% ${
              carbsPercent + fatPercent
            }%, var(--protein) ${carbsPercent + fatPercent}% 100%)`
          : `conic-gradient(var(--gray-100) 0% 100%)`,
      });
  
      setRemainingPieStyle({
        background: `conic-gradient(var(--gray-100) 0% ${remainingPercent}%, var(--gray-400) ${remainingPercent}% 100%)`,
      });
    } else {
      setConsumedPieStyle({
        background: `conic-gradient(var(--gray-100) 0% 100%)`,
      });
      setRemainingPieStyle({
        background: `conic-gradient(var(--gray-100) 0% 100%)`,
      });
      setConsumed(0);
      setRemaining(0);
    }
  }, [progress, userData]);

  return (
    <div className="energy-smry">
      <h6>Energy Summary</h6>
      <div className="charts">
        <div className="pie-chart-container">
          <div
            className="pie-chart consumed"
            style={Object.keys(consumedPieStyle).length ? consumedPieStyle : {}}
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
            style={
              Object.keys(remainingPieStyle).length ? remainingPieStyle : {}
            }
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
