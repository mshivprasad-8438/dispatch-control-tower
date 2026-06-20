import { canAssignOrderToVehicle } from "../utils/capacity";
import { CREDIT_STATUS } from "../constants/statuses";

function OrderCard({
  order,
  availableVehicles,
  draftAssignments,
  selectedVehicleNo,
  isHighlighted,
  onVehicleChange,
  onAssign,
}) {
  const isBlocked = order.creditStatus === CREDIT_STATUS.BLOCKED;
  const hasAssignableVehicles = availableVehicles.some((vehicle) =>
    canAssignOrderToVehicle(vehicle, order, draftAssignments)
  );
  const selectedVehicle = availableVehicles.find((vehicle) => vehicle.vehicleNo === selectedVehicleNo);
  const selectedVehicleCanFit = selectedVehicle
    ? canAssignOrderToVehicle(selectedVehicle, order, draftAssignments)
    : false;
  const assignDisabled = isBlocked || !selectedVehicleNo || !selectedVehicleCanFit;

  return (
    <article
      className={`card order-card ${isBlocked ? "order-card--blocked" : ""} ${
        isHighlighted ? "order-card--highlighted" : ""
      }`}
      title={isBlocked ? order.creditReason : ""}
    >
      <div className="order-card__header">
        <div>
          <div className="card-title">{order.customerName}</div>
          <div className="card-subtitle">{order.product}</div>
        </div>
        <span className={`status-pill ${isBlocked ? "status-pill--blocked" : "status-pill--ready"}`}>
          {isBlocked ? "Blocked" : "Ready"}
        </span>
      </div>

      <div className="order-card__meta">
        <div className="meta-row">
          <span className="meta-label">Order ID</span>
          <span className="meta-value">{order.orderId}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Customer</span>
          <span className="meta-value">{order.customerName}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Destination</span>
          <span className="meta-value">{order.destination}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Quantity</span>
          <span className="meta-value">{order.qtyMT} MT</span>
        </div>
      </div>

      {isBlocked && <div className="order-card__reason">{order.creditReason}</div>}

      <div className="order-card__actions">
        <select
          value={selectedVehicleNo}
          onChange={(event) => onVehicleChange(order.orderId, event.target.value)}
          disabled={isBlocked || !hasAssignableVehicles}
        >
          <option value="">Select vehicle</option>
          {availableVehicles.map((vehicle) => {
            const isDisabled = !canAssignOrderToVehicle(vehicle, order, draftAssignments);

            return (
              <option key={vehicle.vehicleNo} value={vehicle.vehicleNo} disabled={isDisabled}>
              {vehicle.vehicleNo} ({vehicle.capacityMT} MT)
              </option>
            );
          })}
        </select>

        <button type="button" onClick={() => onAssign(order)} disabled={assignDisabled}>
          Assign
        </button>
      </div>
    </article>
  );
}

export default OrderCard;
