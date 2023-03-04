import { useEffect, useState } from "react";
import useContract from "/hooks/useContract";
import useConnection from "/hooks/useConnection";
import { pattikkaaddress } from "../config";
import pattikkajson from "../artifacts/contracts/Patika.sol/Pattikka.json";
import { HiCloudUpload } from "react-icons/hi";

import styles from "../styles/Home.module.css";
import axios from "axios";
const Moralis = require("moralis").default;



export default function Home() {
  const [nftImage, setNftImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nfts, setNfts] = useState([]);

  const connection = useConnection();
  const contract = useContract(pattikkaaddress, pattikkajson.abi);


  const apiKey = process.env.NEXT_PUBLIC_PUBLICAPI_KEY;

  const handleChange = async (e) => {
    e.preventDefault();

    Moralis.start({
      apiKey: apiKey
    });
    if (e.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(e.target.files[0]);
      reader.onload = async () => {
        const base64 = reader.result;
        const uploadArray = [
          {
            path: "nftimage.png",
            content: base64
          }
        ];
        try {
          const response = await Moralis.EvmApi.ipfs.uploadFolder({
            abi: uploadArray
          });
          console.log(response.result[0].path);
          setNftImage(response.result[0].path);
        } catch (error) {
          console.error(error);
        }
      };
    }
  };  
    const handleSubmit = async (e) => {
      e.preventDefault();
      

      const uploadArray = [
        {
          path: `${name}.json`,
          content: {
            name: name,
            description: description,
            imageUrl: nftImage
          }
        }
      ];
        
        const response = await Moralis.EvmApi.ipfs.uploadFolder({
          abi: uploadArray
        });
        
        let uri = response.result[0].path;
        console.log(uri);
        
        await contract.safeMint(uri);
    };

    const getNfts = async () => {
      // console.log(contract);
      const nftCount = await contract.totalSupply();
      // console.log('geldi mi konsola-geldi mi konsola', nftCount);

      let nftse = [];

      for (let i = 0; i < nftCount; i++) {
        let uri = await contract.tokenURI(i);
        // console.log(uri);

        let data = await axios.get(uri);
        const owner = await contract.ownerOf(i);
        let item = {
          name: data.data.name,
          description: data.data.description,
          imageUrl: data.data.imageUrl,
          owner: owner
        }
        // console.log(item);
        nftse.push(item);
      }

      setNfts(nftse);
    }
    
    useEffect(() => {
      connection.connect();
        if (connection.address) {
      getNfts();

      }
    }, [connection.address]);

  return (
  <div className={styles.container} >
    <header><h2>NFT Mint Dapp</h2></header>
      <form onSubmit={handleSubmit} className={styles.nftForm} >
        <input type={"text"} onChange={(e) => setName(e.target.value)} placeholder="name" />
        <input type={"text"} onChange={(e) => setDescription(e.target.value)} placeholder="description" />
        <label htmlFor="fileUpload"><HiCloudUpload/> UPLOAD</label>
        <input type={"file"} onChange={handleChange} className={styles.fileInput} id={"fileUpload"} />
        <a id={"fileSelected"} >{nftImage ? nftImage : 'after succesful selection link will appear here'}</a>
        <button type="submit">MINT</button>
      </form>
    <div className={styles.nftList}>
      { nfts?.map((e, i) => 
      <div key={i} className={styles.nftCard} >
        <h2>{e.name}</h2>
        <p>{e.description}</p>
        <img src={e.imageUrl} width={"250px"} />
        <p>{e.owner}</p>
      </div> ) }
    </div>
  </div>
  );
}
