import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import productsData from "../../../mocks/products";

const getProductById = (id: number) =>
  productsData.find((product) => product.id === id);

const getProductsById: ValidatedEventAPIGatewayProxyEvent<
  any
> = async (event) => {
  const productId = event.pathParameters
    ? event.pathParameters.productId
    : null;
  const product = getProductById(Number(productId));

  if (!productId || !product) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ error: "productId is missing" }),
    };
  }
  return formatJSONResponse(product);
};

export const main = getProductsById;
