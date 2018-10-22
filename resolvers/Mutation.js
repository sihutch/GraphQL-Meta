const dgraph = require("dgraph-js");
module.exports = {
  async postBook(parent, args, { dgraphClient }) {

    const txn = dgraphClient.newTxn()
    try {
      const mu = new dgraph.Mutation()
      const newBook = {
        ...args.input
      }
      mu.setCommitNow(true)
      mu.setSetJson(newBook)

      const insertedBook = await txn.mutate(mu)
      newBook.book_uid = insertedBook.getUidsMap().get("blank-0")
      return newBook
    } finally {
      await txn.discard();
    }
  }
}
