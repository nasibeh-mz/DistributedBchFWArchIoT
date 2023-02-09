const verifyUpdate = require("../services/verify-update");
const createUpdateRegister = require('../services/create-update-register');

//this controller mamanges the process for asking for an update to be stored in the blockchain.
const registerUpdate = (req) =>{
    //verifies that the req has the correct keys.
    let  verifiable = verifyUpdate(req);
    if(!verifiable){
        return {
            status : 405,
            message : 'Input not valid'
        }
    }
    //create an UpdateRegister Object in case we need to store it.
    const updateRegister = createUpdateRegister(req);
    //Store update on db
    //CALL CHAINCODE
    return {
        status : 201,
        message : updateRegister
    }
    
}

module.exports = registerUpdate;