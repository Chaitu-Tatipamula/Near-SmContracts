# NEAR NFT JavaScript 


## Prerequisites

* [Node.js](/develop/prerequisites#nodejs)
* [NEAR Wallet Account](wallet.testnet.near.org)
* [NEAR-CLI](https://docs.near.org/tools/near-cli#setup)
* [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable)

# Quick-Start 



## Mint An NFT

Once you've created your near wallet go ahead and login to your wallet with your cli and follow the on-screen prompts

```=bash
near login
```

Once your logged in you have to deploy the contract. Make a subaccount with the name of your choosing 

```=bash 
near create-account nft-example.your-account.testnet --masterAccount your-account.testnet --initialBalance 10
```

After you've created your sub account deploy the contract to that sub account, set this variable to your sub account name

```=bash
NFT_CONTRACT_ID=nft-example.your-account.testnet

MAIN_ACCOUNT=your-account.testnet
```

Verify your new variable has the correct value
```=bash
echo $NFT_CONTRACT_ID

echo $MAIN_ACCOUNT
```


### Deploy Your Contract
```=bash
near deploy --accountId $NFT_CONTRACT_ID --wasmFile build/nft.wasm
```

### Initialize Your Contract 

```=bash
near call $NFT_CONTRACT_ID init '{"owner_id": "'$NFT_CONTRACT_ID'"}' --accountId $NFT_CONTRACT_ID
```

### View Contracts Meta Data

```=bash
near view $NFT_CONTRACT_ID nft_metadata
```
### Minting Token

```bash=
near call $NFT_CONTRACT_ID nft_mint '{"token_id": "token-1", "metadata": {"title": "My Non Fungible Team Token", "description": "The Team Most Certainly Goes :)", "media": "https://bafybeiftczwrtyr3k7a2k4vutd3amkwsmaqyhrdzlhvpt33dyjivufqusq.ipfs.dweb.link/goteam-gif.gif"}, "receiver_id": "'$MAIN_ACCOUNT'"}' --accountId $MAIN_ACCOUNT --amount 0.1
```

After you've minted the token go to wallet.testnet.near.org to `your-account.testnet` and look in the collections tab and check out your new sample NFT! 



## View NFT Information

After you've minted your NFT you can make a view call to get a response containing the `token_id` `owner_id` and the `metadata`

```bash=
near view $NFT_CONTRACT_ID nft_token '{"token_id": "token-1"}'
```

## Transfering NFTs

To transfer an NFT go ahead and make another [testnet wallet account](https://wallet.testnet.near.org).

Then run the following
```bash=
MAIN_ACCOUNT_2=your-second-wallet-account.testnet
```

Verify the correct variable names with this

```=bash
echo $NFT_CONTRACT_ID

echo $MAIN_ACCOUNT

echo $MAIN_ACCOUNT_2
```

To initiate the transfer..

```bash=
near call $NFT_CONTRACT_ID nft_transfer '{"receiver_id": "$MAIN_ACCOUNT_2", "token_id": "token-1", "memo": "Go Team :)"}' --accountId $MAIN_ACCOUNT --depositYocto 1
```

In this call you are depositing 1 yoctoNEAR for security and so that the user will be redirected to the NEAR wallet.