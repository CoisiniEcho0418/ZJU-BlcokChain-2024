import React, { useState, useEffect } from 'react';
import { web3, buyMyRoomContract } from './utils/contracts'; // 导入web3实例和合约实例
import ErrorBoundary from './components/ErrorBoundary'; // 导入错误边界组件

interface House {
    owner: string; // 房屋拥有者地址
    price: string; // 房屋价格
    listedTimestamp: string; // 挂单时间戳
    isListed: boolean; // 是否在出售中
}

const App: React.FC = () => {
    const [account, setAccount] = useState<string>(''); // 用户账户地址
    const [balance, setBalance] = useState<string>(''); // 用户余额
    const [houses, setHouses] = useState<House[]>([]); // 所有挂牌出售的房屋
    const [myHouses, setMyHouses] = useState<House[]>([]); // 用户拥有的房屋
    const [price, setPrice] = useState<string>(''); // 挂单价格
    const [listTokenId, setListTokenId] = useState<string>(''); // 出售房屋的 Token ID
    const [buyTokenId, setBuyTokenId] = useState<string>(''); // 购买房屋的 Token ID
    const [manager, setManager] = useState<string>(''); // 管理员地址
    const [loading, setLoading] = useState<boolean>(false); // 加载状态
    const [error, setError] = useState<string>(''); // 错误信息
    const [mintAddress, setMintAddress] = useState<string>(''); // 被铸造房屋的用户地址

    useEffect(() => {
        const initWeb3 = async () => {
            setLoading(true);
            try {
                const accounts = await web3.eth.getAccounts(); // 获取用户账户
                setAccount(accounts[0]); // 设置当前账户
                await fetchBalance(); // 获取用户余额
                await fetchMyHouses(); // 获取用户拥有的房屋
                await fetchListedHouses(); // 获取所有挂牌出售的房屋
                await fetchManagerAddress(); // 获取管理员地址
            } catch (error) {
                setError('初始化失败，请重试。');
                console.error("Initialization error:", error);
            } finally {
                setLoading(false);
            }
        };
        initWeb3(); // 执行初始化
    }, []);

    const fetchManagerAddress = async () => {
        try {
            const managerAddress = await buyMyRoomContract.methods.getManager().call();
            // @ts-ignore
            setManager(managerAddress || '未获取到管理员地址'); // 设置管理员地址
        } catch (error) {
            setError("获取管理员地址失败，请重试。");
            console.error("Error fetching manager address:", error);
        }
    };

    const fetchBalance = async () => {
        try {
            const balanceWei = await web3.eth.getBalance(account);
            const balanceEth = web3.utils.fromWei(balanceWei, 'ether'); // 转换为以太币
            setBalance(balanceEth); // 设置用户余额
        } catch (error) {
            console.error("获取余额失败:", error);
        }
    };

    const mintHouse = async () => {
        if (!web3.utils.isAddress(mintAddress)) {
            alert("请输入有效的地址。");
            return;
        }

        // 确保用户是管理员
        if (account !== manager) {
            alert("只有管理员可以铸造房屋。");
            return;
        }

        setLoading(true);
        try {
            const newTokenId = await buyMyRoomContract.methods.mintHouse(mintAddress).send({ from: account });
            console.log("New Token ID:", newTokenId); // 显示新生成的 tokenId
            await fetchMyHouses(); // 更新用户拥有的房屋列表
            await fetchListedHouses(); // 更新所有挂牌出售的房屋列表
        } catch (error) {
            setError("铸造房屋失败，请重试。");
            console.error("Minting error:", error);
        } finally {
            setLoading(false);
        }
    };


    const listHouse = async () => {
        setLoading(true);
        try {
            await buyMyRoomContract.methods.listHouse(listTokenId, web3.utils.toWei(price, 'ether')).send({ from: account });
            await fetchMyHouses(); // 更新用户拥有的房屋列表
            await fetchListedHouses(); // 更新所有挂牌出售的房屋列表
        } catch (error) {
            setError("挂牌出售房屋失败，请重试。");
            console.error("Listing error:", error);
        } finally {
            setLoading(false);
        }
    };

    const buyHouse = async () => {
        setLoading(true);
        try {
            const house: House = await buyMyRoomContract.methods.houses(buyTokenId).call();
            await buyMyRoomContract.methods.buyHouse(buyTokenId).send({from: account, value: house.price, gas: String(3000000)});
            await fetchMyHouses(); // 更新用户拥有的房屋列表
            await fetchListedHouses(); // 更新所有挂牌出售的房屋列表
            await fetchBalance(); // 刷新余额
        } catch (error) {
            setError("购买房屋失败，请重试。");
            console.error("Buying error:", error);
        } finally {
            setLoading(false);
        }
    };


    const fetchMyHouses = async () => {
        try {
            const housesData: HouseDTO[] = await buyMyRoomContract.methods.getMyHouses().call({ from: account });
            setMyHouses(housesData); // 设置用户拥有的房屋数据
        } catch (error) {
            setError("获取您的房屋失败，请重试。");
            console.error("Fetching my houses error:", error);
        }
    };

    const fetchListedHouses = async () => {
        try {
            const listedHousesData: HouseDTO[] = await buyMyRoomContract.methods.getAllListedHouses().call();
            setHouses(listedHousesData); // 设置挂牌出售的房屋数据
        } catch (error) {
            setError("获取挂牌出售的房屋失败，请重试。");
            console.error("Fetching listed houses error:", error);
        }
    };

    return (
        <ErrorBoundary>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1 style={{ color: '#2c3e50' }}>BuyMyRoom DApp</h1>
                <p>您的账户: {account}</p>
                <p>管理员地址: {manager}</p>
                <p>您的余额: {balance} ETH</p> {/* 余额信息 */}
                <button onClick={fetchBalance} style={refreshButtonStyle}>刷新余额</button> {/* 刷新余额的按钮 */}

                {loading && <p>加载中...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <div style={sectionStyle}>
                    <h2 style={{ color: '#2980b9' }}>铸造新的房屋（需要管理员权限） NFT</h2>
                    <input
                        type="text"
                        placeholder="被铸造房屋的用户地址"
                        value={mintAddress}
                        onChange={(e) => setMintAddress(e.target.value)} // 更新用户地址
                        style={inputStyle}
                    />
                    <button onClick={mintHouse} style={buttonStyle}>铸造房屋</button>
                </div>

                <div style={sectionStyle}>
                    <h2 style={{ color: '#2980b9' }}>出售您的房屋</h2>
                    <input
                        type="text"
                        placeholder="House ID"
                        value={listTokenId}
                        onChange={(e) => setListTokenId(e.target.value)} // 更新 Token ID
                        style={inputStyle}
                    />
                    <input
                        type="text"
                        placeholder="价格（以 ETH 为单位）"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)} // 更新价格
                        style={inputStyle}
                    />
                    <button onClick={listHouse} style={buttonStyle}>挂牌出售</button>
                </div>

                <div style={sectionStyle}>
                    <h2 style={{ color: '#2980b9' }}>购买房屋</h2>
                    <input
                        type="text"
                        placeholder="要购买的 House ID"
                        value={buyTokenId}
                        onChange={(e) => setBuyTokenId(e.target.value)} // 更新 Token ID
                        style={inputStyle}
                    />
                    <button onClick={buyHouse} style={buttonStyle}>购买房屋</button>
                </div>

                <div style={sectionStyle}>
                    <h2 style={{ color: '#2980b9' }}>您的房屋</h2>
                    <button onClick={fetchMyHouses} style={refreshButtonStyle}>刷新</button>
                    <ul style={listStyle}>
                        {myHouses.map((house, index) => (
                            <li key={index}>
                                <strong>House ID:</strong> {index}, <strong>拥有者:</strong> {house.owner}, <strong>价格:</strong> {web3.utils.fromWei(house.price, 'ether')} ETH, <strong>挂单时间:</strong> {new Date(Number(house.listedTimestamp) * 1000).toLocaleString()}, <strong>在售:</strong> {house.isListed ? '是' : '否'}
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={sectionStyle}>
                    <h2 style={{ color: '#2980b9' }}>所有挂牌出售的房屋</h2>
                    <button onClick={fetchListedHouses} style={refreshButtonStyle}>刷新</button>
                    <ul style={listStyle}>
                        {houses.map((house, index) => (
                            <li key={index}>
                                <strong>House ID:</strong> {index}, <strong>拥有者:</strong> {house.owner}, <strong>价格:</strong> {web3.utils.fromWei(house.price, 'ether')} ETH, <strong>挂单时间:</strong> {new Date(Number(house.listedTimestamp) * 1000).toLocaleString()}, <strong>在售:</strong> {house.isListed ? '是' : '否'}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </ErrorBoundary>
    );
};

const buttonStyle = {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
};

const refreshButtonStyle = {
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    marginBottom: '10px',
};

const inputStyle = {
    padding: '10px',
    margin: '5px',
    borderRadius: '5px',
    border: '1px solid #ccc',
};

const listStyle = {
    listStyleType: 'none',
    padding: '0',
};

const sectionStyle = {
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '15px',
    margin: '15px 0',
};

export default App;