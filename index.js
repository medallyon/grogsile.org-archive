const join = require("path").join;

// === [ GLOBALS ] === //

// ./
global.__base = __dirname;
// ./data/
global.__data = join(__dirname, "data");
// ./lib/
global.__lib = join(__dirname, "lib");
// ./web/.pub_src/
global.__src = join(__dirname, "web", ".pub_src");

// ./bot/
global.__botdir = join(__dirname, "bot");
// ./web/
global.__webdir = join(__dirname, "web");

// === [ DISCORD CLIENT ] === //

const GrogClient = require(join(__lib, "structs", "GrogClient.js"));
let client = new GrogClient();

client.login()
    .catch(console.error);

module.exports = client;
