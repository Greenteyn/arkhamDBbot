const { Markup } = require("telegraf");

const { getFaq, formatCardText } = require("./utils");
const { getFromCollection } = require("./dbUtils");

let foundCards;

const search = async (ctx) => {
  const searchQuery = ctx.message.text.substring(8);

  if (searchQuery.length <= 3)
    return ctx.reply("Поисковый запрос должен быть длиннее 3 символов");

  foundCards = await getFromCollection("cardList", {
    name: { $regex: `.*${searchQuery}.*`, $options: "i" },
  });

  if (foundCards.length === 0)
    return ctx.reply("Ничего не найдено. Повторите поиск.");
  if (foundCards.length <= 8) {
    foundCards.forEach((card) => {
      let cardExp = "";

      switch (card.type_code) {
        case "event":
        case "skill":
        case "asset":
          cardExp = ` (ур. ${card.xp ? card.xp : 0})`;
          break;
        default:
          break;
      }

      ctx.reply(`${card.type_name} <u><b>(${card.pack_name})</b></u>`, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          Markup.button.callback(card.name + cardExp, `search_${card.code}`),
        ]),
      });
    });
  } else
    return ctx.reply(
      `Найдено слишком много совпадений (${foundCards.length}). Задайте более точные параметры поиска.`
    );
};

const callback_query = async (ctx) => {
  const callback = ctx.update.callback_query.data;

  let regexSearch = /^search_(.*)$/,
    regexFaq = /^faq_(.*)$/,
    regexFlip = /^flip_(.*)$/;

  switch (true) {
    case regexSearch.test(callback): {
      const cardId = callback.match(regexSearch)[1];
      let card;

      if (foundCards) {
        card = foundCards.find((card) => card.code === cardId);
      } else {
        const foundInCollection = await getFromCollection("cardList", { code: cardId });
        card = foundInCollection[0];
      }

      const cardText = formatCardText(card.text, card.spoiler);
      const buttons = [Markup.button.callback("❓ FAQ", `faq_${card.code}`)];

      if (card.backimagesrc)
        buttons.push(
          Markup.button.callback("↪ Перевернуть", `flip_${card.code}`)
        );

      await ctx.replyWithPhoto(
        { url: `https://ru.arkhamdb.com${card.imagesrc}` },
        {
          caption: `<b>${card.name}</b>${cardText}`,
          parse_mode: "HTML",
          ...Markup.inlineKeyboard(buttons),
        }
      );
      break;
    }
    case regexFlip.test(callback): {
      const cardId = callback.match(regexFlip)[1];
      let card;

      if (foundCards) {
        card = foundCards.find((card) => card.code === cardId);
      } else {
        const foundInCollection = await getFromCollection("cardList", { code: cardId });
        card = foundInCollection[0];
      }
      const cardText = formatCardText(card.back_text, card.spoiler);

      await ctx.replyWithPhoto(
        { url: `https://ru.arkhamdb.com${card.backimagesrc}` },
        {
          caption: `<b>${card.name}</b>${cardText}`,
          parse_mode: "HTML",
          ...Markup.inlineKeyboard([
            Markup.button.callback("❓ FAQ", `faq_${card.code}`),
          ]),
        }
      );
      break;
    }
    case regexFaq.test(callback): {
      const cardId = callback.match(regexFaq)[1];
      const faq = await getFaq(cardId);

      if (faq.data.length !== 0) ctx.reply(faq.data[0].text);
      else ctx.reply("Для этой карты отсутствует FAQ");

      break;
    }
    default: {
      break;
    }
  }
};

const help = (ctx) => ctx.reply("TEST");

module.exports = { search, callback_query, help };
