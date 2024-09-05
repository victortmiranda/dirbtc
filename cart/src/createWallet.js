const bip32 = require('bip32')
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const secureRandom = require('secure-random')

// Definição da rede Bitcoin e do caminho de derivação
const network = bitcoin.networks.testnet
const path = "m/49'/1'/0'/0"

// Gera uma frase mnemônica usando uma fonte segura de entropia
let mnemonic = bip39.generateMnemonic(256, secureRandom.randomBuffer)

if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Mnemonic Inválido")
}

// Converte a mnemônica para a seed
const seed = bip39.mnemonicToSeedSync(mnemonic)
let root = bip32.fromSeed(seed, network)

// Função para gerar múltiplos endereços
function generateAddresses(account, count) {
    let addresses = []
    
    for (let i = 0; i < count; i++) {
        let node = account.derive(0).derive(i)
        let btcAddress = bitcoin.payments.p2pkh({
            pubkey: node.publicKey,
            network: network,
        }).address
        
        addresses.push({
            address: btcAddress,
            // Evita exibir a chave privada diretamente no console
            // privateKey: node.toWIF() // <-- Descomente se necessário para uso seguro
        })

        // Limpa a chave privada da memória
        node.privateKey.fill(0)
    }
    
    return addresses
}

// Gera 5 endereços
let addressList = generateAddresses(root.derivePath(path), 5)

// Exibe os endereços
console.log("Mnemonic (guarde-a em segurança):", mnemonic)
console.log("Seed (hash):", seed.toString('hex'))

addressList.forEach((addr, index) => {
    console.log(`Endereço ${index + 1}: ${addr.address}`)
})

// Limpa a seed e outros dados sensíveis da memória
seed.fill(0)
mnemonic = null
root = null
