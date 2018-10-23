const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { readFileSync } = require('fs')
const expressPlayground = require('graphql-playground-middleware-express').default
const resolvers = require('./resolvers')
const dgraph = require("dgraph-js");

var typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

// Drop All - discard all data and start from a clean slate.
async function dropAll(dgraphClient) {
    const op = new dgraph.Operation();
    op.setDropAll(true);
    await dgraphClient.alter(op);
}

// Create book schema schema.
async function setSchema(dgraphClient) {
    const schema = `
      book_guid: string @index(exact) .
      book_doi: string @index(exact) .
      book_title: string @index(term,trigram, fulltext) .
      book_publication_date: datetime @index(day) .

      person_orcid: string @index(exact) .
      person_guid: string @index(exact) .
      person_name: string @index(term) .

      org_name: string @index(term) .
      org_guid: string @index(exact) .

      cpt_title: string @index(term) .

      role_type: string @index(term) .

      affiliations: uid @reverse .
      roles: uid @reverse .
      people : uid @reverse .
    `;
    const op = new dgraph.Operation();
    op.setSchema(schema);
    await dgraphClient.alter(op);
}

async function start() {
  const grpc = require("grpc");
  const clientStub = new dgraph.DgraphClientStub(
    "server:9080",grpc.credentials.createInsecure(),
  );

  const dgraphClient = new dgraph.DgraphClient(clientStub);
  setSchema(dgraphClient)

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
