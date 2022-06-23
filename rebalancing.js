// require('dotenv').config();
const ccxt = require('ccxt');

const authenticate = (apiKey, secret, password, accountName) => {
    try {
        let exchange = new ccxt.ftx({
            'apiKey': apiKey,
            'secret': secret,
            'password': password,
            'enableRateLimit': true
        })

        if (accountName === '') {
            console.log('This is main acount' + exchange)
        }

    } catch (err) {
        console.log(err)
    }
}


const fetchBalance = (client, asset1, asset2, quote) => {
    try {
        let balance = client.fetchBalance()
        let ticker = client.fetchTicker(quote)

        console.log('28')

        let asset1Val = balance.asset1.total
        let asset2Val = balance.asset2.total

        console.log(asset1Val + asset1)
        console.log(asset2Val + asset2)

        if (asset1 === '' || asset2 === '') {
            console.log('No balance available for trading')
        }

        let averagePrice = ((ticker['bid'] + ticker['sell']) / 2)

        return asset1Val, asset2Val, averagePrice

    } catch (err) {
        console.log(err)
    }
}

const action = (asset1Val, asset2Val, averagePrice, client, quote, pcdiff) => {
    try {
        let asset1CrrtVal = asset1Val * averagePrice
        let asset2CrrtVal = asset2Val * 1
        let rebalanceMark = ((asset1CrrtVal + asset2CrrtVal) / 2)
        let rebalancePerDiff = pcdiff
        let compRebalance = (rebalanceMark * rebalancePerDiff / 100)
        let diffSell = asset1CrrtVal - rebalanceMark
        let diffBuy = rebalanceMark - asset1CrrtVal

        if (asset1CrrtVal > (rebalanceMark + compRebalance)) {
            console.log('asset_1_Crrt_val ' + asset1CrrtVal + ' > ' + (rebalanceMark + compRebalance))
            console.log('Sell')
            console.log(diffSell)
            client.createOrder(quote, 'market', 'sell', (diffSell / averagePrice))
            return true
        } else if (asset1CrrtVal < (rebalanceMark - compRebalance)) {
            console.log('asset_2_Crrt_val' + asset1CrrtVal + ' < ' + (rebalanceMark - compRebalance))
            console.log('Buy')
            console.log(diffBuy)
            client.createOrder(quote, 'market', 'buy', (diffBuy / averagePrice))
            return true
        } else {
            return false
        }


    } catch (err) {
        console.log(err)
    }
}

function main() {
    try {
        const fromEnv = process.env
        const apiKey = fromEnv.API_KEY
        const secret = fromEnv.API_SECRET
        const password = fromEnv.PASSWORD
        const accountName = fromEnv.ACCOUNT_NAME
        const asset1 = fromEnv.asset1
        const asset2 = 'USD'

        if (asset2 !== 'USD') {
            return console.log('Only Support Coin-USD')
        }
        let quote = asset1 + '/' + asset2

        let client = authenticate(apiKey, secret, password, accountName)
        fetchBalance(client, asset1, asset2, quote)
        action(asset1Val, asset2Val, averagePrice, client, quote, pcdiff)



    } catch (err) {
        console.log(err)
    }
}

main()
