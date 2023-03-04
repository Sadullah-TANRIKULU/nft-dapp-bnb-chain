import { ethers } from "ethers";
import { useEffect, useState } from "react";

const useContract = (_contractAddress, _contractAbi) => {
    const [contract, setContract] = useState(null);

    useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const _contract = new ethers.Contract(_contractAddress, _contractAbi, signer);
    setContract(_contract);    
    }, []);

return contract;

}

export default useContract;