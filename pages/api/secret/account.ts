import type {NextApiRequest, NextApiResponse} from 'next';
import {Wallet} from 'secretjs';

type ResponseT = {
  mnemonic: string;
  address: string;
};
export default async function connect(
  _req: NextApiRequest,
  res: NextApiResponse<ResponseT | string>,
) {
  try {
    //todo back to undefined
    const wallet = new Wallet();
    const address = wallet.address;
    const mnemonic = wallet.mnemonic;
    res.status(200).json({mnemonic, address});
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
