import { Order } from "../models/Order.js";

export const getOrderByNumber = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  res.json({ order });
};
