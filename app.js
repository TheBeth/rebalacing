require('dotenv').config();
const ccxt = require('ccxt');

const authenticate = async (apiKey, secret, password, accountName) => {
    try {
        let exchange = new ccxt.ftx({
            'apiKey': apiKey,
            'secret': secret,
            'password': password,
            'enebleRateLimit': true,
        })

        if (accountName === '') {
            console.log('Account Name - This is Main Account : Broker ' + exchange)
        } else {
            console.log('Account Name : ' + accountName + ' : Broker ' + exchange.id)
        }

        return exchange

    } catch (err) {
        console.log(err)
    }
}


const fetchBalance = async (client, asset1, asset2, quote) => {
    try {
        let balance = await client.fetchBalance()
        let ticker = await client.fetchTicker(quote)
        console.log(balance)
        // console.log(ticker)
        let asset1Val = parseFloat('1000') //ETH
        let asset2Val = parseFloat('1600') //USD

        console.log('asset_1_val : ' + asset1Val)
        console.log('asset_2_val : ' + asset2Val)

        if (asset1Val === undefined || asset2Val === undefined) {
            console.log("\x1b[31m", 'No balance available for trading')
        }

        let averagePrice = await (ticker.bid + ticker.ask) / 2
        console.log('average_price : ' + averagePrice)

        return { averagePrice, asset1Val, asset2Val }

    } catch (err) {
        console.log(err)
    }
}

const action = (avgPrice, ass1Val, ass2val, client, quote, pcdiff) => {
    try {
        let asset1CrrtVal = ass1Val * avgPrice
        let asset2CrrtVal = ass2val * 1
        let rebalanceMark = ((asset1CrrtVal + asset2CrrtVal) / 2)
        let rebalancePercentDiff = pcdiff
        let compareRebalance = (rebalanceMark * rebalancePercentDiff / 100)
        let diffSell = asset1CrrtVal - rebalanceMark
        let diffBuy = rebalanceMark - asset1CrrtVal

        if (asset1CrrtVal > (rebalanceMark + compareRebalance)) {
            console.log('asset_1_crrt_val : ' + asset1CrrtVal + ' > ' + (rebalanceMark + compareRebalance))
            console.log('Sell')
            console.log(diffSell)
            // client.createOrder(quote, 'market', 'sell', (diffSell / averagePrice))
            // console.log("\x1b[32m", 'Profit')
        } else if (asset1CrrtVal < (rebalanceMark - rebalanceMark)) {
            console.log('asset_1_Crrt_val : ' + asset1CrrtVal + ' < ' + (rebalanceMark - compareRebalance))
            console.log('Buy')
            console.log(diffBuy)
            // client.createOrder(quote, 'market', 'buy', (diffBuy/averagePrice))
            // console.log("\x1b[31m", 'Loss')
        }else{
            console.log('None Trading')
        }

    } catch (err) {
        console.log(err)
    }
}


const main = async () => {
    try {
        const fromEnv = process.env
        const apiKey = fromEnv.API_KEY
        const secret = fromEnv.API_SECRET
        const password = fromEnv.PASSWORD
        const accountName = fromEnv.ACCOUNT_NAME
        const asset1 = fromEnv.ASSET_1
        const asset2 = fromEnv.ASSET_2
        const pcdiff = fromEnv.PCDIFF

        if (asset2 !== 'USD') {
            return console.log('Only Support Coin-USD')
        }

        let quote = asset1 + '/' + asset2

        console.log(quote)

        let client = await authenticate(apiKey, secret, password, accountName)
        const fetch = await fetchBalance(client, asset1, asset2, quote)
        let avgPrice = fetch.averagePrice
        let ass1Val = fetch.asset1Val
        let ass2val = fetch.asset2Val
        action(avgPrice, ass1Val, ass2val, client, quote, pcdiff)

       

    } catch (err) {
        console.log(err)
    }
}

setInterval(main, 5000)