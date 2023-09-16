const { generateUtil } = require("eth-delegatable-utils");
const BASE_AUTH = "0x0000000000000000000000000000000000000000000000000000000000000000";


/*
  params:
    name: string
    contract: ethers.Contract
    pk: string
    to: string
    caveats: array of objects
    authority: string
*/
function generateDelegation(
  contractInfo,
  pk,
  to,
  caveats = [],
  authority = BASE_AUTH
) {
  const DELEGATION = {
    delegate: to,
    authority: authority,
    caveats: caveats,
  };
  const delegatableUtils = generateUtil(contractInfo);
  const signedDelegation = delegatableUtils.signDelegation(DELEGATION, pk);

  return signedDelegation;
}

module.exports = generateDelegation;