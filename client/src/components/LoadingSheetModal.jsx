import { useEffect } from "react";

function LoadingSheetModal({ loadingSheet, onClose }) {
  useEffect(() => {
    if (!loadingSheet) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [loadingSheet]);

  if (!loadingSheet) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal modal--sheet" role="dialog" aria-modal="true" aria-labelledby="loading-sheet-title">
        <div className="modal__header">
          <div>
            <div className="modal__eyebrow">Plan saved successfully</div>
            <h2 id="loading-sheet-title">Loading Sheet</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close loading sheet">
            ×
          </button>
        </div>

        <div className="loading-sheet">
          <div className="loading-sheet__summary">
            <div className="loading-sheet__stat">
              <span className="loading-sheet__label">Plan ID</span>
              <strong>{loadingSheet.planId}</strong>
            </div>
            <div className="loading-sheet__stat">
              <span className="loading-sheet__label">Loaded</span>
              <strong>
                {loadingSheet.totalLoadedMT} / {loadingSheet.capacityMT} MT
              </strong>
            </div>
            <div className="loading-sheet__stat">
              <span className="loading-sheet__label">Remaining</span>
              <strong>{loadingSheet.remainingMT} MT</strong>
            </div>
          </div>

          <div className="loading-sheet__section">
            <div className="loading-sheet__section-title">Vehicle</div>
            <div className="loading-sheet__vehicle">
              <strong>{loadingSheet.vehicle.vehicleNo}</strong>
              <span>{loadingSheet.vehicle.model}</span>
            </div>
          </div>

          <div className="loading-sheet__section">
            <div className="loading-sheet__section-title">Orders Planned</div>
            <ul className="loading-sheet-list">
              {loadingSheet.lineItems.map((item) => (
                <li key={item.orderId} className="loading-sheet-list__item">
                  <div>
                    <strong>{item.orderId}</strong>
                    <span>{item.product}</span>
                  </div>
                  <span>{item.qtyMT} MT</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingSheetModal;
