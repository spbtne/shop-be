import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import productsData from "../../../mocks/products";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  return formatJSONResponse(productsData);
};

export const main = getProductsList;
