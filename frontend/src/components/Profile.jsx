import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile({ apiUrl }) {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    profile_picture: '',
    phone: '',
    email: '',
    username: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/profile`);
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${apiUrl}/auth/profile`, {
        name: profile.name,
        bio: profile.bio,
        profile_picture: profile.profile_picture,
        phone: profile.phone
      });
      setProfile(response.data);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="empty-state"><p>Loading profile...</p></div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>👤 Profile</h2>

      <div className="chart-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: profile.profile_picture ? `url(${profile.profile_picture})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '40px',
            fontWeight: 'bold'
          }}>
            {!profile.profile_picture && (profile.name?.[0] || profile.username?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <h2>{profile.name || profile.username}</h2>
            <p style={{ color: '#666' }}>@{profile.username}</p>
          </div>
        </div>

        {!editing ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Email:</strong> <span style={{ marginLeft: '10px' }}>{profile.email}</span>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Name:</strong> <span style={{ marginLeft: '10px' }}>{profile.name || 'Not set'}</span>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Phone:</strong> <span style={{ marginLeft: '10px' }}>{profile.phone || 'Not set'}</span>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Bio:</strong> <p style={{ marginTop: '5px', color: '#666' }}>{profile.bio || 'No bio yet'}</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <strong>Member since:</strong> <span style={{ marginLeft: '10px' }}>{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Profile Picture URL</label>
              <input
                type="url"
                value={profile.profile_picture || ''}
                onChange={(e) => setProfile({ ...profile, profile_picture: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;