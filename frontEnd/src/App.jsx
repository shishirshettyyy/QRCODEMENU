import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FaHeart } from 'react-icons/fa';
import './App.css';

const loadFavorites = () => {
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : [];
};

function Home({ qrCode }) {
  console.log('Rendering Home with QR Code:', qrCode); // Debug QR code value
  return (
    <div className="app-container">
      <header className="header">
        <h1>The Gourmet Haven</h1>
        <p className="subtitle">Exquisite Dining, Curated for You</p>
      </header>
      <main className="main-content qr-centered">
        <div className="qrcode-wrapper">
          <h2 className="qrcode-title">Explore Our Menu</h2>
          {qrCode ? (
            <img src={qrCode} alt="Menu QR Code" className="qrcode" />
          ) : (
            <p className="loading-text">Preparing Your QR Code...</p>
          )}
          <p className="qrcode-instruction">Scan with your device to view</p>
        </div>
      </main>
      <footer className="footer">
        <p>© 2025 The Gourmet Haven. All rights reserved.</p>
      </footer>
    </div>
  );
}

Home.propTypes = {
  qrCode: PropTypes.string,
};

function Menu({ menuItems, setMenuItems }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState(null);
  const [favorites, setFavorites] = useState(loadFavorites);

  const categories = [
    'All',
    'Vegetarian',
    'Non-Vegetarian',
    'Breads',
    'Rice',
    'Snacks',
    'Desserts',
    'Beverages',
    'Tandoori',
  ];

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

        const response = await axios.get('http://192.168.0.107:5000/api/menu', { params });
        let items = response.data;

        if (sortOrder) {
          items = items.sort((a, b) =>
            sortOrder === 'asc' ? a.price - b.price : b.price - a.price
          );
        }

        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };

    fetchMenuItems();
  }, [searchTerm, selectedCategory, sortOrder, setMenuItems]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (itemId) => {
    setFavorites((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortOrder(null);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Our Culinary Collection</h1>
        <p className="subtitle">Savor the Finest Flavors</p>
      </header>
      <section className="search-filter-bar">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <button onClick={toggleSort} className="filter-btn sort-btn">
          {sortOrder === 'asc' ? '↑ Price Low-High' : sortOrder === 'desc' ? '↓ Price High-Low' : 'Sort by Price'}
        </button>
        <div className="category-filter-chips">
          {categories.map((category) => (
            <button
              key={category}
              className={`chip ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <button onClick={handleClear} className="filter-btn clear-btn">
          Clear
        </button>
      </section>
      <main className="main-content">
        <div className="menu-header">
          <p className="item-count">Showing {menuItems.length} items</p>
        </div>
        <div className="menu-grid">
          {Array.isArray(menuItems) && menuItems.length > 0 ? (
            menuItems.map((item) => (
              <article key={item._id} className="menu-item">
                <div className="item-header">
                  <h3 className="item-title">{item.name}</h3>
                  <button
                    className={`favorite-btn ${favorites.includes(item._id) ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(item._id)}
                  >
                    <FaHeart />
                  </button>
                </div>
                <p className="item-description">{item.description}</p>
                <p className="item-price">₹{item.price.toFixed(2)}</p>
              </article>
            ))
          ) : (
            <p className="no-items">No items match your search or filter.</p>
          )}
        </div>
      </main>
      <footer className="footer">
        <p>© 2025 The Gourmet Haven. All rights reserved.</p>
      </footer>
    </div>
  );
}

Menu.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  setMenuItems: PropTypes.func.isRequired,
};

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log('Fetching data from backend...'); // Debug start of fetch
    Promise.all([
      axios.get('http://192.168.0.107:5000/api/menu'), // Updated to backend port
      axios.get('http://192.168.0.107:5000/api/qrcode'), // Updated to backend port
    ])
      .then(([menuRes, qrRes]) => {
        console.log('Menu Data:', menuRes.data); // Debug menu response
        console.log('QR Code Data:', qrRes.data.qrCode); // Debug QR code response
        setMenuItems(menuRes.data);
        setQrCode(qrRes.data.qrCode);
      })
      .catch((err) => {
        console.error('Fetch Error:', err); // Log full error details
        setQrCode(''); // Fallback to empty string on error
      })
      .finally(() => {
        console.log('Loading complete'); // Debug end of fetch
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-container loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Crafting Your Experience...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home qrCode={qrCode} />} />
      <Route path="/menu" element={<Menu menuItems={menuItems} setMenuItems={setMenuItems} />} />
    </Routes>
  );
}

export default App;