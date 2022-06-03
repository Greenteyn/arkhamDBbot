require("dotenv").config();
const { Telegraf } = require("telegraf");
const MongoClient = require("mongodb").MongoClient;
const { search, callback_query, help } = require("./modules/botComands");
const { dbClientConnect, dbConnectClose } = require("./modules/dbUtils");

if (process.env.BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided!");
}
const bot = new Telegraf(process.env.BOT_TOKEN); //сюда помещается токен, который дал botFather

bot.help(help);
bot.command("search", search);
bot.on("callback_query", callback_query);

(async () => {
  await dbClientConnect();

  await bot.launch();  // запуск бота
  console.info("Bot launched!");

  // Enable graceful stop
  process.once("SIGINT", async () => {
    bot.stop("SIGINT");
    await dbConnectClose();
  });
  process.once("SIGTERM", async () => {
    bot.stop("SIGTERM");
    await dbConnectClose();
  });
})();
