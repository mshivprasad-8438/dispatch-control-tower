function LoadingSheetModal({ loadingSheet, onClose }) {
  if (!loadingSheet) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal">
        <div className="modal__header">
          <h2>Loading Sheet</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal__content">
          <div>
            <strong>Plan ID:</strong> {loadingSheet.planId}
          </div>
          <div>
            <strong>Vehicle:</strong> {loadingSheet.vehicle.vehicleNo} ({loadingSheet.vehicle.model})
          </div>
          <div>
            <strong>Loaded:</strong> {loadingSheet.totalLoadedMT} / {loadingSheet.capacityMT} MT
          </div>
          <div>
            <strong>Remaining:</strong> {loadingSheet.remainingMT} MT
          </div>

          <h3>Line Items</h3>
          <ul className="loading-sheet-list">
            {loadingSheet.lineItems.map((item) => (
              <li key={item.orderId}>
                {item.orderId} - {item.product} - {item.qtyMT} MT
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoadingSheetModal;
