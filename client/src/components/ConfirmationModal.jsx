import "./ConfirmationModal.css";

export default function ConfirmationModal({ onConfirm, onCancel, message }) {
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <p className="body-m">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-text btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-text btn-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
