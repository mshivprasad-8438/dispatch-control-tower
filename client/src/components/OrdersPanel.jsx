import OrderCard from "./OrderCard";

function OrdersPanel({
  orders,
  availableVehicles,
  selectedVehicleByOrder,
  onVehicleChange,
  onAssign,
  loading,
  error,
}) {
  if (loading) {
    return <section className="panel">Loading orders...</section>;
  }

  if (error) {
    return <section className="panel panel--error">Failed to load orders: {error}</section>;
  }

  if (orders.length === 0) {
    return <section className="panel">No available orders left.</section>;
  }

  return (
    <section className="panel">
      <div className="panel__header">
        <h2>Available Orders</h2>
        <span>{orders.length} orders</span>
      </div>

      <div className="stack">
        {orders.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            availableVehicles={availableVehicles}
            selectedVehicleNo={selectedVehicleByOrder[order.orderId] || ""}
            onVehicleChange={onVehicleChange}
            onAssign={onAssign}
          />
        ))}
      </div>
    </section>
  );
}

export default OrdersPanel;
