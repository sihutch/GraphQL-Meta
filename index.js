const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { readFileSync } = require('fs')
const expressPlayground = require('graphql-playground-middleware-express').default
const resolvers = require('./resolvers')

var typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

async function start() {

  const dgraph = require("dgraph-js");
  const grpc = require("grpc");

  const clientStub = new dgraph.DgraphClientStub(
  // addr: optional, default: "localhost:9080"
  "localhost:9080",
  // credentials: optional, default: grpc.credentials.createInsecure()
  grpc.credentials.createInsecure(),
  );
  const dgraphClient = new dgraph.DgraphClient(clientStub);

  const app = express()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      return {dgraphClient}
    }
  })

  server.applyMiddleware({ app })

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

  app.listen({ port: 4000 }, () =>
    console.log(`GraphQL Server running at http://localhost:4000${server.graphqlPath}`)
  )
}

start()
