import Order from "../models/orderModel.js";

export const shiprocketWebhook = async (req, res) => {
  try {
    console.log("📦 Shiprocket Webhook Received");
    console.log("Payload:", JSON.stringify(req.body, null, 2));

    const payload = req.body;

    // Shiprocket sends AWB number
    const awb = payload.awb || payload.awb_code;

    if (!awb) {
      return res.status(400).json({
        success: false,
        message: "AWB not provided"
      });
    }

    const order = await Order.findOne({ trackingNumber: awb });

    if (!order) {
      console.log("⚠️ Order not found for AWB:", awb);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const shiprocketStatus = payload.current_status || payload.status;

    console.log("📦 Shiprocket status:", shiprocketStatus);

    let newStatus = order.status;

    switch (shiprocketStatus) {
      case "NEW":
      case "AWB ASSIGNED":
      case "PICKUP SCHEDULED":
        newStatus = "Processing";
        break;

      case "PICKED UP":
      case "IN TRANSIT":
      case "OUT FOR DELIVERY":
        newStatus = "Shipped";
        break;

      case "DELIVERED":
        newStatus = "Delivered";
        order.paymentStatus = "Paid"; // COD delivered
        break;

      case "RTO INITIATED":
      case "RTO IN TRANSIT":
      case "RTO DELIVERED":
        newStatus = "Returned";
        break;

      case "CANCELLED":
        newStatus = "Cancelled";
        break;

      default:
        console.log("⚠️ Unmapped status:", shiprocketStatus);
    }

    order.status = newStatus;

    await order.save();

    console.log("✅ Order updated via webhook:", order.orderNumber);

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully"
    });

  } catch (error) {
    console.error("❌ Shiprocket webhook error:", error);

    res.status(500).json({
      success: false,
      message: "Webhook processing failed"
    });
  }
};