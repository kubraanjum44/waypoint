import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import api from "./api";
import PlaceDetails from "./PlaceDetails";

function AuthModal({ onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const payload =
        mode === "register"
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password };
      const response = await api.post(endpoint, payload);
      const { token, user } = response.data || {};
      if (!token || !user) {
        throw new Error(
          "Authentication response was incomplete. Check your backend auth route.",
        );
      }
      localStorage.setItem("waypoint_token", token);
      localStorage.setItem("waypoint_user", JSON.stringify(user));
      onLogin(user);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <section
        className="auth-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="auth-close"
          type="button"
          onClick={onClose}
          aria-label="Close login"
        >
          ×
        </button>
        <p className="tagline">
          {mode === "login" ? "WELCOME BACK" : "JOIN WAYPOINT"}
        </p>
        <h2 id="auth-title">
          {mode === "login" ? "Log in" : "Create account"}
        </h2>
        <p>
          {mode === "login"
            ? "Sign in to share places you love."
            : "Create an account to share your discoveries."}
        </p>
        <form className="auth-form" onSubmit={submit}>
          {mode === "register" && (
            <label>
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                autoComplete="name"
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </label>
          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy}>
            {busy
              ? "Please wait..."
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>
        <p className="auth-switch">
          {mode === "login"
            ? "Don't have an account? "
            : "Already registered? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </section>
    </div>
  );
}

function HomePage({ user, onOpenAuth, onLogout }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Nature");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const response = await api.get("/places");
        setPlaces(Array.isArray(response.data) ? response.data : []);
      } catch (fetchError) {
        console.error("Loading places failed:", fetchError);
        setError("Could not load places. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchPlaces();
  }, []);

  async function handleAddPlace(event) {
    event.preventDefault();
    if (!user) {
      setMessage("Please log in before sharing a place.");
      onOpenAuth();
      return;
    }

    const placeData = {
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      category,
      imageUrl: "",
      latitude: latitude.trim() === "" ? undefined : Number(latitude),
      longitude: longitude.trim() === "" ? undefined : Number(longitude),
    };

    if (!placeData.name || !placeData.description || !placeData.location) {
      setMessage("Please fill in the place name, description, and location.");
      return;
    }
    if ((latitude.trim() === "") !== (longitude.trim() === "")) {
      setMessage(
        "Please enter both latitude and longitude, or leave both blank.",
      );
      return;
    }
    if (
      (placeData.latitude !== undefined &&
        (!Number.isFinite(placeData.latitude) ||
          placeData.latitude < -90 ||
          placeData.latitude > 90)) ||
      (placeData.longitude !== undefined &&
        (!Number.isFinite(placeData.longitude) ||
          placeData.longitude < -180 ||
          placeData.longitude > 180))
    ) {
      setMessage(
        "Please enter valid coordinates. Latitude: -90 to 90; longitude: -180 to 180.",
      );
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      if (imageFile) {
        setImageUploading(true);
        const formData = new FormData();
        formData.append("image", imageFile);
        const uploadResponse = await api.post("/uploads", formData);
        placeData.imageUrl = uploadResponse.data.imageUrl;
      }

      const response = await api.post("/places", placeData);
      setPlaces((currentPlaces) => [response.data, ...currentPlaces]);
      setName("");
      setDescription("");
      setLocation("");
      setLatitude("");
      setLongitude("");
      setCategory("Nature");
      setImageFile(null);
      event.target.reset();
      setMessage("Place added successfully! 🎉");
    } catch (addError) {
      console.error("Add place failed:", addError.response?.data || addError);
      setMessage(
        addError.response?.data?.message ||
          "Could not add place. Please try again.",
      );
    } finally {
      setSaving(false);
      setImageUploading(false);
    }
  }

  async function handleDeletePlace(place) {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (
      String(place.owner?._id || place.owner || "") !==
      String(user.id || user._id || "")
    ) {
      setMessage("You can only delete places you own.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this place?")) return;
    try {
      await api.delete(`/places/${place._id}`);
      setPlaces((currentPlaces) =>
        currentPlaces.filter((item) => item._id !== place._id),
      );
      setMessage("Place deleted successfully! 🗑️");
    } catch (deleteError) {
      console.error("Delete failed:", deleteError);
      setMessage(
        deleteError.response?.data?.message ||
          "Could not delete place. Please try again.",
      );
    }
  }

  const filteredPlaces = places.filter((place) => {
    const searchText = search.toLowerCase();
    const matchesSearch =
      (place.name || "").toLowerCase().includes(searchText) ||
      (place.location || "").toLowerCase().includes(searchText) ||
      (place.description || "").toLowerCase().includes(searchText);
    const matchesCategory =
      selectedCategory === "All" || place.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="logo">
          Waypoint.
        </Link>
        <div className="nav-links">
          <a href="/#explore">Explore</a>
          <a href="/#about">About</a>
          {user ? (
            <>
              <span className="nav-user">Hi, {user.name || "traveller"}</span>
              <button className="login-button" type="button" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <button className="login-button" type="button" onClick={onOpenAuth}>
              Log in / Sign up
            </button>
          )}
        </div>
      </nav>

      <main>
        <section className="hero">
          <p className="tagline">YOUR NEXT ADVENTURE STARTS HERE</p>
          <h1>
            Discover places.
            <br />
            Create memories.
          </h1>
          <p className="hero-text">
            Find beautiful places, explore new destinations, and share your
            favorite spots with the world.
          </p>
          <a href="#explore" className="explore-button">
            Explore places →
          </a>
        </section>

        <section className="add-place-section" id="share">
          <p className="tagline">SHARE YOUR DISCOVERY</p>
          <h2>Add a new place</h2>
          <p>
            {user
              ? "Know somewhere beautiful? Share it with everyone."
              : "Log in to share a place with the community."}
          </p>

          {user ? (
            <form onSubmit={handleAddPlace} className="place-form">
              <input
                type="text"
                placeholder="Place name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
              <textarea
                placeholder="Describe this place"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Location (e.g. Chennai, India)"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required
              />
              <div className="coordinate-fields">
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  placeholder="Latitude (e.g. 13.0500)"
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                />
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  placeholder="Longitude (e.g. 80.2824)"
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                />
              </div>
              <p className="coordinate-help">
                Coordinates are optional. Enter both to show this place on the
                map.
              </p>
              <label className="image-upload-label">
                Destination photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setImageFile(event.target.files?.[0] || null)
                  }
                />
              </label>
              {imageFile && <p>Selected: {imageFile.name}</p>}
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="Nature">Nature</option>
                <option value="Beach">Beach</option>
                <option value="City">City</option>
                <option value="Food">Food</option>
                <option value="Historical">Historical</option>
                <option value="Adventure">Adventure</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit" disabled={saving}>
                {imageUploading
                  ? "Uploading photo..."
                  : saving
                    ? "Adding place..."
                    : "Add Place →"}
              </button>
              {message && <p role="status">{message}</p>}
            </form>
          ) : (
            <button className="login-button" type="button" onClick={onOpenAuth}>
              Log in to add a place
            </button>
          )}
        </section>

        <section id="explore" className="explore-section">
          <p className="tagline">FIND YOUR NEXT DESTINATION</p>
          <h2>Explore the world</h2>
          <div className="place-filters">
            <input
              type="search"
              placeholder="Search places or locations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="All">All categories</option>
              <option value="Nature">Nature</option>
              <option value="Beach">Beach</option>
              <option value="City">City</option>
              <option value="Food">Food</option>
              <option value="Historical">Historical</option>
              <option value="Adventure">Adventure</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {loading && <p>Loading places...</p>}
          {error && <p role="alert">{error}</p>}
          {!loading && !error && places.length === 0 && (
            <div className="empty-state">
              <span>🌍</span>
              <h3>New places are coming soon</h3>
              <p>Our collection of destinations is being prepared.</p>
            </div>
          )}
          {!loading &&
            !error &&
            places.length > 0 &&
            filteredPlaces.length === 0 && (
              <p>No places found. Try another search! 🌍</p>
            )}
          <div className="places-grid">
            {filteredPlaces.map((place) => (
              <article className="place-card" key={place._id}>
                <Link
                  to={`/places/${place._id}`}
                  className="place-card-content"
                >
                  {place.imageUrl && (
                    <img src={place.imageUrl} alt={place.name} />
                  )}
                  <div className="place-info">
                    <p className="tagline">{place.category}</p>
                    <h3>{place.name}</h3>
                    <p>{place.description}</p>
                    <p>📍 {place.location}</p>
                    <span className="place-card-link">View details →</span>
                  </div>
                </Link>
                {user &&
                  String(place.owner?._id || place.owner || "") ===
                    String(user.id || user._id || "") && (
                    <div className="place-actions">
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `/places/${place._id}?edit=true`;
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlace(place)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="about-section">
          <h2>Every place has a story.</h2>
          <p>
            Waypoint helps people discover places and share the locations that
            make life memorable.
          </p>
        </section>
      </main>
      <footer>
        <p>Waypoint. Discover somewhere new.</p>
      </footer>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("waypoint_user") || "null");
    } catch {
      return null;
    }
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState("");

  function logout() {
    localStorage.removeItem("waypoint_token");
    localStorage.removeItem("waypoint_user");
    setUser(null);
    setAuthNotice("You have logged out.");
    window.location.assign("/");
  }

  return (
    <>
      {authNotice && (
        <p className="auth-status" role="status">
          {authNotice}
        </p>
      )}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              onOpenAuth={() => setAuthOpen(true)}
              onLogout={logout}
            />
          }
        />
        <Route path="/places/:id" element={<PlaceDetails />} />
      </Routes>
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onLogin={(nextUser) => {
            setUser(nextUser);
            setAuthNotice(`Welcome, ${nextUser.name || "traveller"}!`);
          }}
        />
      )}
    </>
  );
}

export default App;
