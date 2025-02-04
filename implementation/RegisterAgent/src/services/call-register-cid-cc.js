const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'config',  'connection-org1.json');
const walletPath = path.resolve(__dirname, '..', 'wallet');
const stringify = require('json-stringify-deterministic');

//This service creates a connection to the blockchain gateway an asks to create a execute the 
//updateCID contract from RegisterAuthor chaincode.
const callRegisterCIDCC = async (req, CID) => {
    //load config files and wallet identities.
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get('RegisterAgentUser');
    if (!identity) {
        console.log('An identity for the user "RegisterAgentUser" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return {
            status : 500,
            message : 'Service not available'
        }
    }
    //connect to the gateway and get contract.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'RegisterAgentUser', discovery: { enabled: true, asLocalhost: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('register','RegisterUpdate');
    try { //ask for the contract to be executed.
        var manifest;
        if(!req.body.manifest.versionID){
            manifest = JSON.parse(req.body.manifest);
        } else {
            manifest = req.body.manifest;
        }
        console.log(stringify(req.body.manifest));
        const result = await contract.submitTransaction('updateCID', req.body.authorKey.toString(), manifest.versionID.toString(), manifest.classID.toString(), stringify(CID));
        gateway.disconnect();
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        return {
            status : 201,
            message : result.toString()
        }
    }catch (error){
        gateway.disconnect();
        console.log(`Transaction has been evaluated, obtained following error: ${error.toString()}`);
        return {
            status : 403,
            message : error
        }
    }
}

module.exports = callRegisterCIDCC;