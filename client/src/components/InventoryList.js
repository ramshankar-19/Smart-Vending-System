// src/components/InventoryList.js
import React from 'react';
import './InventoryList.css';

const InventoryList = ({ inventory, onReserve }) => {
  const getAvailableQuantity = (item) => {
    return item.quantity - (item.reservedQuantity || 0);
  };

  return (
    <div className="inventory-list">
      {inventory.length === 0 ? (
        <p className="no-items">No items available in this machine.</p>
      ) : (
        <div className="items-grid">
          {inventory.map((inventoryItem) => {
            const availableQuantity = getAvailableQuantity(inventoryItem);
            const item = inventoryItem.item;
            
            return (
              <div key={item._id} className="item-card">
                <div className="item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="placeholder-image">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <p className="item-category">{item.category}</p>
                  
                  <div className="item-footer">
                    <span className="item-price">₹{item.price}</span>
                    <span className={`item-quantity ${availableQuantity === 0 ? 'out-of-stock' : ''}`}>
                      {availableQuantity > 0 ? `${availableQuantity} available` : 'Out of stock'}
                    </span>
                  </div>
                  
                  <button
                    className="reserve-button"
                    onClick={() => onReserve(item)}
                    disabled={availableQuantity === 0}
                  >
                    {availableQuantity > 0 ? 'Reserve' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryList;
