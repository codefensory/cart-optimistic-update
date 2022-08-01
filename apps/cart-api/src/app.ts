import path from "path";
import fastifyNow from "fastify-now";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.register(fastifyNow, {
    routesFolder: path.join(__dirname, "routes"),
  });

  fastify.register(fastifyNow, {
    routesFolder: path.join(__dirname, "./modules/order/routes"),
    pathPrefix: "/order",
  });

  fastify.register(fastifyNow, {
    routesFolder: path.join(__dirname, "./modules/product/routes"),
    pathPrefix: "/product",
  });
}
