
import React, { useEffect, useState } from "react";

const GroupCart = ({ groupCode, onBack }) => {
  const [groupData, setGroupData] = useState(null);

  const fetchGroup = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/group-orders/${groupCode}`
      );
      const data = await res.json();

      if (res.ok) {
        setGroupData(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  // 🔥 BILL SPLITTING LOGIC
  const calculateSplit = () => {
    if (!groupData) return [];

    const memberTotals = {};

    groupData.items.forEach((item) => {
      const total = item.price * item.qty;

      if (!memberTotals[item.addedBy]) {
        memberTotals[item.addedBy] = 0;
      }

      memberTotals[item.addedBy] += total;
    });

    const members = Object.keys(memberTotals);
    const deliveryFee = groupData.deliveryFee || 400;
    const deliveryShare = deliveryFee / members.length;

    return members.map((member) => ({
      name: member,
      subTotal: memberTotals[member],
      delivery: deliveryShare,
      total: memberTotals[member] + deliveryShare,
    }));
  };

  const splitData = calculateSplit();

  return (
    <div className="font-sans min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Group Cart</h1>

          <button
            onClick={onBack}
            className="rounded bg-gray-800 px-4 py-2 text-white"
          >
            Back to Menu
          </button>
        </div>

        {/* ITEMS */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Shared Items</h2>

          {groupData?.items?.length === 0 ? (
            <p>No items added yet.</p>
          ) : (
            groupData?.items?.map((item, index) => (
              <div
                key={index}
                className="border-b py-3 flex justify-between"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Added by {item.addedBy}
                  </p>
                </div>

                <div className="text-right">
                  <p>Rs. {item.price} × {item.qty}</p>
                  <p className="font-bold">
                    Rs. {item.price * item.qty}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BILL SPLITTING */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">
            Bill Splitting
          </h2>

          {splitData.map((member, index) => (
            <div
              key={index}
              className="border-b py-3 flex justify-between"
            >
              <div>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-500">
                  Subtotal: Rs. {member.subTotal}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm">
                  Delivery: Rs. {member.delivery.toFixed(2)}
                </p>
                <p className="font-bold text-red-700">
                  Total: Rs. {member.total.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default GroupCart;