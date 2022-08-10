import path from "path";
import fastifyNow from "fastify-now";
import { FastifyInstance } from "fastify";
import cors from "@fastify/cors";

export default async function (fastify: FastifyInstance) {
  fastify.register(cors, {
    origin: "*",
  });

  fastify.register(fastifyNow, {
    routesFolder: path.join(__dirname, "./http/routes"),
  });

  fastify.register(fastifyNow, {
    routesFolder: path.join(__dirname, "./modules/order/infrastructure/http/routes"),
    pathPrefix: "/order",
  });

  fastify.register(fastifyNow, {
    routesFolder: path.join(__dirname, "./modules/product/infrastructure/http/routes"),
    pathPrefix: "/product",
  });
}
