import "./App.css";

function App() {
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
          <p className="section-text">
            Amazing places are waiting to be discovered.
          </p>

          <div className="empty-state">
            <span>🌍</span>
            <h3>New places are coming soon</h3>
            <p>
              Our collection of destinations is being prepared. Come back soon
              to discover something amazing.
            </p>
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
