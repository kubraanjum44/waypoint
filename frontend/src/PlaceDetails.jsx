import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "./api";
import "./PlaceDetails.css";

import PlaceMap from "./PlaceMap";


function PlaceDetails() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPlace() {
      try {
        const response = await api.get(`/places/${id}`);
        setPlace(response.data);
      } catch (error) {
        setError("Could not load this place.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlace();
  }, [id]);

  if (loading) return <p className="details-message">Loading place...</p>;
  if (error) return <p className="details-message">{error}</p>;
  if (!place) return <p className="details-message">Place not found.</p>;

  return (
    <main className="place-details">
      <Link to="/" className="back-link">
        ← Back to Waypoint
      </Link>

      {place.imageUrl && (
        <img className="details-image" src={place.imageUrl} alt={place.name} />
      )}

      <p className="tagline">{place.category}</p>
      <h1>{place.name}</h1>
      <p className="details-location">📍 {place.location}</p>
      <p className="details-description">{place.description}</p>

      <section className="map-section">
        <h2>Explore the location</h2>
        <p>Find {place.name} on the map.</p>

        <PlaceMap
          latitude={place.latitude}
          longitude={place.longitude}
          name={place.name}
        />
      </section>
    </main>
  );
}

export default PlaceDetails;
