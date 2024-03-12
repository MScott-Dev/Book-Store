const express = require('express');
const path = require('path');
const db = require('./config/connection');

const { ApolloServer } = require("apollo-server-express");
const { expressMiddleware } = require("@apollo/server/express4");
const { authMiddleware } = require('./utils/auth')

const { typeDefs, resolvers } = require ('./schemas')

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// Function to make a new instanec of Apollo server
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use("/graphql", expressMiddleware(server));

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));

    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../client"));
    });
  }
}

db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  });

  // Call function to start server
startApolloServer();