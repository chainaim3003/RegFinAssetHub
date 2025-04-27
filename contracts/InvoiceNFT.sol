// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
// import '@openzeppelin/contracts/access/Ownable.sol';
// import '@openzeppelin/contracts/utils/Counters.sol';

// contract InvoiceNFT is ERC721, Ownable {
//   using Counters for Counters.Counter;
//   Counters.Counter private _tokenIds;

//   struct Invoice {
//     uint256 tokenId;
//     address seller;
//     uint256 price;
//     bool isForSale;
//     bool complianceVerified;
//     bool isFrozen;
//   }

//   // Mapping from token ID to Invoice details
//   mapping(uint256 => Invoice) public invoices;

//   // Mapping to track if an address is an authorized oracle
//   mapping(address => bool) public authorizedOracles;

//   // Mapping to track if an address is a freezer
//   mapping(address => bool) public authorizedFreezers;

//   // Mapping to track frozen sellers
//   mapping(address => bool) public frozenSellers;

//   event InvoiceRegistered(uint256 tokenId, address seller, uint256 price);
//   event InvoiceSold(
//     uint256 tokenId,
//     address seller,
//     address buyer,
//     uint256 price
//   );
//   event ComplianceUpdated(uint256 tokenId, bool complianceStatus);
//   event SellerFrozen(address seller, string reason);
//   event SellerUnfrozen(address seller);
//   event NFTFrozen(uint256 tokenId, string reason);
//   event NFTUnfrozen(uint256 tokenId);

//   constructor() ERC721('InvoiceNFT', 'INV') Ownable(msg.sender) {
//     // Initialize contract
//   }

//   // Replacement for _exists function
//   function _tokenExists(uint256 tokenId) internal view returns (bool) {
//     return _ownerOf(tokenId) != address(0);
//   }

//   modifier onlyOracle() {
//     require(authorizedOracles[msg.sender], 'Not authorized oracle');
//     _;
//   }

//   modifier onlyFreezer() {
//     require(authorizedFreezers[msg.sender], 'Not authorized freezer');
//     _;
//   }

//   function addOracle(address oracle) external onlyOwner {
//     authorizedOracles[oracle] = true;
//   }

//   function removeOracle(address oracle) external onlyOwner {
//     authorizedOracles[oracle] = false;
//   }

//   function addFreezer(address freezer) external onlyOwner {
//     authorizedFreezers[freezer] = true;
//   }

//   function removeFreezer(address freezer) external onlyOwner {
//     authorizedFreezers[freezer] = false;
//   }

//   function freezeSeller(
//     address seller,
//     string memory reason
//   ) external onlyFreezer {
//     require(!frozenSellers[seller], 'Seller already frozen');
//     frozenSellers[seller] = true;
//     emit SellerFrozen(seller, reason);
//   }

//   function unfreezeSeller(address seller) external onlyFreezer {
//     require(frozenSellers[seller], 'Seller not frozen');
//     frozenSellers[seller] = false;
//     emit SellerUnfrozen(seller);
//   }

//   function freezeNFT(
//     uint256 tokenId,
//     string memory reason
//   ) external onlyFreezer {
//     require(_tokenExists(tokenId), 'Token does not exist');
//     require(!invoices[tokenId].isFrozen, 'NFT already frozen');
//     invoices[tokenId].isFrozen = true;
//     emit NFTFrozen(tokenId, reason);
//   }

//   function unfreezeNFT(uint256 tokenId) external onlyFreezer {
//     require(_tokenExists(tokenId), 'Token does not exist');
//     require(invoices[tokenId].isFrozen, 'NFT not frozen');
//     invoices[tokenId].isFrozen = false;
//     emit NFTUnfrozen(tokenId);
//   }

//   function registerInvoice(uint256 price) external returns (uint256) {
//     require(!frozenSellers[msg.sender], 'Seller is frozen');

//     _tokenIds.increment();
//     uint256 newTokenId = _tokenIds.current();

//     _mint(msg.sender, newTokenId);

//     invoices[newTokenId] = Invoice({
//       tokenId: newTokenId,
//       seller: msg.sender,
//       price: price,
//       isForSale: true,
//       complianceVerified: false,
//       isFrozen: false
//     });

//     emit InvoiceRegistered(newTokenId, msg.sender, price);
//     return newTokenId;
//   }

//   function updateCompliance(
//     uint256 tokenId,
//     bool complianceStatus
//   ) external onlyOracle {
//     require(_tokenExists(tokenId), 'Token does not exist');
//     require(!invoices[tokenId].isFrozen, 'NFT is frozen');
//     invoices[tokenId].complianceVerified = complianceStatus;
//     emit ComplianceUpdated(tokenId, complianceStatus);
//   }

//   function buyInvoice(uint256 tokenId) external payable {
//     require(_tokenExists(tokenId), 'Token does not exist');
//     Invoice storage invoice = invoices[tokenId];

//     require(!frozenSellers[msg.sender], 'Buyer is frozen');
//     require(!frozenSellers[invoice.seller], 'Seller is frozen');
//     require(!invoice.isFrozen, 'NFT is frozen');
//     require(invoice.isForSale, 'Invoice is not for sale');
//     require(invoice.complianceVerified, 'Invoice compliance not verified');
//     require(msg.value >= invoice.price, 'Insufficient payment');

//     address seller = invoice.seller;
//     require(seller != msg.sender, 'Cannot buy your own invoice');

//     // Transfer the NFT
//     _transfer(seller, msg.sender, tokenId);

//     // Transfer the payment using call() instead of transfer()
//     (bool sent, ) = payable(seller).call{value: msg.value}('');
//     require(sent, 'Failed to send Ether');

//     // Update invoice status
//     invoice.isForSale = false;
//     invoice.seller = msg.sender;

//     emit InvoiceSold(tokenId, seller, msg.sender, invoice.price);
//   }

//   function listForSale(uint256 tokenId, uint256 price) external {
//     require(_tokenExists(tokenId), 'Token does not exist');
//     require(!frozenSellers[msg.sender], 'Seller is frozen');
//     require(!invoices[tokenId].isFrozen, 'NFT is frozen');
//     require(ownerOf(tokenId) == msg.sender, 'Not the owner');

//     invoices[tokenId].price = price;
//     invoices[tokenId].isForSale = true;
//   }

//   function removeFromSale(uint256 tokenId) external {
//     require(_tokenExists(tokenId), 'Token does not exist');
//     require(!frozenSellers[msg.sender], 'Seller is frozen');
//     require(!invoices[tokenId].isFrozen, 'NFT is frozen');
//     require(ownerOf(tokenId) == msg.sender, 'Not the owner');

//     invoices[tokenId].isForSale = false;
//   }

//   function getInvoiceDetails(
//     uint256 tokenId
//   )
//     external
//     view
//     returns (
//       address seller,
//       uint256 price,
//       bool isForSale,
//       bool complianceVerified,
//       bool isFrozen
//     )
//   {
//     require(_tokenExists(tokenId), 'Token does not exist');
//     Invoice storage invoice = invoices[tokenId];
//     return (
//       invoice.seller,
//       invoice.price,
//       invoice.isForSale,
//       invoice.complianceVerified,
//       invoice.isFrozen
//     );
//   }

//   function isSellerFrozen(address seller) external view returns (bool) {
//     return frozenSellers[seller];
//   }

//   function isNFTFrozen(uint256 tokenId) external view returns (bool) {
//     require(_tokenExists(tokenId), 'Token does not exist');
//     return invoices[tokenId].isFrozen;
//   }
// }
