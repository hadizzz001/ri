'use client';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function AppointmentPage() {
  const [data, setData] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedHour, setSelectedHour] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  useEffect(() => {
    fetch('/api/apoint')
      .then(res => res.json())
      .then(json => {
        setData(json);
        const countries = [...new Set(json.map(item => item.info.country))];
        setCountryOptions(countries);
      });
  }, []);

  useEffect(() => {
    if (!country) return;
    const cities = [...new Set(data.filter(d => d.info.country === country).map(d => d.info.city))];
    setCityOptions(cities);
    setCity('');
    setSelectedDate(null);
    setAvailableDates([]);
    setAvailableHours([]);
    setSelectedHour('');
  }, [country]);

  useEffect(() => {
    if (!country || !city) return;
    const match = data.find(d => d.info.country === country && d.info.city === city);
    if (match) {
      setAvailableDates(match.info.dates.map(d => d.date.split('T')[0]));
    } else {
      setAvailableDates([]);
    }
    setSelectedDate(null);
    setAvailableHours([]);
    setSelectedHour('');
  }, [city]);

  useEffect(() => {
    if (!selectedDate || !country || !city) return;
    const match = data.find(d => d.info.country === country && d.info.city === city);
    const dateString = selectedDate.toISOString().split('T')[0];
    const dateEntry = match?.info.dates.find(d => d.date.startsWith(dateString));
    if (dateEntry) {
      const available = dateEntry.hours.filter(h => !h.booked).map(h => h.hour);
      setAvailableHours(available);
    } else {
      setAvailableHours([]);
    }
    setSelectedHour('');
  }, [selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      name: form.name,
      phone: form.phone,
      email: form.email,
      country,
      city,
      date: selectedDate?.toISOString().split('T')[0],
      hour: selectedHour,
    });
  };

  const isDateAvailable = (date) => {
    const formatted = date.toISOString().split('T')[0];
    return availableDates.includes(formatted);
  };

  return (
    <div className="max-w-xl mx-auto  p-4    bg-[#cab8ac] mt-20 mb-20">
      <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>

      <label className="block mb-2 font-semibold">Select Country</label>
      <select
        value={country}
        onChange={e => setCountry(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">-- Select Country --</option>
        {countryOptions.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {country && (
        <>
          <label className="block mb-2 font-semibold">Select City</label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value="">-- Select City --</option>
            {cityOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </>
      )}

      {availableDates.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Select a Day</h2>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileDisabled={({ date }) => !isDateAvailable(date)}
          />
        </div>
      )}

      {selectedDate && availableHours.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Select a Time</h2>
          <div className="grid grid-cols-3 gap-2">
            {availableHours.map(hour => (
              <button
                key={hour}
                onClick={() => setSelectedHour(hour)}
                className={`p-2 rounded border text-center text-sm myGray ${selectedHour === hour ? 'selected-hour' : ''}`}
              >
                {hour}
              </button>

            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedHour && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone"
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="w-full selected-hour py-2 rounded">
            Continue to Payment
          </button>
        </form>
      )}
    </div>
  );
}
