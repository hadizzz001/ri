"use client";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const locations = [
  { id: 1, name: "New York" },
  { id: 2, name: "Los Angeles" },
];

export default function AppointmentForm() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch available appointments when location changes
  const fetchAvailableDates = async (locationId) => {
    const response = await fetch(`/api/appointments?location=${locationId}`);
    const data = await response.json();
    setAvailableDates(data);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Book an Appointment</h2>

      <label className="block mb-2">Name:</label>
      <input className="w-full p-2 border rounded mb-3" type="text" />

      <label className="block mb-2">Phone:</label>
      <input className="w-full p-2 border rounded mb-3" type="tel" />

      <label className="block mb-2">Location:</label>
      <select
        className="w-full p-2 border rounded mb-3"
        onChange={(e) => {
          setSelectedLocation(e.target.value);
          fetchAvailableDates(e.target.value);
        }}
      >
        <option value="">Select Location</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </select>

      {selectedLocation && (
        <>
          <label className="block mb-2">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            includeDates={availableDates.map((d) => new Date(d))}
            className="w-full p-2 border rounded"
          />
        </>
      )}

      <button
        className="mt-4 w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        disabled={!selectedDate}
      >
        Book Appointment
      </button>
    </div>
  );
}
