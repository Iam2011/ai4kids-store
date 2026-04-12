export const buildOrderWhatsappMessage = (order) => {
  const lines = [
    `New AI4Kids order: ${order.orderNumber}`,
    `Customer: ${order.customer.name}`,
    `Mobile: ${order.customer.mobile}`,
    `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`,
    `Payment mode: ${
      order.paymentMode === "cod_deposit"
        ? `COD with Rs ${order.codConfirmationFee || order.paymentAmount} confirmation`
        : "Full payment"
    }`,
    `Payment status: ${order.paymentStatus}`,
    `Paid now: Rs ${order.paymentAmount}`,
    `Order total: Rs ${order.totalAmount}`,
  ];

  if (order.paymentMode === "cod_deposit") {
    lines.push(`COD confirmation fee: Rs ${order.codConfirmationFee || order.paymentAmount}`);
  }

  if (order.balanceDue > 0) {
    lines.push(`Balance due on delivery: Rs ${order.balanceDue}`);
  }

  lines.push("Items:");

  for (const item of order.items) {
    lines.push(`- ${item.name} x ${item.quantity} = Rs ${item.lineTotal}`);

    if (item.itemType === "combo" && Array.isArray(item.bundleItems) && item.bundleItems.length) {
      lines.push(`  Includes: ${item.bundleItems.map((bundleItem) => bundleItem.name).join(", ")}`);
    }
  }

  if (order.couponCode) {
    lines.push(`Coupon used: ${order.couponCode}`);
  }

  return lines.join("\n");
};
