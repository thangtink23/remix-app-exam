import db from "../db.server";

export type OrderData = {
  orderId: string;
  orderNumber: string;
  totalPrice: string;
  paymentGateway?: string;
  customerEmail?: string;
  customerFullName?: string;
  customerAddress?: string;
  tags?: string;
};

/**
 * ✅ Create a new order
 */
export async function createOrder(data: OrderData) {
  return await db.orders.create({
    data: {
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      totalPrice: data.totalPrice,
      paymentGateway: data.paymentGateway,
      customerEmail: data.customerEmail,
      customerFullName: data.customerFullName,
      customerAddress: data.customerAddress,
      tags: data.tags,
    },
  });
}

/**
 * ✅ Update existing order
 */
export async function updateOrder(id: number, data: Partial<OrderData>) {
  return await db.orders.update({
    where: { id },
    data: data,
  });
}

/**
 * ✅ Get all orders
 */
export async function getAllOrders() {
  return await db.orders.findMany();
}
