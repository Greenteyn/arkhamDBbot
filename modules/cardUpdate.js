const axios = require("axios");
const {dbConnect, dbConnectClose} = require("./dbUtils");

const bannedPacks = ['rcore'];

const getPackList = async (client) => {
    const packsData = await axios.get('https://arkhamdb.com/api/public/packs/');

    for (const pack of packsData.data) {
        client.rPush('packs', pack.code);
    }
};

const downloadAllCards = async (client, lang = 'ru') => {
    const packs = await client.lRange('packs', 0, -1);

    let allCardList = [];
    let cardListInPack;
    const url = (lang !== 'en') ? `https://${lang}.arkhamdb.com/api/public/cards/` : 'https://arkhamdb.com/api/public/cards/';
    let packCounter = 1;

    for (const pack of packs) {
        if (bannedPacks.includes(pack)) continue;
        cardListInPack = await axios.get(url + pack);

        for (const card of cardListInPack.data) {
            let propList = [];

            for (const propKey in card) {
                if (propKey === 'code') continue;
                propList.push(propKey);
                propList.push(JSON.stringify(card[propKey]));
            }
            await client.hSet(`card:${card.code}`, propList);
            await client.sAdd('cardList', `card:${card.code}`);
        }

        const numberOfPacks = packs.length;
        console.info(`${packCounter} pack of ${numberOfPacks} loaded`);
        packCounter++;
    }
};

(async () => {
    const client = await dbConnect();
    await client.flushDb();

    await getPackList(client);
    await downloadAllCards(client);
    console.info('Data loaded');

    await dbConnectClose(client);
})()
