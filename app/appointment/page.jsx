'use client';
import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


export default function AppointmentPage() {
  // --- Appointment state ---
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
    const cities = [
      ...new Set(data.filter(d => d.info.country === country).map(d => d.info.city))
    ];
    setCityOptions(cities);
    setCity('');
    setSelectedDate(null);
    setAvailableDates([]);
    setAvailableHours([]);
    setSelectedHour('');
  }, [country]);

useEffect(() => {
  if (!country || !city) return;

  // Get all matching entries for country + city
  const matches = data.filter(d => d.info.country === country && d.info.city === city);

  // Flatten all dates into a single array
const allDates = matches.flatMap(match => match.info.dates.map(d => d.date.split('T')[0]));


  setAvailableDates(allDates);
  setSelectedDate(null);
  setAvailableHours([]);
  setSelectedHour('');
}, [city]);


useEffect(() => {
  if (!selectedDate || !country || !city) return;

  // Get all matching entries for country + city
  const matches = data.filter(d => d.info.country === country && d.info.city === city);
 

  // Find the date entry from any of the matches
const selectedLocal = formatLocalDate(selectedDate);

const dateEntry = matches
  .flatMap(m => m.info.dates)
  .find(d => d.date.split('T')[0] === selectedLocal);


  if (dateEntry) {
    const available = dateEntry.hours
      .filter(h => !h.booked)
      .map(h => h.hour);
    setAvailableHours(available);
  } else {
    setAvailableHours([]);
  }

  setSelectedHour('');
}, [selectedDate]);



// Returns the price with 150% increase if country is not Lebanon
const getEffectivePrice = (price) => {
  if (!country) return price; // no country selected yet
  return country !== 'Lebanon' ? (price * 2.5).toFixed(2) : price.toFixed(2);
};



const formatLocalDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isDateAvailable = (date) => {
  const formatted = formatLocalDate(date);
  return availableDates.includes(formatted);
};




const handleSubmit = async (e) => {
  e.preventDefault();

  // Convert cart object to array
  const cartArray = Object.values(cart); // Now it's an array of items

  // Check if reservation is outside Lebanon
  const isOutsideLebanon = country !== 'Lebanon';

  // Calculate totals
  let total = 0;
  const cartSummary = cartArray.map(item => {
    let price = Number(item.price); // Ensure it's a number

    // Apply 150% increase if outside Lebanon
    if (isOutsideLebanon) {
      price = price * 2.5; // original + 150%
    }

    const subtotal = price * item.qty;
    total += subtotal;

    return `${item.title} - $${price.toFixed(2)} x ${item.qty} = $${subtotal.toFixed(2)}`;
  }).join('\n');

  // Prepare data for API
  const data = {
    name: form.name,
    phone: form.phone,
    email: form.email,
    country,
    city,
    date: formatLocalDate(selectedDate),
    hour: selectedHour,
    cart: cartArray.map(item => ({
      title: item.title,
      price: isOutsideLebanon ? Number(item.price) * 2.5 : Number(item.price),
      qty: item.qty,
    })),
    total,
  };

  try {
    // 1. Send data to API
    const res = await fetch('/api/sendOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log('Data saved:', result);

    // 2. Build WhatsApp message
    const downPayment = (total * 0.25).toFixed(2); // 25% of total

    const message = `Note: to confirm the appointment there will be a down payment of $${downPayment}\n\nNew appointment:\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nCountry: ${data.country}\nCity: ${data.city}\nDate: ${data.date}\nHour: ${data.hour}\n\nService:\n${cartSummary}\n\nTotal: $${total.toFixed(2)}`;

    // 3. Redirect to WhatsApp
    const phoneNumber = '96176368475';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');

    window.location.reload();
  } catch (err) {
    console.error('Error submitting form:', err);
  }
};



 


  // --- ProductGrid state ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(setProducts);
  }, []);

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product._id]: { ...product, qty: 1 },
    }));
  };

  const increaseQty = (id) => {
    setCart(prev => ({
      ...prev,
      [id]: { ...prev[id], qty: prev[id].qty + 1 },
    }));
  };

  const decreaseQty = (id) => {
    setCart(prev => {
      const qty = prev[id].qty - 1;
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: { ...prev[id], qty },
      };
    });
  };

  // --- Check if form is valid ---
  const isFormValid = form.name && form.phone && form.email;
  const hasProducts = Object.keys(cart).length > 0;

  return (
    <div className="max-w-xl mx-auto p-4 bg-[#cab8ac] mt-20 mb-20">
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

          {/* Show button only if form is valid and at least one product is added */}
          {isFormValid && hasProducts && (
            <button type="submit" className="w-full selected-hour py-2 rounded">
              Continue to Payment
            </button>
          )}
        </form>
      )}

      {/* --- Product Grid Section --- */}
      <div className="pg-grid mt-10">
        {products.map(p => {
          const item = cart[p._id];
          return (
            <div key={p._id} className="pg-card border p-3 rounded mb-3">
              <div className="pg-info mb-2">
                <h3 className="pg-title font-semibold">{p.title}</h3>
                <p className="pg-cat text-sm">{p.cat}</p>
                <p className="pg-price font-bold">${getEffectivePrice(Number(p.price))}</p>
              </div>
              <div className="pg-action">
                {!item ? (
                  <button
                    onClick={() => addToCart(p)}
                    className="pg-add-btn border p-1 rounded"
                  >
                    Add
                  </button>
                ) : (
                  <div className="pg-qty flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(p._id)}
                      className="pg-qty-btn border px-2 rounded"
                    >
                      −
                    </button>
                    <span className="pg-qty-value">{item.qty}</span>
                    <button
                      onClick={() => increaseQty(p._id)}
                      className="pg-qty-btn border px-2 rounded"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
