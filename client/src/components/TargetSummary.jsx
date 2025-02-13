import "./TargetSummary.css";

export default function TargetSummary({ progress, userData }) {
  return (
    <div className="targets-smry">
      <h6>Targets</h6>
      {userData.targets.map((target, index) => (
        <div className="target" key={index}>
          <p className="body-s">{target.name}</p>
          <div className="progress-container">
            <div className="progress-info">
              <p className="body-s">
                {progress ? progress[index].current : 0} / {target.total}{" "}
                {target.unit}
              </p>
              <p className="body-s">
                {progress ? progress[index].percentage : 0}%
              </p>
            </div>
            <div className="progress-bar">
              <div
                className={`progress ${target.className}`}
                style={{
                  width: `${progress ? progress[index].percentage : 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
