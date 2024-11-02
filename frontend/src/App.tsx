import React, { useState, useEffect } from 'react';
import { web3, buyMyRoomContract } from './utils/contracts';
import ErrorBoundary from './components/ErrorBoundary';

interface House {
    owner: string;
    price: string;
    listedTimestamp: string;
    isListed: boolean;
}

interface HouseDTO {
    houseId: string;
    owner: string;
    price: string;
    listedTimestamp: string;
    isListed: boolean;
}

const App: React.FC = () => {
    const [account, setAccount] = useState<string>('');
    const [balance, setBalance] = useState<string>('');
    const [houses, setHouses] = useState<HouseDTO[]>([]);
    const [myHouses, setMyHouses] = useState<HouseDTO[]>([]);
    const [price, setPrice] = useState<string>('');
    const [listTokenId, setListTokenId] = useState<string>('');
    const [buyTokenId, setBuyTokenId] = useState<string>('');
    const [manager, setManager] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const initWeb3 = async () => {
            setLoading(true);
            try {
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);
                await fetchData(); // Fetch data on mount
            } catch (error) {
                console.error("Initialization error:", error);
                // window.alert('初始化失败，请重试。');
                setErrorMessage("初始化失败，请重试。");
            } finally {
                setLoading(false);
            }
        };
        initWeb3();
    }, []);

    const fetchData = async () => {
        await fetchBalance();
        await fetchMyHouses();
        await fetchListedHouses();
        await fetchManagerAddress();
    };

    const fetchManagerAddress = async () => {
        try {
            const managerAddress = await buyMyRoomContract.methods.getManager().call();
            // @ts-ignore
            setManager(managerAddress || '未获取到管理员地址');
        } catch (error) {
            console.error("获取管理员地址失败:", error);
            // window.alert("获取管理员地址失败，请重试。");
            setErrorMessage("获取管理员地址失败，请重试。");
        }
    };

    const fetchBalance = async () => {
        try {
            const balanceWei = await web3.eth.getBalance(account);
            const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
            setBalance(balanceEth);
        } catch (error) {
            console.error("获取余额失败:", error);
            setErrorMessage("获取余额失败，请重试。");
        }
    };

    const mintHouse = async () => {
        setLoading(true);
        try {
            await buyMyRoomContract.methods.mintHouse().send({ from: account });
            await fetchData(); // Re-fetch data after minting
        } catch (error) {
            console.error("铸造房屋失败:", error);
            // window.alert("铸造房屋失败，请重试。");
            setErrorMessage("铸造房屋失败，请重试。");
        } finally {
            setLoading(false);
        }
    };

    const listHouse = async () => {
        setLoading(true);
        try {
            await buyMyRoomContract.methods.listHouse(listTokenId, web3.utils.toWei(price, 'ether')).send({ from: account });
            await fetchData(); // Re-fetch data after listing
        } catch (error) {
            console.error("挂牌出售房屋失败:", error);
            // window.alert("挂牌出售房屋失败，请重试。");
            setErrorMessage("挂牌出售房屋失败，请重试。");
        } finally {
            setLoading(false);
        }
    };

    const buyHouse = async () => {
        setLoading(true);
        try {
            const house: House = await buyMyRoomContract.methods.houses(buyTokenId).call();
            await buyMyRoomContract.methods.buyHouse(buyTokenId).send({ from: account, value: house.price, gas: String(3000000) });
            await fetchData(); // Re-fetch data after buying
        } catch (error) {
            console.error("购买房屋失败:", error);
            // window.alert("购买房屋失败，请重试。");
            setErrorMessage("购买房屋失败，请重试。");
        } finally {
            setLoading(false);
        }
    };

    const fetchMyHouses = async () => {
        try {
            const housesData: HouseDTO[] = await buyMyRoomContract.methods.getMyHouses().call({ from: account });
            setMyHouses(housesData);
        } catch (error) {
            console.error("获取您的房屋失败:", error);
            // window.alert("获取您的房屋失败，请重试。");
            setErrorMessage("获取您的房屋失败，请重试。");
        }
    };

    const fetchListedHouses = async () => {
        try {
            const listedHousesData: HouseDTO[] = await buyMyRoomContract.methods.getAllListedHouses().call();
            setHouses(listedHousesData);
        } catch (error) {
            console.error("获取挂牌出售的房屋失败:", error);
            // window.alert("获取挂牌出售的房屋失败，请重试。");
            setErrorMessage("获取挂牌出售的房屋失败，请重试。");
        }
    };

    const clearError = () => {
        setErrorMessage('');
    };

    return (
        <ErrorBoundary>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1 style={{ color: '#2c3e50' }}>BuyMyRoom DApp</h1>
                <p>您的账户: {account}</p>
                <p>您的余额: {balance} ETH</p>
                <p>管理员账户: {manager}</p>
                <button onClick={fetchBalance} style={refreshButtonStyle}>刷新余额</button>

                {loading && <p>加载中...</p>}

                {/*{errorMessage && (*/}
                {/*    <div style={{ color: 'red', marginBottom: '10px' }}>*/}
                {/*        <p>{errorMessage}</p>*/}
                {/*        <button onClick={clearError} style={buttonStyle}>确定</button>*/}
                {/*    </div>*/}
                {/*)}*/}

                <div style={sectionStyle}>
                    <h2 style={{ color: '#2980b9' }}>申领新的房屋 NFT</h2>
                    <button onClick={mintHouse} style={buttonStyle}>申领房屋</button>
                </div>

                <div style={sectionStyle}>
                    <h2 style={{ color: '#2980b9' }}>出售您的房屋</h2>
                    <input
                        type="text"
                        placeholder="House ID"
                        value={listTokenId}
                        onChange={(e) => setListTokenId(e.target.value)}
                        style={inputStyle}
                    />
                    <input
                        type="text"
                        placeholder="价格（以 ETH 为单位）"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
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
                        onChange={(e) => setBuyTokenId(e.target.value)}
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
                                <strong>House ID:</strong> {house.houseId.toString()},
                                <strong>拥有者:</strong> {house.owner},
                                <strong>价格:</strong> {web3.utils.fromWei(house.price.toString(), 'ether')} ETH,
                                <strong>挂单时间:</strong> {new Date(Number(house.listedTimestamp) * 1000).toLocaleString()},
                                <strong>在售:</strong> {house.isListed ? '是' : '否'}
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
                                <strong>House ID:</strong> {house.houseId.toString()},
                                <strong>拥有者:</strong> {house.owner},
                                <strong>价格:</strong> {web3.utils.fromWei(house.price.toString(), 'ether')} ETH,
                                <strong>挂单时间:</strong> {new Date(Number(house.listedTimestamp) * 1000).toLocaleString()},
                                <strong>在售:</strong> {house.isListed ? '是' : '否'}
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
