const axios = require("axios");
const {getAllCards} = require("./dbUtils");

const searchCardByName = async (cardName, cardList) => {
    const test = await getAllCards();
    // console.log(test.back_flavor);
    return cardList.filter(card => card.name.toLowerCase().includes(cardName.toLowerCase()));
};
const getFaq = async (cardId) => await axios.get(`https://ru.arkhamdb.com/api/public/faq/${cardId}`);
const formatCardText = (cardText, cardSpoiler) => {
    let formatText = '';

    if (cardText === undefined) return formatText;
    if (cardSpoiler) formatText = `\n\n<tg-spoiler>${cardText}</tg-spoiler>`
    else formatText = `\n\n${cardText}`;

    formatText = formatText.replace(/<br\/>|\[skull]|\[cultist]|\[tablet]|\[elder_thing]/gm, x => ({
        '<br\/>': '\n',
        '\[skull]': '💀',
        '\[cultist]': '🥷',
        '\[tablet]': '🪦',
        '\[elder_thing]': '🐙'
    })[x]);

    return formatText;

};

module.exports = {searchCardByName, getFaq, formatCardText};