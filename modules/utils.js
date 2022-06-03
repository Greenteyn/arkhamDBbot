const axios = require("axios");

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

module.exports = {getFaq, formatCardText};