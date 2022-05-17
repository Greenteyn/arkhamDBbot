const {createClient} = require("redis");

let client;

const dbConnect = async () => {
    client = createClient();

    await client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();

    console.info('DB connected');

    return client;
}

const dbConnectClose = async (client) => {
    await client.quit();
    console.info('Connect closed');
}

const getDbClient = async () => client;

const getAllCards = async () => {
    const test = await client.hScan('card', 0);
    console.log(test);

    return client.hGetAll('card:01001');
}

module.exports = {dbConnect, dbConnectClose, getDbClient, getAllCards};
