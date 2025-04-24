import "./TargetSummary.css";

export default function TargetSummary({ progress, userData }) {
  const targetNames = ["energy", "protein", "carbs", "fat"];
  const targetUnits = ["kcal", "g", "g", "g"];

  return (
    <div className="targets-smry">
      <h6>Targets</h6>
      {targetNames.map((name, index) => (
        <div className="target" key={name}>
          <p className="body-s">{name}</p>
          <div className="progress-container">
            <div className="progress-info">
              <p className="body-s">
                {progress?.[name]?.current ?? 0} /{" "}
                {userData?.targets?.[name] ?? 0} {targetUnits[index]}
              </p>
              <p className="body-s">{progress?.[name]?.percentage ?? 0}%</p>
            </div>
            <div className="progress-bar">
              <div
                className={`progress ${name}`}
                style={{
                  width: `${Math.min(progress?.[name]?.percentage ?? 0, 98)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
