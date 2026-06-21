import CapacityBar from "./CapacityBar";
import { VEHICLE_STATUS_KEY } from "../constants/statuses";

function VehicleCard({
  vehicle,
  draftOrders,
  loadedMT,
  draggedAssignment,
  onDeleteDrop,
  onDragEnd,
  onDragStart,
  onRemoveOrder,
  onSavePlan,
  saving,
}) {
  const statusKey = vehicle.statusKey || "UNKNOWN";
  const statusLabel = vehicle.statusLabel || vehicle.status || "Unknown";
  const isPlanned = statusKey === VEHICLE_STATUS_KEY.PLANNED;
  const hasDraftOrders = draftOrders.length > 0;
  const canSave = !isPlanned && draftOrders.length > 0;
  const isDeleteEnabled = !isPlanned && hasDraftOrders && Boolean(draggedAssignment);

  function handleDeleteDragOver(event) {
    if (!isDeleteEnabled) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDeleteDrop(event) {
    event.preventDefault();
    onDeleteDrop();
  }

  return (
    <article className="card vehicle-card">
      <div className="vehicle-card__header">
        <div>
          <div className="card-title">{vehicle.vehicleNo}</div>
          <div className="card-subtitle">{vehicle.model}</div>
        </div>
        <div className="vehicle-card__header-actions">
          {!isPlanned && hasDraftOrders ? (
            <button
              type="button"
              className={`icon-button icon-button--delete ${isDeleteEnabled ? "icon-button--delete-active" : ""}`}
              onDragOver={handleDeleteDragOver}
              onDrop={handleDeleteDrop}
              aria-label="Drag an order here to remove it"
              title="Drag an order here to remove it"
            >
              <svg className="delete-dropzone__icon" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Zm1 11a2 2 0 0 1-2-2V8h12v11a2 2 0 0 1-2 2H8Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          ) : null}

          <span className={`status-pill status-pill--${statusKey.toLowerCase()}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <CapacityBar loaded={loadedMT} total={vehicle.capacityMT} />

      {!isPlanned ? (
        <>
          <div className="vehicle-card__body">
            {draftOrders.length === 0 ? (
              <div className="muted vehicle-card__empty">No draft orders assigned.</div>
            ) : (
              <ul className="vehicle-card__orders">
                {draftOrders.map((order) => (
                  <li
                    key={order.orderId}
                    className="vehicle-card__order-item"
                    draggable
                    onDragEnd={onDragEnd}
                    onDragStart={(event) => onDragStart(event, vehicle.vehicleNo, order)}
                  >
                    <div className="vehicle-card__order-content">
                      <div className="vehicle-card__order-title">{order.orderId}</div>
                      <div className="vehicle-card__order-product">{order.product}</div>
                      <div className="muted">
                        {order.destination} | Quantity: {order.qtyMT} MT
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-button icon-button--remove"
                      onClick={() => onRemoveOrder(vehicle.vehicleNo, order.orderId)}
                      aria-label={`Remove ${order.orderId}`}
                      title={`Remove ${order.orderId}`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Zm1 11a2 2 0 0 1-2-2V8h12v11a2 2 0 0 1-2 2H8Z"
                          fill="currentColor"
                        />
                      </svg>
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
        </>
      ) : null}
    </article>
  );
}

export default VehicleCard;
