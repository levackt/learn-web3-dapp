import type {NextApiRequest, NextApiResponse} from 'next';
import {getNodeUrl} from '@figment-secret/lib';
import {SecretNetworkClient} from 'secretjs';

export default async function connect(
  _req: NextApiRequest,
  res: NextApiResponse<string>,
) {
  try {
    //todo back to undefined
    const url = getNodeUrl();
    const client = new SecretNetworkClient({url: url, chainId: 'pulsar-2'});
    const nodeInfo = await client.query.tendermint.getNodeInfo({});
    const version = nodeInfo.default_node_info?.version;
    res.status(200).json(version || 'unknown');
  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'Unknown Error';
    res.status(500).json(errorMessage);
  }
}
