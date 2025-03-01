import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios';
import PropTypes from 'prop-types';
import { FaHeart } from 'react-icons/fa';
import './App.css';

const loadFavorites = () => {
  const saved = localStorage.getItem('favorites');
  return saved ? JSON.parse(saved) : [];
};

// Admin Axios instance without hardcoded key
const adminApi = axios.create({
  baseURL: 'http://192.168.0.107:5000/api',
});

function Home({ qrCode }) {
  console.log('Rendering Home with QR Code:', qrCode);
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

function Menu({ menuItems, setMenuItems, favorites, toggleFavorite }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState(null);
  const navigate = useNavigate(); // For navigation to favorites page

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

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortOrder(null);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  };

  const handleFavoriteClick = (itemId) => {
    toggleFavorite(itemId);
    navigate('/favorites'); // Navigate to favorites page
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
                    onClick={() => handleFavoriteClick(item._id)}
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
  favorites: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleFavorite: PropTypes.func.isRequired,
};

function Favorites({ menuItems, favorites, toggleFavorite }) {
  const navigate = useNavigate();

  const favoriteItems = menuItems.filter((item) => favorites.includes(item._id));

  return (
    <div className="app-container">
      <header className="header">
        <h1>Your Favorites</h1>
        <p className="subtitle">Your Selected Delights</p>
      </header>
      <main className="main-content">
        <div className="favorites-list">
          {favoriteItems.length > 0 ? (
            <ul>
              {favoriteItems.map((item) => (
                <li key={item._id} className="favorite-item">
                  <span>{item.name}</span>
                  <span>₹{item.price.toFixed(2)}</span>
                  <button
                    className="remove-favorite-btn"
                    onClick={() => toggleFavorite(item._id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No favorites selected yet.</p>
          )}
          <button className="close-favorites-btn" onClick={() => navigate('/menu')}>
            Back to Menu
          </button>
        </div>
      </main>
      <footer className="footer">
        <p>© 2025 The Gourmet Haven. All rights reserved.</p>
      </footer>
    </div>
  );
}

Favorites.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  favorites: PropTypes.arrayOf(PropTypes.string).isRequired,
  toggleFavorite: PropTypes.func.isRequired,
};

function AdminForm({ setMenuItems, closeForm }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [id, setId] = useState('');
  const [adminKey, setAdminKey] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!adminKey) return alert('Please enter the admin key');
    try {
      const newItem = { name, description, price: parseFloat(price), category };
      const response = await adminApi.post('/menu', newItem, {
        headers: { 'X-Admin-Key': adminKey },
      });
      setMenuItems((prev) => [...prev, response.data]);
      resetForm();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Check admin key or server status.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!id) return alert('Please enter an ID to update');
    if (!adminKey) return alert('Please enter the admin key');
    try {
      const updatedItem = { name, description, price: parseFloat(price), category };
      const response = await adminApi.put(`/menu/${id}`, updatedItem, {
        headers: { 'X-Admin-Key': adminKey },
      });
      setMenuItems((prev) =>
        prev.map((item) => (item._id === id ? response.data : item))
      );
      resetForm();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Check admin key or server status.');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!id) return alert('Please enter an ID to delete');
    if (!adminKey) return alert('Please enter the admin key');
    try {
      await adminApi.delete(`/menu/${id}`, {
        headers: { 'X-Admin-Key': adminKey },
      });
      setMenuItems((prev) => prev.filter((item) => item._id !== id));
      resetForm();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Check admin key or server status.');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setId('');
  };

  return (
    <div className="admin-form">
      <h2>Manage Menu Items</h2>
      <form>
        <input
          type="password"
          placeholder="Admin Key"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="ID (for update/delete)"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <div>
          <button type="submit" onClick={handleAdd}>Add</button>
          <button type="submit" onClick={handleUpdate}>Update</button>
          <button type="submit" onClick={handleDelete}>Delete</button>
          <button type="button" onClick={closeForm}>Close</button>
        </div>
      </form>
    </div>
  );
}

AdminForm.propTypes = {
  setMenuItems: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
};

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [favorites, setFavorites] = useState(loadFavorites); // Moved to App level

  useEffect(() => {
    setLoading(true);
    console.log('Fetching data from backend...');
    Promise.all([
      axios.get('http://192.168.0.107:5000/api/menu'),
      axios.get('http://192.168.0.107:5000/api/qrcode'),
    ])
      .then(([menuRes, qrRes]) => {
        console.log('Menu Data:', menuRes.data);
        console.log('QR Code Data:', qrRes.data.qrCode);
        setMenuItems(menuRes.data);
        setQrCode(qrRes.data.qrCode);
      })
      .catch((err) => {
        console.error('Fetch Error:', err);
        setQrCode('');
      })
      .finally(() => {
        console.log('Loading complete');
        setLoading(false);
      });

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAdminForm((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  if (loading) {
    return (
      <div className="app-container loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Crafting Your Experience...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home qrCode={qrCode} />} />
        <Route
          path="/menu"
          element={
            <Menu
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          }
        />
        <Route
          path="/favorites"
          element={
            <Favorites
              menuItems={menuItems}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          }
        />
      </Routes>
      {showAdminForm && <AdminForm setMenuItems={setMenuItems} closeForm={() => setShowAdminForm(false)} />}
    </>
  );
}

export default App;