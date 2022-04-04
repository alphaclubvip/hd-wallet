const fs = require("fs")
const moment = require('moment')
const axios = require("axios")
const commandLineArgs = require('command-line-args')
const BIP39 = require('bip39')
const HD_KEY = require('ethereumjs-wallet').hdkey

const OPTIONS = commandLineArgs([
    {name: 'number', alias: 'n', type: Number},
    {name: 'output', alias: 'o', type: String}
])
const ROOT_PATH = "m/44'/60'/0'/0/"
const TYPES = {
    MNEMONIC: 'mnemonic.txt',
    ADDRESS: 'address.txt',
    PRIVATE_KEY: 'private_key.txt',
    TABLE: 'table.csv',
}
const COUNT = OPTIONS['number'] || 20
const FILENAME = OPTIONS['output'] || `${moment().format('YYYYMMDD_HHmmss')}`

const getRandomInt = function () {
    const range = 9999 - 1000
    const rand = Math.random() * range

    return Math.ceil(rand) + 1000
}

const save = function save(type, data) {
    fs.appendFileSync(`./output/${FILENAME}_${type}`, data, 'utf8')
}

const main = async function () {
    const resp = await axios.get(`https://randomuser.me/api/?nat=us&results=${COUNT}`)
    const idents = resp.data.results

    const mnemonic = BIP39.generateMnemonic(128)
    save(TYPES.MNEMONIC, mnemonic)
    console.log(`mnemonic: ${mnemonic}\n`)

    const masterSeed = BIP39.mnemonicToSeedSync(mnemonic)
    const masterWallet = HD_KEY.fromMasterSeed(masterSeed)

    save(
        TYPES.TABLE,
        `Account,Address,Private Key,Username,Gender,Title,Name,State,City,Street,Postcode,Phone,Cell\n`)
    for (let i = 0; i < COUNT; i++) {
        const wallet = masterWallet.derivePath(ROOT_PATH + i).getWallet()

        const privateKey = wallet.getPrivateKeyString()
        const address = wallet.getChecksumAddressString()

        const ident = idents[i]

        save(TYPES.ADDRESS, `Account${i + 1}: ${address}\n`)
        save(TYPES.PRIVATE_KEY, `Account${i + 1}: ${privateKey}\n`)
        save(
            TYPES.TABLE,
            `${i + 1},${address},${privateKey},${ident.name.first}${ident.name.last}${getRandomInt()},${ident.gender},${ident.name.title},${ident.name.first} ${ident.name.last},${ident.location.state},${ident.location.city},${ident.location.street.number} ${ident.location.street.name},${ident.location.postcode},${ident.phone},${ident.cell}\n`)
        console.log(`Account${i + 1}: ${address} <= ${privateKey}`)
    }

    console.log(`\noutput files:`)
    console.log(`  ./output/${FILENAME}_${TYPES.MNEMONIC}`)
    console.log(`  ./output/${FILENAME}_${TYPES.ADDRESS}`)
    console.log(`  ./output/${FILENAME}_${TYPES.PRIVATE_KEY}`)
    console.log(`  ./output/${FILENAME}_${TYPES.TABLE}`)
}

main()
