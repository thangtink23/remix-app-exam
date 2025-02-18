import { Orders } from "@prisma/client";

export const generateCSVContent = (orders: Orders[]) => {
  return orders
    .map(
      ({
        orderId,
        orderNumber,
        totalPrice,
        paymentGateway,
        customerEmail,
        customerFullName,
        customerAddress,
        tags,
        createdAt,
      }) =>
        [
          orderId,
          orderNumber,
          totalPrice,
          paymentGateway,
          customerEmail,
          `"${customerFullName}"`,
          `"${customerAddress}"`,
          `"${tags}"`,
          createdAt,
        ].join(","),
    )
    .join("\n");
};
