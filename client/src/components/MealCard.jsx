import "./MealCard.css";

export default function MealCard({
  id,
  time,
  name,
  image,
  protein,
  carbs,
  fat,
  done,
  onMealDone,
}) {
  const backgroundStyle = {
    background: `linear-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 50%), linear-gradient(45deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 50%),
        url(data:image/png;base64,${image})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  return (
    <>
      <li className="meal-card" style={backgroundStyle}>
        <div className="meal-header">
          <div className="meal-info">
            <p className="body-s">{time}</p>
            <p className="body-s">{name}</p>
          </div>
          <button className="add-btn" onClick={() => onMealDone(id)}>
            {done ? (
              <img src="../icons/check.svg" />
            ) : (
              <img src="../icons/plus.svg" />
            )}
          </button>
        </div>
        <div className="meal-footer">
          <p className="body-s">{protein} g protein</p>
          <p className="body-s">{carbs} g carbs</p>
          <p className="body-s">{fat} g fat</p>
        </div>
      </li>
    </>
  );
}
