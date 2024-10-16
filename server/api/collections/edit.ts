import { defineEventHandler } from "h3";
import axios from "axios";
import config from "~/utils/config";

const addCollectionToProduct = async (
  productId: string,
  collectionId: string
) => {
  const response = await axios.post(
    `https://${config.shopifyDomain}/admin/api/2024-07/collects.json`,
    {
      collect: {
        product_id: productId,
        collection_id: collectionId,
      },
    },
    {
      headers: {
        "X-Shopify-Access-Token": config.shopifyAccessToken,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.collect;
};

// Remove Collection from Product
const removeCollectionFromProduct = async (collectId: string) => {
  await axios.delete(
    `https://${config.shopifyDomain}/admin/api/2024-07/collects/${collectId}.json`,
    {
      headers: {
        "X-Shopify-Access-Token": config.shopifyAccessToken,
      },
    }
  );
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event); // Read the updated product data
    const productId = body.productId;

    // Add collections that are not in collects
    body.collections.forEach(async (collection: any) => {
      const existsInCollects = body.collects.some(
        (collect: any) => collect.collection_id === collection.id
      );
      if (!existsInCollects) {
        await addCollectionToProduct(productId, collection.id);
      }
    });

    // Remove collects that are not in collections
    body.collects.forEach(async (collect: any) => {
      const existsInCollections = body.collections.some(
        (collection: any) => collection.id === collect.collection_id
      );
      if (!existsInCollections) {
        await removeCollectionFromProduct(collect.id);
      }
    });

    return { message: "Successfully edited the product collections" };
  } catch (error) {
    console.error("Error:", error);
    return null; // Handle error as needed
  }
});
