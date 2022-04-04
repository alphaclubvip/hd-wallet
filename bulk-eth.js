const fs = require("fs")
const moment = require('moment')
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

const save = function save(type, data) {
    fs.appendFileSync(`./output/${FILENAME}_${type}`, data, 'utf8')
}

const mnemonic = BIP39.generateMnemonic(128)
save(TYPES.MNEMONIC, mnemonic)
console.log(`mnemonic: ${mnemonic}\n`)

const masterSeed = BIP39.mnemonicToSeedSync(mnemonic)
const masterWallet = HD_KEY.fromMasterSeed(masterSeed)

save(TYPES.TABLE, `Account,Address,Private Key\n`)
for (let i = 0; i < COUNT; i++) {
    const wallet = masterWallet.derivePath(ROOT_PATH + i).getWallet()

    const privateKey = wallet.getPrivateKeyString()
    const address = wallet.getChecksumAddressString()

    save(TYPES.ADDRESS, `Account${i + 1}: ${address}\n`)
    save(TYPES.PRIVATE_KEY, `Account${i + 1}: ${privateKey}\n`)
    save(TYPES.TABLE, `${i + 1},${address},${privateKey}\n`)
    console.log(`Account${i + 1}: ${address} <= ${privateKey}`)
}

console.log(`\noutput files:`)
console.log(`  ./output/${FILENAME}_${TYPES.MNEMONIC}`)
console.log(`  ./output/${FILENAME}_${TYPES.ADDRESS}`)
console.log(`  ./output/${FILENAME}_${TYPES.PRIVATE_KEY}`)
console.log(`  ./output/${FILENAME}_${TYPES.TABLE}`)
