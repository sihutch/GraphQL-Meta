module.exports = {
  async allBooks(parent, args, { dgraphClient }) {
    const query = "{ me(func: has(book)) {expand(_all_)} }"
    const res = await dgraphClient.newTxn().query(query);
    return res.getJson().me;
  }
}
