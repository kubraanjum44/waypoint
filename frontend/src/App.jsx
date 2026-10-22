import { useEffect, useState } from "react";
import "./App.css";
import api from "./api";

function App() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">Waypoint.</h2>

        <div className="nav-links">
          <a href="#explore">Explore</a>
          <a href="#about">About</a>
          <button className="login-button">Log in</button>
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

        <section id="explore" className="explore-section">
          <p className="tagline">FIND YOUR NEXT DESTINATION</p>
          <h2>Explore the world</h2>

          {loading && <p>Loading places...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && places.length === 0 && (
            <div className="empty-state">
              <span>🌍</span>
              <h3>New places are coming soon</h3>
              <p>Our collection of destinations is being prepared.</p>
            </div>
          )}

          <div className="places-grid">
            {places.map((place) => (
              <article className="place-card" key={place._id}>
                {place.imageUrl && (
                  <img src={place.imageUrl} alt={place.name} />
                )}

                <div className="place-info">
                  <p className="tagline">{place.category}</p>
                  <h3>{place.name}</h3>
                  <p>{place.description}</p>
                  <p>📍 {place.location}</p>
                </div>
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

export default App;
