import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { useEffect, useRef, useState } from "react";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";


export default function home(){
  //跟踪用户的钱包是否链接
  const [walletConnected, setWalletConnected] = useState(false);
  //跟踪当前地址是否已经加入了白名单
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  //当我们等待交易被挖掘时，loading 设置为 true
  const [loading, setLoading] = useState(false);
  //跟踪白名单地址的数量
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  // 创建对 Web3（用于连接到 Metamask）的引用，只要页面打开它就会一直存在，返回同样的对象
  const web3modalRef = useRef();

 //返回以太坊 PRC 的 provider 或者 signer, true 为 signer，false 为 provider；
  const getProviderOrSinger = async (needSigner = false) =>{
    //连接现有的元掩码地址
    const provier = await web3modalRef.current.connect();
    //web3provider 自动检测 连接到现有的 Web3 provider （例如钱包 MetaMask），更换网络的时候，会自动刷新页面
    const web3Provider = new providers.web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 5){
      window.alert("change the network to Goerli!");
      //throw 抛出一个自定义错误
      //new Error 创建新的 Error 对象，并将 error.message 属性设置为提供的文本消息。如传入的对象为 message，调用String（message）生成文本消息。 
      throw new Error("Change network to Goerli");

      //如果需要 signer，则返回 signer，否则，返回 web3Provider
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;

      }
      return web3Provider;
    }
  };

  //将当前连接地址加入白名单：
  //1. 获得 signer
  //2. signer 用于链接现有的合约
  //3. 调用合约的 addAddressToWhitelist() 的功能
  const addAddressToWhitelist = async () =>{
    try{

      //获得一个签名者，因为这是一个 write 交易
      const signer = await getProviderOrSinger(true);

      //链接现有的合约，并具有 Owner 写入功能
      const whitelistCotract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      //调用合约中增加白名单的功能
      const tx = await whitelistCotract.addAddressToWhitelist();
      setLoading(true);
      //等待交易被挖掘
      await tx.wait();
      setLoading(false);
      //获取更新后的白名单地址数量,函数在后面
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true)

    }catch (err){
      console.error(err);
    }

  };

  // getNumberOfWhitelisted：获取白名单地址的个数
  const getNumberOfWhitelisted = async () => {

    try {

      const provider = await getProviderOrSinger();

      const whitelistCotract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _numberOfWitelisted = await whitelistCotract.numberAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWitelisted);


    } catch (err) {
      console.error(err);
    }
  };

    // checkIfAddressInWhitelist: 检查地址是否在白名单中
  const checkIfAddressInWhitelist = async () => {

    try {

    const signer = await getProviderOrSinger(true);
    const whitelistCotract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      signer,
    )

    const address = await signer.getAddress();

    const _joinedWhitelist = await whitelistCotract.whitelistedAddresses(
      address
    );

      setJoinedWhitelist(_joinedWhitelist);

    } catch(err){
      console.error(err);
    }
    };

    //connectWallet：连接 MetaMask 钱包

  const connectWallet = async () =>{
    try{
      await getProviderOrSinger();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();

    }catch(err){
      console.error(err);
    }
  };

  //renderButton：根据 dapp 的状态返回一个按钮
  const renderButton = () =>{
    //如果钱包链接了
    if (walletConnected){
      //如果加入了白名单地址
      if (joinedWhitelist){
        return(
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        //如果没有加入白名单，在 loading，就返回一个按钮-显示loading
        return <button className={style.button}>Loading...</button>;
      } else{
        // 如果没有加入白名单，也不在 loading，就返回一个按钮（链接到 addAddressToWhitelist 函数）
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      //如果钱包没有链接，就放回一个按钮（链接到 connectWallet 函数）
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  useEffect(() => {
    if (!walletConnected){
      web3modalRef.current = new Web3Modal({
        network:"goerli",
        providerOptions:{},
        disableInjectedProvider:false,
      });
      connectWallet();
    }
  },[walletConnected]);

  return (
    <div>
      <head><title>Whitelist Dapp</title>
      <meta name="description" content="Whitelist-Dapp"/>
      <link rel="icon" href="/favicon.ico"/>
      </head>
    
    <div className={styles.main}>
      <div>
        <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
        <div className={styles.description}>
          Its an NFT collection for developers in Crypto.
        </div>
        <div className={styles.description}>
          {numberOfWhitelisted} have already joined the Whitelist
        </div>
        {renderButton()}
      </div>
      <div>
        <img className={styles.image} src="./crypto-devs.svg"/>
      </div>

    </div>
      <footer className={styles.footer}>
        Made with &#10084;by Crypto Devs
      </footer>
    </div>

  );


}