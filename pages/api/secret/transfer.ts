import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeUrl} from '@figment-secret/lib';
const {SecretNetworkClient, Wallet} = require('secretjs');

export default async function connect(
  req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  try {
    const url = getNodeUrl();
    const {mnemonic, txAmount, recipient} = req.body;

    // 1. Initialize the wallet with the given mnemonic
    //todo undefined
    // const wallet = undefined;
    const wallet = new Wallet(mnemonic);

    // 2. Initialize a secure Secret Network client
    // Pass in a wallet that can sign transactions
    // Docs: https://github.com/scrtlabs/secret.js#secretnetworkclient
    const client = new SecretNetworkClient({
      url: url,
      wallet: wallet,
      walletAddress: wallet.address,
      chainId: 'pulsar-2',
    });
    //todo undefined
    // const client = new SecretNetworkClient(undefined);

    // 3. Send tokens
    const memo = 'sendTokens example'; // Optional memo to identify the transaction

    //todo undefined
    const sent = await client.tx.bank.send(
      {
        amount: [{amount: txAmount, denom: 'uscrt'}],
        from_address: wallet.address,
        to_address: recipient,
      },
      {
        gasLimit: 20_000,
        gasPriceInFeeDenom: 0.25,
        memo: memo,
      },
    );

    res.status(200).json(sent.transactionHash);
  } catch (error) {
    console.error(error);
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
