import CapacityBar from "./CapacityBar";

function VehicleCard({ vehicle, draftOrders, loadedMT, onRemoveOrder, onSavePlan, saving }) {
  const canSave = vehicle.status === "Available" && draftOrders.length > 0;

  return (
    <article className="card vehicle-card">
      <div className="vehicle-card__header">
        <div>
          <div className="card-title">{vehicle.vehicleNo}</div>
          <div className="card-subtitle">{vehicle.model}</div>
        </div>
        <span className={`status-pill status-pill--${vehicle.status.toLowerCase()}`}>
          {vehicle.status}
        </span>
      </div>

      <CapacityBar loaded={loadedMT} total={vehicle.capacityMT} />
      <div className="vehicle-card__stats">
        <div className="meta-row">
          <span className="meta-label">Capacity</span>
          <span className="meta-value">{vehicle.capacityMT} MT</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Current Load</span>
          <span className="meta-value">{loadedMT} MT</span>
        </div>
      </div>

      <div className="vehicle-card__body">
        {draftOrders.length === 0 ? (
          <div className="muted vehicle-card__empty">No draft orders assigned.</div>
        ) : (
          <ul className="vehicle-card__orders">
            {draftOrders.map((order) => (
              <li key={order.orderId} className="vehicle-card__order-item">
                <div className="vehicle-card__order-content">
                  <div className="vehicle-card__order-title">{order.orderId}</div>
                  <div className="vehicle-card__order-product">{order.product}</div>
                  <div className="muted">
                    {order.destination} | Quantity: {order.qtyMT} MT
                  </div>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onRemoveOrder(vehicle.vehicleNo, order.orderId)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        className="primary-button"
        onClick={() => onSavePlan(vehicle.vehicleNo)}
        disabled={!canSave || saving}
      >
        {saving ? "Saving..." : "Save Plan"}
      </button>
    </article>
  );
}

export default VehicleCard;
