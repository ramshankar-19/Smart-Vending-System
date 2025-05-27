import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReservationModal from './ReservationModal';
import api from '../services/api';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  
  const query = searchParams.get('q');

  useEffect(() => {
    if (query) {
      searchItems();
    }
  }, [query]);

  const searchItems = async () => {
    try {
      const response = await api.get(`/inventory/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveItem = (result) => {
    setSelectedItem({
      item: result.item,
      machine: result.machine
    });
    setShowReservationModal(true);
  };

  const handleReservationSuccess = () => {
    setShowReservationModal(false);
    setSelectedItem(null);
    searchItems(); // Refresh results
  };

  if (loading) {
    return <div className="loading">Searching...</div>;
  }

  return (
    <div className="search-results">
      <h1>Search Results for "{query}"</h1>
      
      {results.length === 0 ? (
        <div className="no-results">
          <p>No items found matching your search.</p>
        </div>
      ) : (
        <div className="results-grid">
          {results.map((result, index) => (
            <div key={index} className="result-card">
              <div className="item-info">
                <h3>{result.item.name}</h3>
                <p>{result.item.description}</p>
                <p className="item-price">₹{result.item.price}</p>
              </div>
              
              <div className="machine-info">
                <p><strong>Location:</strong> {result.machine.hostelName} - {result.machine.location}</p>
                <p><strong>Available:</strong> {result.availableQuantity} units</p>
              </div>
              
              <button
                className="reserve-button"
                onClick={() => handleReserveItem(result)}
                disabled={result.availableQuantity === 0}
              >
                Reserve
              </button>
            </div>
          ))}
        </div>
      )}

      {showReservationModal && selectedItem && (
        <ReservationModal
          item={selectedItem.item}
          machine={selectedItem.machine}
          onClose={() => setShowReservationModal(false)}
          onSuccess={handleReservationSuccess}
        />
      )}
    </div>
  );
};

export default SearchResults;
