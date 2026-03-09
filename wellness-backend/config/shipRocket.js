import axios from "axios";

let shipRocketToken = null;

export const generateShipRocketToken = async () => {

    try {
        const response = await axios.post(
            `${process.env.SHIPROCKET_API}/auth/login`,
            {
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD
            }
        )
        shipRocketToken = response.data.token;
        return shipRocketToken;
    } catch (error) {
        console.error("Error generating ShipRocket token:", error);
        throw error;
    }
}


export const createShipment = async (order) => {

    try {
        if (!shipRocketToken) {
            await generateShipRocketToken();
        }
        const address = order.shippingAddress;

        const orderItems = order.items.map(item => ({
            name: item.product?.name || "Product",
            sku: item.product?._id?.toString() || "SKU123",
            units: item.quantity,
            selling_price: item.price
        }));

        const payload = {
            order_id: order.orderNumber,
            order_date: order.createdAt,
            pickup_location: "Primary",

            billing_customer_name: address.name,
            billing_address: address.address,
            billing_city: address.city,
            billing_pincode: address.pinCode,
            billing_state: address.state,
            billing_country: "India",

            billing_email: address.email,
            billing_phone: address.phone,

            shipping_is_billing: true,

            order_items: orderItems,

            payment_method:
                order.paymentMethod === "COD" ? "COD" : "Prepaid",

            shipping_charges: order.shippingCost || 0,
            sub_total: order.subtotal,
            total_amount: order.totalAmount,

            length: 10,
            breadth: 10,
            height: 10,
            weight: 1
        };

        const response = await axios.post(
            `${process.env.SHIPROCKET_API}/orders/create/adhoc`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${shipRocketToken}`
                }
            }
        );

        console.log("Shiprocket Shipment Created:", response.data);

        return response.data;

    } catch (error) {

        console.error(
            "Shiprocket Shipment Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};