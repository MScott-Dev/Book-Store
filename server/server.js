const express = require('express');
const path = require('path');
const db = require('./config/connection');
import { ApolloServer } from 'apollo-server-express'
import { typeDefs, resolvers } from './schemas' 
import { authMiddleware } from './utils/auth'

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client'))
})

// Function to make a new instanec of Apollo server
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
}

db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  });

  // Call function to start server
startApolloServer();