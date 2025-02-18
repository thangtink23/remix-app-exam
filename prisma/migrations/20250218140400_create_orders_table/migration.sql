-- CreateTable
CREATE TABLE "Orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "totalPrice" TEXT NOT NULL,
    "paymentGateway" TEXT,
    "customerEmail" TEXT,
    "customerFullName" TEXT,
    "customerAddress" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
