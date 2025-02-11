import "./MealCard.css";

export default function MealCard({
  time,
  name,
  imageURL,
  protein,
  carbs,
  fat,
}) {
  const backgroundStyle = {
    background: `linear-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 50%), linear-gradient(45deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 50%),
        url(${imageURL})`,
    backgroundPosition: `center`,
    backgroundRepeat: `no-repeat`,
    backgroundSize: `cover`,
  };

  return (
    <>
      <li className="meal-item" style={backgroundStyle}>
        <div className="meal-header">
          <img src="../icons/check.svg" />
          <div className="meal-info">
            <p className="body-s">{time}</p>
            <p className="body-s">{name}</p>
          </div>
          <img src="../icons/heart.svg" />
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
