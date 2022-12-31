const {Wallet, SecretNetworkClient} = require('secretjs');
import {getNodeUrl} from '@figment-secret/lib';
import type {NextApiRequest, NextApiResponse} from 'next';
import fs from 'fs';

const CONTRACT_PATH = './contracts/secret/contract.wasm';
const STORE_CODE_GAS_LIMIT = 1_000_000;
const INIT_GAS_LIMIT = 100_000;

type ResponseT = {
  contractAddress: string;
  transactionHash: string;
};
export default async function connect(
  req: NextApiRequest,
  res: NextApiResponse<ResponseT | string>,
) {
  try {
    const url = await getNodeUrl();
    const {mnemonic} = req.body;

    // Initialise client
    const wallet = new Wallet(mnemonic);
    const client = new SecretNetworkClient({
      url: url,
      wallet: wallet,
      walletAddress: wallet.address,
      chainId: 'pulsar-2',
    });

    // Upload the contract wasm
    const wasm = fs.readFileSync(CONTRACT_PATH);
    //todo undefined
    // const uploadReceipt = await client.tx.compute.undefined;
    const uploadReceipt = await client.tx.compute.storeCode(
      {
        sender: wallet.address,
        wasm_byte_code: wasm,
        source: '',
        builder: '',
      },
      {
        gasLimit: STORE_CODE_GAS_LIMIT,
      },
    );
    // Get the code ID from the receipt
    //todo undefined
    // const {codeId} = uploadReceipt;
    const codeId = Number(
      uploadReceipt.arrayLog.find(
        (log: {type: string; key: string}) =>
          log.type === 'message' && log.key === 'code_id',
      ).value,
    );

    // Create an instance of the Counter contract, providing a starting count
    const initMsg = {count: 101};
    const receipt = await client.tx.compute.instantiateContract(
      {
        code_id: codeId,
        sender: wallet.address,
        init_msg: initMsg,
        label: 'Simple Counter' + Math.ceil(Math.random() * 100000),
      },
      {
        gasLimit: INIT_GAS_LIMIT,
      },
    );
    //todo undefined
    // const contractAddress = undefined;
    const contractAddress = receipt.arrayLog.find(
      (log: {type: string; key: string}) =>
        log.type === 'message' && log.key === 'contract_address',
    ).value;

    res.status(200).json({
      contractAddress: contractAddress,
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
