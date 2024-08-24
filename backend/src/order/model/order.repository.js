import OrderModel from "./order.schema.js";

export const createNewOrderRepo = async (data) => {
  // Write your code here for placing a new order
    const order = new OrderModel(data);
    return await order.save();
};
