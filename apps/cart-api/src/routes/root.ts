import { NowRequestHandler } from "fastify-now";

export const GET: NowRequestHandler = (req, reply) => {
  return { root: true };
};
