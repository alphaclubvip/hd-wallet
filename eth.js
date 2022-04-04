const fs = require("fs")
const moment = require('moment')
const commandLineArgs = require('command-line-args')
const BIP39 = require('bip39')
const HD_KEY = require('ethereumjs-wallet').hdkey

const ROOT_PATH = "m/44'/60'/0'/0/"
const FILENAME = `${moment().format('YYYYMMDD_HHmmss')}.txt`
const OPTIONS = commandLineArgs([
    {name: 'number', alias: 'n', type: Number}
])

const COUNT = OPTIONS.number || 20

const save = function save(data) {
    fs.appendFileSync(`./output/${FILENAME}`, data, 'utf8')
}

const main = function () {
    const mnemonic = BIP39.generateMnemonic(128)

    save(mnemonic + '\n')
    console.log(mnemonic)

    const seed = BIP39.mnemonicToSeedSync(mnemonic)

    const hdWallet = HD_KEY.fromMasterSeed(seed)

    for (let i = 0; i < COUNT; i++) {
        const wallet = hdWallet.derivePath(ROOT_PATH + i).getWallet()

        const privateKey = wallet.getPrivateKeyString()
        const address = wallet.getChecksumAddressString()

        const line = `#${i}: ${address} <= ${privateKey}`

        save(line + '\n')
        console.log(line)
    }
}

main()
