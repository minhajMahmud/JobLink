# Frontend Integration Guide - Profile Edit System

## Quick Start for React Developers

This guide shows you how to integrate the Profile Edit API into your React frontend.

---

## 🔌 API Endpoints

```
Base URL: http://localhost:8000

GET  /api/profile          - Get user profile
PUT  /api/profile          - Update profile
POST /api/profile/image    - Upload profile image
```

---

## 🔐 Authentication

All requests require these headers:

```javascript
{
  'x-user-id': 'user-uuid-here',
  'x-user-role': 'candidate' // or 'recruiter' or 'admin'
}
```

---

## 📝 React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useProfile = (userId, userRole) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = 'http://localhost:8000/api/profile';
  
  const headers = {
    'x-user-id': userId,
    'x-user-role': userRole,
  };

  // Get profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers,
      });
      const data = await response.json();
      
      if (data.status) {
        setProfile(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    setLoading(true);
    try {
      const response = await fetch(baseUrl, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      
      if (data.status) {
        setProfile(data.data);
        return { success: true, data: data.data };
      } else {
        setError(data.message);
        return { success: false, errors: data.errors };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Upload profile image
  const uploadImage = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${baseUrl}/image`, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await response.json();
      
      if (data.status) {
        setProfile(prev => ({ ...prev, avatar_url: data.data.url }));
        return { success: true, url: data.data.url };
      } else {
        setError(data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadImage,
    refetch: fetchProfile,
  };
};

export default useProfile;
```

---

## 🎨 Profile Edit Form Component

```javascript
import React, { useState } from 'react';
import useProfile from './hooks/useProfile';

const ProfileEditForm = ({ userId, userRole }) => {
  const { profile, loading, updateProfile, uploadImage } = useProfile(userId, userRole);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        headline: profile.headline || '',
        location: profile.location || '',
        website: profile.website || '',
        skills: profile.skills || [],
        experience_years: profile.experience_years || 0,
        education_level: profile.education_level || 'Bachelor',
        availability_status: profile.availability_status || '',
        salary_min: profile.salary_min || '',
        salary_max: profile.salary_max || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSkillsChange = (skills) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'File size must be less than 2MB' }));
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, GIF, and WebP images are allowed' }));
      return;
    }

    const result = await uploadImage(file);
    if (!result.success) {
      setErrors(prev => ({ ...prev, image: result.error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = await updateProfile(formData);
    
    if (!result.success) {
      if (result.errors) {
        setErrors(result.errors);
      }
    } else {
      alert('Profile updated successfully!');
    }
  };

  if (loading && !profile) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="profile-edit-form">
      <h2>Edit Profile</h2>

      {/* Profile Image */}
      <div className="form-group">
        <label>Profile Image</label>
        {profile?.avatar_url && (
          <img src={profile.avatar_url} alt="Profile" className="profile-image" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleImageUpload}
        />
        {errors.image && <span className="error">{errors.image}</span>}
      </div>

      {/* Basic Info */}
      <div className="form-group">
        <label>First Name *</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        {errors.first_name && <span className="error">{errors.first_name}</span>}
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
        />
        {errors.last_name && <span className="error">{errors.last_name}</span>}
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label>Headline</label>
        <input
          type="text"
          name="headline"
          value={formData.headline}
          onChange={handleChange}
          placeholder="e.g., Senior Software Engineer"
        />
        {errors.headline && <span className="error">{errors.headline}</span>}
      </div>

      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., San Francisco, CA"
        />
        {errors.location && <span className="error">{errors.location}</span>}
      </div>

      <div className="form-group">
        <label>Website</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://yourwebsite.com"
        />
        {errors.website && <span className="error">{errors.website}</span>}
      </div>

      <div className="form-group">
        <label>Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="5"
          placeholder="Tell us about yourself..."
        />
        {errors.bio && <span className="error">{errors.bio}</span>}
      </div>

      {/* Candidate-specific fields */}
      {userRole === 'candidate' && (
        <>
          <div className="form-group">
            <label>Skills</label>
            <SkillsInput
              skills={formData.skills}
              onChange={handleSkillsChange}
            />
            {errors.skills && <span className="error">{errors.skills}</span>}
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              min="0"
            />
            {errors.experience_years && <span className="error">{errors.experience_years}</span>}
          </div>

          <div className="form-group">
            <label>Education Level</label>
            <select
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
            >
              <option value="High School">High School</option>
              <option value="Bachelor">Bachelor's Degree</option>
              <option value="Master">Master's Degree</option>
              <option value="PhD">PhD</option>
            </select>
            {errors.education_level && <span className="error">{errors.education_level}</span>}
          </div>

          <div className="form-group">
            <label>Availability Status</label>
            <input
              type="text"
              name="availability_status"
              value={formData.availability_status}
              onChange={handleChange}
              placeholder="e.g., Open to opportunities"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Minimum Salary</label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                min="0"
                placeholder="50000"
              />
              {errors.salary_min && <span className="error">{errors.salary_min}</span>}
            </div>

            <div className="form-group">
              <label>Maximum Salary</label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                min="0"
                placeholder="100000"
              />
              {errors.salary_max && <span className="error">{errors.salary_max}</span>}
            </div>
          </div>
          {errors.salary && <span className="error">{errors.salary}</span>}
        </>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
};

// Simple Skills Input Component
const SkillsInput = ({ skills, onChange }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim() && !skills.includes(input.trim())) {
      onChange([...skills, input.trim()]);
      setInput('');
    }
  };

  const handleRemove = (skill) => {
    onChange(skills.filter(s => s !== skill));
  };

  return (
    <div className="skills-input">
      <div className="skills-list">
        {skills.map(skill => (
          <span key={skill} className="skill-tag">
            {skill}
            <button type="button" onClick={() => handleRemove(skill)}>×</button>
          </span>
        ))}
      </div>
      <div className="skills-add">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder="Add a skill"
        />
        <button type="button" onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
```

---

## 📋 Field Reference

### All Users

```javascript
{
  first_name: string,      // Required
  last_name: string,
  phone: string,
  bio: string,
  headline: string,
  location: string,
  website: string,         // Must be valid URL
  avatar_url: string       // Set via image upload
}
```

### Candidates Only

```javascript
{
  skills: string[],                    // Array of strings
  experience_years: number,            // >= 0
  education_level: string,             // "High School" | "Bachelor" | "Master" | "PhD"
  availability_status: string,
  salary_min: number,                  // >= 0
  salary_max: number                   // >= salary_min
}
```

---

## ⚠️ Error Handling

```javascript
const result = await updateProfile(data);

if (!result.success) {
  if (result.errors) {
    // Validation errors (field-specific)
    console.log(result.errors);
    // { first_name: "First name is required", website: "Invalid URL" }
  } else {
    // General error
    console.log(result.error);
  }
}
```

---

## 🎯 Common Use Cases

### 1. Update Only Name and Bio

```javascript
await updateProfile({
  first_name: 'John',
  last_name: 'Doe',
  bio: 'Software engineer'
});
```

### 2. Update Skills

```javascript
await updateProfile({
  skills: ['PHP', 'JavaScript', 'React', 'MySQL']
});
```

### 3. Update Salary Range

```javascript
await updateProfile({
  salary_min: 80000,
  salary_max: 120000
});
```

### 4. Upload Profile Image

```javascript
const file = event.target.files[0];
const result = await uploadImage(file);

if (result.success) {
  console.log('Image URL:', result.url);
}
```

---

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| `first_name` | Required, max 100 chars |
| `website` | Must be valid URL |
| `skills` | Must be array |
| `experience_years` | Must be >= 0 |
| `education_level` | Must be one of: "High School", "Bachelor", "Master", "PhD" |
| `salary_min` | Must be >= 0 |
| `salary_max` | Must be >= salary_min |
| Profile image | Max 2MB, JPEG/PNG/GIF/WebP only |

---

## 🚀 Ready to Use!

The backend API is fully functional and tested. Just integrate these examples into your React app and you're good to go!

For more details, see `COMPLETE_PROFILE_EDIT_DOCUMENTATION.md`.
