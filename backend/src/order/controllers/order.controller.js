// Please don't change the pre-written code
// Import the necessary modules here

import { createNewOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
    try {
      
      const orderData = req.body;
      orderData.user = req.user._id;
      // Validate and transform orderData if needed
      if (!orderData.shippingInfo || !orderData.orderedItems || !orderData.paymentInfo) {
        return new ErrorHandler(400,'Missing required order data');
      }
  
      // Create order
      const newOrder = await createNewOrderRepo(orderData);
  
      // Send response
      res.status(201).json({
        message: 'Order placed successfully',
        order: newOrder
      });
    } catch (error) {
      return next(new ErrorHandler(400, error));
    }
  };
  
 
