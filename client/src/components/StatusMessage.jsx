function StatusMessage({ tone = "info", message, floating = false, onClose }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`status-message status-message--${tone} ${floating ? "status-message--floating" : ""}`}>
      <span>{message}</span>
      {onClose ? (
        <button type="button" className="status-message__close" onClick={onClose} aria-label="Close message">
          ×
        </button>
      ) : null}
    </div>
  );
}

export default StatusMessage;
