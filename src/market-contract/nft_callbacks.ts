import { assert, near, UnorderedSet } from "near-sdk-js";
import { Contract, DELIMETER } from ".";
import { Sale } from "./sale";
import { internalSupplyByOwnerId } from "./sale_views";

/// where we add the sale because we know nft owner can only call nft_approve
export function internalNftOnApprove({
    contract,
    tokenId,
    ownerId,
    approvalId,
    msg
}:{ 
    contract: Contract, 
    tokenId: string, 
    ownerId: string, 
    approvalId: number, 
    msg: string 
}) {
    // get the contract ID which is the predecessor
    let contractId = near.predecessorAccountId();
    //get the signer which is the person who initiated the transaction
    let signerId = near.signerAccountId();
    
    //make sure that the signer isn't the predecessor. This is so that we're sure
    //this was called via a cross-contract call
    assert(signerId != contractId, "this function can only be called via a cross-contract call");
    //make sure the owner ID is the signer. 
    assert(ownerId == signerId, "only the owner of the token can approve it");
    
    //we need to enforce that the user has enough storage for 1 EXTRA sale.  
    let storageAmount = contract.storage_minimum_balance();
    //get the total storage paid by the owner
    let ownerPaidStorage = contract.storageDeposits.get(signerId) || BigInt(0);
    //get the storage required which is simply the storage for the number of sales they have + 1 
    let signerStorageRequired = (BigInt(internalSupplyByOwnerId({contract, accountId: signerId})) + BigInt(1)) * BigInt(storageAmount); 
    
    //make sure that the total paid is >= the required storage
    assert(ownerPaidStorage >= signerStorageRequired, "the owner does not have enough storage to approve this token");
    
    //if all these checks pass we can create the sale conditions object.
    let saleConditions = JSON.parse(msg);
    if (!saleConditions.hasOwnProperty('sale_conditions') || Object.keys(saleConditions).length != 1) {
        near.panic("invalid sale conditions");
    }
    //create the unique sale ID which is the contract + DELIMITER + token ID
    let contractAndTokenId = `${contractId}${DELIMETER}${tokenId}`;
    
    //insert the key value pair into the sales map. Key is the unique ID. value is the sale object
    contract.sales.set(contractAndTokenId, new Sale({
        ownerId: ownerId, //owner of the sale / token
        approvalId: approvalId, //approval ID for that token that was given to the market
        nftContractId: contractId, //NFT contract the token was minted on
        tokenId: tokenId, //the actual token ID
        saleConditions: saleConditions.sale_conditions //the sale conditions 
    }));
    // Handle byOwnerId
    let byOwnerId = contract.byOwnerId.get(ownerId);
    let ownerSet: Set<string>;
    if (Array.isArray(byOwnerId)) {
        ownerSet = new Set<string>(byOwnerId);
    } else {
        ownerSet = new Set<string>();
    }

    ownerSet.add(contractAndTokenId);
    contract.byOwnerId.set(ownerId, Array.from(ownerSet));

    // Handle byNftContractId
    let byNftContractId = contract.byNftContractId.get(contractId);
    let nftSet: Set<string>;
    if (Array.isArray(byNftContractId)) {
        nftSet = new Set<string>(byNftContractId);
    } else {
        nftSet = new Set<string>();
    }

    nftSet.add(tokenId);
    contract.byNftContractId.set(contractId, Array.from(nftSet));

}