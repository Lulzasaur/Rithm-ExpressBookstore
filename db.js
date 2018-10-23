/** Database config for database. */


const { Client } = require("pg");
const {DB_URI} = require("./config")

let client = new Client({
  connectionString: DB_URI
});

client.connect();


module.exports = client;
