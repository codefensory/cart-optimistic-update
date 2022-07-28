import path from "path";
import fastifyNow from "fastify-now";
import { FastifyInstance, FastifyPluginOptions } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.register(fastifyNow, {
    routesFolder: path.join(__dirname, "routes"),
  });
}
