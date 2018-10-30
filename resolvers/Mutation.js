const dgraph = require("dgraph-js");
module.exports = {
  async postBook(parent, args, { dgraphClient }) {

    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      const newBook = {
        ...args.input,
        "book": ""
      }
      mu.setCommitNow(true)
      mu.setSetJson(newBook)

      const insertedBook = await txn.mutate(mu)
      return insertedBook.getUidsMap().get("blank-0")
    } finally {
      await txn.discard();
    }
  }
}
