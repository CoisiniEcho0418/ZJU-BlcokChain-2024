// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract BuyMyRoom is ERC721, Ownable {
    event HouseListed(uint256 tokenId, uint256 price, address owner);
    event HouseSold(uint256 tokenId, address newOwner, uint256 salePrice);

    struct House {
        address owner;           // 房屋拥有者
        uint256 price;          // 房屋价格
        uint256 listedTimestamp; // 挂单时间戳
        bool isListed;          // 是否在出售中
    }

    struct HouseDTO {
        uint256 houseId;
        address owner;           // 房屋拥有者
        uint256 price;          // 房屋价格
        uint256 listedTimestamp; // 挂单时间戳
        bool isListed;          // 是否在出售中
    }

    mapping(uint256 => House) public houses; // 存储房屋信息
    uint256 public nextHouseId = 0;               // 下一个房屋的houseId，初始值为0
    uint256 public feePercentage = 5;         // 手续费比例（0.5%）
    uint256 public maxFeePercentage = 20;     // 手续费最大比例（20%）
    address public manager;                    // 管理员，作为合约的部署者收取手续费

    constructor() ERC721("BuyMyRoom", "BMR") Ownable() {
        manager = msg.sender;
        console.log("Contract deployed by: %s", msg.sender);
    }

    function getManager() external view returns (address) {
        return manager;
    }

    // 铸造房屋NFT
    function mintHouse() external returns (uint256) {
        uint256 tokenId = nextHouseId++; // 使用nextHouseId
        _mint(msg.sender, tokenId);
        houses[tokenId] = House(msg.sender, 0, block.timestamp, false);
        console.log("House minted %s by %s", tokenId, msg.sender);
        return tokenId; // 返回新生成的 tokenId
    }

    // 挂单出售房屋
    function listHouse(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner"); // 确保调用者是房屋拥有者
        houses[tokenId].price = price;
        houses[tokenId].listedTimestamp = block.timestamp;
        houses[tokenId].isListed = true;
        emit HouseListed(tokenId, price, msg.sender);
        console.log("House listed %s for price %s by %s", tokenId, price, msg.sender);
    }

    // 购买房屋
    function buyHouse(uint256 tokenId) external payable {
        House memory house = houses[tokenId];
        require(house.isListed, "House not for sale"); // 确保房屋在出售中
        require(msg.value >= house.price, "Insufficient funds"); // 确保支付金额足够
        console.log("Buy house %s by %s with payment %s", tokenId, msg.sender, msg.value);

        // 计算挂单时长
        uint256 listingDuration = block.timestamp - house.listedTimestamp;
        // 计算手续费
        uint256 fee = (listingDuration * feePercentage * house.price) / 1000; // 手续费 = 挂单时长 * 固定比例 * 房产价格

        // 确保手续费不超过最大限制
        uint256 maxFee = (house.price * maxFeePercentage) / 100; // 最大手续费
        if (fee > maxFee) {
            fee = maxFee; // 限制手续费为最大手续费
        }

        // 将NFT转移给新拥有者
        _transfer(ownerOf(tokenId), msg.sender, tokenId);

        payable(manager).transfer(fee); // 将手续费转给合约部署者
        payable(house.owner).transfer(house.price - fee); // 将剩余款项转给房屋卖家

        houses[tokenId].owner = msg.sender; // 更新房屋拥有者
        houses[tokenId].isListed = false; // 房屋状态改为未出售
        emit HouseSold(tokenId, msg.sender, house.price);
        console.log("House sold %s to %s with fee %s", tokenId, msg.sender, fee);
    }

    // 获取房屋信息
    function getHouseInfo(uint256 tokenId) external view returns (House memory) {
        console.log("Fetching info for house %s", tokenId);
        return houses[tokenId];
    }

    // 获取用户拥有的房屋列表
    function getMyHouses() external view returns (HouseDTO[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextHouseId; i++) {
            if (houses[i].owner == msg.sender) {
                count++;
            }
        }

        HouseDTO[] memory myHouses = new HouseDTO[](count); // 创建一个数组存储用户的房屋信息
        uint256 index = 0;
        console.log("User: %s", msg.sender);
        for (uint256 i = 0; i < nextHouseId; i++) {
            if (houses[i].owner == msg.sender) {
                // 填充用户拥有的房屋信息
                myHouses[index++] = HouseDTO({
                    houseId: i,
                    owner: houses[i].owner,
                    price: houses[i].price,
                    listedTimestamp: houses[i].listedTimestamp,
                    isListed: houses[i].isListed
                });
                console.log("Found house for user %s", i);
            }
        }
        return myHouses;
    }

    // 获取所有出售中的房屋
    function getAllListedHouses() external view returns (HouseDTO[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextHouseId; i++) {
            if (houses[i].isListed) {
                count++;
            }
        }

        HouseDTO[] memory listedHouses = new HouseDTO[](count); // 创建一个数组存储所有出售中的房屋信息
        uint256 index = 0;
        console.log("User: %s", msg.sender);
        for (uint256 i = 0; i < nextHouseId; i++) {
            if (houses[i].isListed) {
                // 填充出售中的房屋信息
                listedHouses[index++] = HouseDTO({
                    houseId: i,
                    owner: houses[i].owner,
                    price: houses[i].price,
                    listedTimestamp: houses[i].listedTimestamp,
                    isListed: houses[i].isListed
                });
                console.log("Found listed house %s", i);
            }
        }
        return listedHouses;
    }
}
