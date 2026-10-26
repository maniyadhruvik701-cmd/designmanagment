import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Shirt, Image as ImageIcon, Video } from 'lucide-react';

export default function AddDesign() {
  const { addDesign } = useAppContext();
  const navigate = useNavigate();

  const [sourceUrl, setSourceUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const [formData, setFormData] = useState({
    photo: '',
    video: '',
    sku: '',
    price: '',
    description: '',
    platform: 'Shopify'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addDesign(formData);
    navigate('/pending');
  };

  const handleFetchDetails = async () => {
    if (!sourceUrl) return;
    setIsFetching(true);
    try {
      const res = await fetch(`http://localhost:5000/api/scrape?url=${encodeURIComponent(sourceUrl)}`);
      const data = await res.json();
      if (!data.error) {
        setFormData(prev => ({
          ...prev,
          price: data.price || prev.price,
          description: data.description || prev.description,
          photo: data.photo || prev.photo,
          platform: data.platform || prev.platform
        }));
      } else {
        alert('Could not fetch details from this URL.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch details. Is the backend running?');
    }
    setIsFetching(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', minHeight: '100vh', position: 'relative' }}>
      
      {/* Blue Header */}
      <div className="mobile-header">
        <Link to="/pending" style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft />
        </Link>
        Add New Design
      </div>

      {/* Image Placeholder Area */}
      <div className="image-placeholder-area">
        {formData.photo ? (
          <img src={formData.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Shirt size={80} color="#b0bec5" />
        )}
        
        {/* Floating Icons (Decorative for now, they just represent media) */}
        <div className="icon-button-group">
          <div className="circle-icon-btn"><ImageIcon /></div>
          <div className="circle-icon-btn"><Video /></div>
        </div>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
        
        <div className="material-input-group" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="url" 
              className="material-input" 
              placeholder="Paste product link here..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
            <label className="material-label">Product Source URL</label>
          </div>
          <button 
            type="button" 
            onClick={handleFetchDetails}
            disabled={isFetching}
            style={{ 
              padding: '10px 15px', 
              background: '#0d47a1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              height: '42px',
              marginTop: '15px'
            }}
          >
            {isFetching ? 'Fetching...' : 'Fetch'}
          </button>
        </div>

        <div className="material-input-group">
          <input 
            type="text" 
            name="sku"
            className="material-input" 
            placeholder="e.g. 107"
            value={formData.sku}
            onChange={handleChange}
            required
          />
          <label className="material-label">Design Name/Number*</label>
        </div>

        <div className="material-input-group">
          <input 
            type="number" 
            name="price"
            className="material-input" 
            placeholder="e.g. 2450"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <label className="material-label">Sales Price (₹)*</label>
        </div>

        <div className="material-input-group">
          <textarea 
            name="description"
            className="material-input" 
            placeholder="Enter description..."
            value={formData.description}
            onChange={handleChange}
          />
          <label className="material-label">Description</label>
        </div>

        <div className="material-input-group">
          <input 
            type="url" 
            name="photo"
            className="material-input" 
            placeholder="https://example.com/image.jpg"
            value={formData.photo}
            onChange={handleChange}
            required
          />
          <label className="material-label">Photo URL*</label>
        </div>

        <div className="material-input-group">
          <input 
            type="url" 
            name="video"
            className="material-input" 
            placeholder="https://example.com/video.mp4"
            value={formData.video}
            onChange={handleChange}
          />
          <label className="material-label">Video URL</label>
        </div>

        <div className="material-input-group">
          <select 
            name="platform"
            className="material-input" 
            value={formData.platform}
            onChange={handleChange}
          >
            <option value="Shopify">Shopify</option>
            <option value="Amazon">Amazon</option>
            <option value="Etsy">Etsy</option>
            <option value="Other">Other</option>
          </select>
          <label className="material-label">Platform</label>
        </div>

      </form>

      {/* Sticky Save Button */}
      <button 
        type="button" 
        onClick={handleSubmit} 
        className="btn btn-primary sticky-bottom-btn"
      >
        <Save size={20} />
        SAVE DESIGN
      </button>

    </div>
  );
}
