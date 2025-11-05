import { useParams, Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export default function EventDetails({ events = [] }) {
  const { id } = useParams();
  const event = events.find((ev) => ev.id === parseInt(id));

  if (!event) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Link to="/events" className="text-blue-600 underline">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-80 object-cover rounded-lg mb-6"
      />
      <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
      <p className="text-gray-700 mb-6">{event.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" /> {event.date}
        </div>
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2" /> {event.time}
        </div>
        <div className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" /> {event.location}
        </div>
        <div className="flex items-center">
          <Users className="h-5 w-5 mr-2" /> {event.registered}/{event.capacity}{" "}
          registered
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-600">${event.price}</span>
        <Link
          to="/register"
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}
