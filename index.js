const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { readFileSync } = require('fs')
const expressPlayground = require('graphql-playground-middleware-express').default
const resolvers = require('./resolvers')
const dgraph = require("dgraph-js");

var DataLoader = require('dataloader')
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

      affiliations: uid @reverse .
      people : uid @reverse .
    `;
    const op = new dgraph.Operation();
    op.setSchema(schema);
    await dgraphClient.alter(op);
}

async function loadData(dgraphClient,parentIds, relationName, jsonFunct) {
  const query =
  `query me($parentIds: string) {
      me(func: uid($parentIds)) { `
        + relationName +` {
        uid
        expand(_all_)
        }
      }
   }`

   const vars = {$parentIds: "[" + parentIds + "]"};
   try {
     const res = await dgraphClient.newTxn().queryWithVars(query, vars);
     var related = []
     res.getJson().me.forEach( function(r) {
       related.push(jsonFunct(r))
     } );

     return related
  } catch (error) {
    console.error(error);
  }
}

async function fetchPeopleForBooks(dgraphClient,bookIds) {
  return loadData(dgraphClient, bookIds, "people", (b) => {return b.people} )
}

async function fetchAffiliationsForPeople(dgraphClient,peopleIds) {
  return loadData(dgraphClient, peopleIds, "affiliations", (p) => {return p.affiliations} )
}

async function start() {
  const grpc = require("grpc");
  const clientStub = new dgraph.DgraphClientStub(
    "server:9080",grpc.credentials.createInsecure(),
    //"localhost:9080",grpc.credentials.createInsecure(),
  );

  const dgraphClient = new dgraph.DgraphClient(clientStub);
  setSchema(dgraphClient)

  const dataloader = {
      people: new DataLoader(keys => fetchPeopleForBooks(dgraphClient,keys)),
      affiliations: new DataLoader(keys => fetchAffiliationsForPeople(dgraphClient,keys))
  }

  const app = express()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      return {dgraphClient,dataloader}
    }
  })

  server.applyMiddleware({ app })

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }))

  app.listen({ port: 4000 }, () =>
    console.log(`GraphQL Server running at http://localhost:4000${server.graphqlPath}`)
  )
}

start()
