import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { createOrder, updateOrder } from "../models/order.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
  switch (topic) {
    case "ORDERS_CREATE":
      console.log("[WEBHOOK] ORDERS_CREATE, PAYLLOAD: ", payload);

      const orderData = {
        orderId: payload.id.toString(),
        orderNumber: payload.order_number.toString(),
        totalPrice: payload.total_price || "0",
        paymentGateway: payload.payment_gateway_names.join(", "),
        customerEmail: payload.customer?.email || "",
        customerFullName:
          `${payload.customer?.first_name || ""} ${payload.customer?.last_name || ""}`.trim(),
        customerAddress: getCustomerAddress(payload.customer?.default_address),
        tags: payload.tags,
      };

      // ✅ Check if order exists, then update; otherwise, create
      const existingOrder = await db.orders.findFirst({
        where: { orderId: orderData.orderId },
      });

      if (existingOrder) {
        await updateOrder(existingOrder.id, orderData);
      } else {
        await createOrder(orderData);
      }
      break;
    case "ORDERS_UPDATED":
      console.log("[WEBHOOK] ORDERS_UPDATED. Payload: ", payload);

      const targetOrder = await db.orders.findFirst({
        where: { orderId: payload.id.toString() },
      });

      if (!targetOrder) {
        console.log(`[WEBHOOK: ORDERS_UPDATED. Order ${payload.id} not found`);
        break;
      }

      await updateOrder(targetOrder.id, {
        orderId: payload.id.toString(),
        orderNumber: payload.order_number.toString(),
        totalPrice: payload.total_price || "0",
        paymentGateway: payload.payment_gateway_names.join(", "),
        customerEmail: payload.customer?.email || "",
        customerFullName:
          `${payload.customer?.first_name || ""} ${payload.customer?.last_name || ""}`.trim(),
        customerAddress: getCustomerAddress(payload.customer?.default_address),
        tags: payload.tags,
      });
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
  return new Response();
};

const getCustomerAddress = (address: any) => {
  if (!address) return "";

  const address1 = address.address1 || "";
  const city = address.city || "";
  const province = address.province || "";
  const country = address.country || "";
  const addressParts = [address1, city, province, country];

  return addressParts.filter((part) => part).join(", ");
};
