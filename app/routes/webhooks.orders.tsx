import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // The topics handled here should be declared in the shopify.app.toml.
  // More info: https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration
  switch (topic) {
    case "ORDERS_CREATE":
      console.log("[WEBHOOK] ORDERS_CREATE, PAYLLOAD: ", payload);
      break;
    case "ORDERS_UPDATED":
      console.log("[WEBHOOK] ORDERS_UPDATED, PAYLLOAD: ", payload);
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
  return new Response();
};
