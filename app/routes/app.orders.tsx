import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  IndexFiltersProps,
  IndexFilters,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import { Orders } from "@prisma/client";
import { getAllOrders } from "../models/order.server";
import { useMemo, useState } from "react";
import { generateCSVContent } from "app/utils/csv_export";

// Loader function
export const loader: LoaderFunction = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const orders = await getAllOrders();
  return json({ orders });
};

// Empty State Component
const EmptyOrderState = () => (
  <EmptyState
    heading="No orders found"
    action={{ content: "Refresh", onAction: () => window.location.reload() }}
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>There are no orders to display.</p>
  </EmptyState>
);

// Utility function for exporting CSV
const exportCSV = (orders: Orders[]) => {
  const blob = new Blob([generateCSVContent(orders)], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "orders.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Order Table Row Component
const OrderTableRow = ({ order }: { order: Orders }) => {
  const orderUrl = `https://admin.shopify.com/store/remix-app-exam/apps/remix-app-exam/app/order/${order.orderId}`;
  return (
    <IndexTable.Row id={order.id.toString()} position={order.id}>
      <IndexTable.Cell>
        <Link to={orderUrl} target="_blank">
          {order.orderId}
        </Link>
      </IndexTable.Cell>
      <IndexTable.Cell>{order.orderNumber}</IndexTable.Cell>
      <IndexTable.Cell>{order.customerFullName}</IndexTable.Cell>
      <IndexTable.Cell>{order.totalPrice}</IndexTable.Cell>
      <IndexTable.Cell>
        {new Date(order.createdAt).toDateString()}
      </IndexTable.Cell>
      <IndexTable.Cell>{order.tags}</IndexTable.Cell>
      <IndexTable.Cell>
        <Link to={`/app/orderEdit/${order.orderId}`}>Edit Tag</Link>
      </IndexTable.Cell>
    </IndexTable.Row>
  );
};

// Order Table Component
const OrderTable = ({ orders }: { orders: Orders[] }) => {
  const rows = useMemo(
    () => orders.map((order) => <OrderTableRow order={order} key={order.id} />),
    [orders],
  );

  return (
    <IndexTable
      itemCount={orders.length}
      headings={[
        { title: "Order Id" },
        { title: "Order Number" },
        { title: "Customer Name" },
        { title: "Total Price" },
        { title: "Date created" },
        { title: "Tags" },
        { title: "" },
      ]}
      selectable={false}
      pagination={{
        hasNext: true,
        onNext: () => {},
      }}
    >
      {rows}
    </IndexTable>
  );
};

// Main Component
export default function Index() {
  const [sortSelected, setSortSelected] = useState(["date desc"]);
  const { orders }: { orders: any[] } = useLoaderData();
  // Sort orders based on selected option
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortSelected.includes("date")) {
      return sortSelected.includes("asc")
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortSelected.includes("total_price")) {
      return sortSelected.includes("asc")
        ? a.totalPrice - b.totalPrice
        : b.totalPrice - a.totalPrice;
    }
  });
  const sortOptions: IndexFiltersProps["sortOptions"] = [
    { label: "Date", value: "date asc", directionLabel: "A-Z" },
    { label: "Date", value: "date desc", directionLabel: "Z-A" },
    { label: "Total", value: "total_price asc", directionLabel: "Ascending" },
    { label: "Total", value: "total_price desc", directionLabel: "Descending" },
  ];

  const { mode, setMode } = useSetIndexFiltersMode();

  return (
    <Page>
      <ui-title-bar title="Order Table">
        <button variant="primary" onClick={() => exportCSV(orders)}>
          Export To CSV
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card padding="0">
            {orders.length === 0 ? (
              <EmptyOrderState />
            ) : (
              <>
                <IndexFilters
                  tabs={[]}
                  sortOptions={sortOptions}
                  sortSelected={sortSelected}
                  selected={0}
                  onSort={(value) => {
                    setSortSelected(value);
                  }}
                  onQueryChange={() => {}}
                  onQueryClear={() => {}}
                  filters={[]}
                  onClearAll={() => {}}
                  appliedFilters={[]}
                  hideFilters
                  hideQueryField
                  mode={mode}
                  setMode={setMode}
                />
                <OrderTable orders={sortedOrders} />
              </>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
