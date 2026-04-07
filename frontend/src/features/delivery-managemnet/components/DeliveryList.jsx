import DeliveryCard from "./DeliveryCard";

function DeliveryList({ deliveries, onStatusChange, onAssignRider, isAdmin = false }) {
  if (!deliveries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        No deliveries found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {deliveries.map((delivery) => (
        <DeliveryCard
          key={delivery._id}
          delivery={delivery}
          onStatusChange={onStatusChange}
          onAssignRider={onAssignRider}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}

export default DeliveryList;