function StatusMessage({ tone = "info", message }) {
  if (!message) {
    return null;
  }

  return <div className={`status-message status-message--${tone}`}>{message}</div>;
}

export default StatusMessage;
