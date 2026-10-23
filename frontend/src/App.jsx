import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import api from "./api";
import PlaceDetails from "./PlaceDetails";

function HomePage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setPlaces(response.data);
      } catch (error) {
        setError("Could not load places. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, []);

  async function handleAddPlace(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await api.post("/places", {
        name,
        description,
        location,
        category,
      });

      setPlaces((currentPlaces) => [response.data, ...currentPlaces]);

      setName("");
      setDescription("");
      setLocation("");
      setCategory("Nature");
      setMessage("Place added successfully! 🎉");
    } catch (error) {
      setMessage("Could not add place. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const filteredPlaces = places.filter((place) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      (place.name || "").toLowerCase().includes(searchText) ||
      (place.location || "").toLowerCase().includes(searchText);

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
          <a href="#explore">Explore</a>
          <a href="#about">About</a>
          <button
            className="login-button"
            onClick={() => setMessage("Login is coming soon! Stay tuned. 🚀")}
          >
            Log in
          </button>
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

        <section className="add-place-section">
          <p className="tagline">SHARE YOUR DISCOVERY</p>
          <h2>Add a new place</h2>
          <p>Know somewhere beautiful? Share it with everyone.</p>

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
              {saving ? "Adding place..." : "Add Place →"}
            </button>

            {message && <p role="status">{message}</p>}
          </form>
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
          {error && <p>{error}</p>}

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
              <Link
                to={`/places/${place._id}`}
                className="place-card"
                key={place._id}
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
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/places/:id" element={<PlaceDetails />} />
    </Routes>
  );
}

export default App;
