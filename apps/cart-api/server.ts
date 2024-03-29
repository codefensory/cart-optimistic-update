// Read the .env file.
import * as dotenv from "dotenv";
dotenv.config();

// Require the framework
import Fastify from "fastify";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
app.register(import("./src/app"));

// Start listening.
app.listen({ port: parseInt(process.env.PORT ?? "") || 3000 }, (err: any) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
