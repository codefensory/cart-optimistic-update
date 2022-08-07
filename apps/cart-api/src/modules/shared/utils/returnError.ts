import { FastifyReply } from "fastify";

export const replyErrorMessage = (req: FastifyReply, error: Error) => {
  req.code(500);
  return { error: error.message };
};
