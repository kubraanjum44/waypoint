import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "./api";
import "./PlaceDetails.css";
import PlaceMap from "./PlaceMap";

function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("waypoint_token");

  let currentUser = null;

  try {
    currentUser = JSON.parse(localStorage.getItem("waypoint_user") || "null");
  } catch {
    currentUser = null;
  }

  const currentUserId = currentUser?.id || currentUser?._id;

  const ownerId =
    typeof place?.owner === "object"
      ? place.owner?._id || place.owner?.id
      : place?.owner;

  const isOwner =
    Boolean(token) &&
    Boolean(currentUserId) &&
    Boolean(ownerId) &&
    String(currentUserId) === String(ownerId);

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

  if (loading) {
    return <p className="details-message">Loading place...</p>;
  }

  if (error) {
    return <p className="details-message">{error}</p>;
  }

  if (!place) {
    return <p className="details-message">Place not found.</p>;
  }

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

      {isOwner && (
        <button type="button" onClick={() => navigate(`/?edit=${place._id}`)}>
          Edit destination
        </button>
      )}

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
