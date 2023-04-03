import "reflect-metadata";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import cors from "cors";
import { buildSchema } from "type-graphql";
import { SampleResolver } from "./resolver/sample";
import { PrismaClient } from "@prisma/client";
import { connectDb } from "./config/db";
import { UserResolver } from "./resolver/user";

const prisma = new PrismaClient();

const app = express();
const httpServer = http.createServer(app);


const main =  async() => {

  // Set up Apollo Server
  const server = new ApolloServer({
    schema: await buildSchema({
      validate: false,
      resolvers: [SampleResolver, UserResolver],
    }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();


  app.use(
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res, prisma }),
    })
  );
  await new Promise((resolve: any) => {
    httpServer.listen({ port: 4000 }, resolve)
});

 await connectDb();
  console.log(`🚀 Server ready at http://localhost:4000`);
};

main();
