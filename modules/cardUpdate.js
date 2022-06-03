const {
  dbClientConnect,
  dbConnectClose,
  dropDB,
  getFromCollection,
  addToCollection,
} = require("./dbUtils");
const axios = require("axios");

const bannedPacks = ["rcore"];

const loadPackList = async () => {
  const packsData = await axios.get("https://arkhamdb.com/api/public/packs/");
  let packList = [];

  for (const pack of packsData.data) {
    packList.push({ packCode: pack.code });
  }

  await addToCollection("packs", packList);
};

const loadAllCards = async (lang = "ru") => {
  const packs = await getFromCollection("packs");

  const url =
    lang !== "en"
      ? `https://${lang}.arkhamdb.com/api/public/cards/`
      : "https://arkhamdb.com/api/public/cards/";
  let packCounter = 1;

  for (const pack of packs) {
    if (bannedPacks.includes(pack.packCode)) continue;
    const cardListInPack = await axios.get(url + pack.packCode);

    for (const card of cardListInPack.data) {
      let propList = [];

      for (const propKey in card) {
        if (propKey === "code") continue;
        propList.push(propKey);
        propList.push(JSON.stringify(card[propKey]));
      }

      await addToCollection("cardList", card);
    }

    const numberOfPacks = packs.length;
    console.info(`${packCounter} pack of ${numberOfPacks} loaded`);
    packCounter++;
  }
};

(async () => {
  await dbClientConnect();
  await dropDB();
  
  await loadPackList();
  await loadAllCards();
  console.info("Data loaded");

  await dbConnectClose();
})();
