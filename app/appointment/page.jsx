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
  const [errors, setErrors] = useState({});
  const [isArabic, setIsArabic] = useState(false);

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



// Returns the price with 300% increase if country is not Lebanon
const getEffectivePrice = (price) => {
  if (!country) return price; // no country selected yet
  return country !== 'Lebanon' ? (price * 4).toFixed(2) : price.toFixed(2);
};



const formatLocalDate = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isDateAvailable = (date) => {
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  
  const formatted = formatLocalDate(date);
  return availableDates.includes(formatted);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate form
  const newErrors = {};
  if (!form.name.trim()) newErrors.name = 'Name is required';
  if (!form.phone.trim()) newErrors.phone = 'Phone is required';
  if (!form.email.trim()) newErrors.email = 'Email is required';
  else if (!isValidEmail(form.email)) newErrors.email = 'Email format is invalid';
  if (!country) newErrors.country = 'Country is required';
  if (!city) newErrors.city = 'City is required';
  if (!selectedDate) newErrors.date = 'Date is required';
  if (!selectedHour) newErrors.hour = 'Time is required';
  if (Object.keys(cart).length === 0) newErrors.cart = 'Please select at least one service';

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});

  // Convert cart object to array
  const cartArray = Object.values(cart); // Now it's an array of items

  // Check if reservation is outside Lebanon
  const isOutsideLebanon = country !== 'Lebanon';

  // Calculate totals
  let total = 0;
  const cartSummary = cartArray.map(item => {
    let price = Number(item.price); // Ensure it's a number

    // Apply 300% increase if outside Lebanon
    if (isOutsideLebanon) {
      price = price * 4; // original + 300%
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
      price: isOutsideLebanon ? Number(item.price) * 4 : Number(item.price),
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

    let message;
    if (isArabic) {
      message = `ملاحظة: لتأكيد الموعد سيكون هناك دفعة أولى بنسبة 25% من المبلغ الإجمالي\n\nموعد جديد:\nالاسم: ${data.name}\nالهاتف: ${data.phone}\nالبريد الإلكتروني: ${data.email}\nالدولة: ${data.country}\nالمدينة: ${data.city}\nالتاريخ: ${data.date}\nالوقت: ${data.hour}\n\nالخدمة:\n${cartSummary}\n\nالإجمالي: $${total.toFixed(2)}\n\nالدفعة الأولى: $${downPayment}`;
    } else {
      message = `Note: to confirm the appointment there will be a down payment of $${downPayment}\n\nNew appointment:\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nCountry: ${data.country}\nCity: ${data.city}\nDate: ${data.date}\nHour: ${data.hour}\n\nService:\n${cartSummary}\n\nTotal: $${total.toFixed(2)}`;
    }

    // 3. Redirect to WhatsApp
    const phoneNumber = '96178808100';
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
      {errors.country && <p className="text-red-600 text-sm mb-4">{errors.country}</p>}

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
          {errors.city && <p className="text-red-600 text-sm mb-4">{errors.city}</p>}
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
          {errors.date && <p className="text-red-600 text-sm mt-2">{errors.date}</p>}
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
          {errors.hour && <p className="text-red-600 text-sm mt-2">{errors.hour}</p>}
        </div>
      )}

      {city && (
        <div className="mt-4 mb-4 flex items-center">
          <input
            type="checkbox"
            id="arabicCheckbox"
            checked={isArabic}
            onChange={e => setIsArabic(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="arabicCheckbox" className="ml-2 font-semibold">عربي - Arabic</label>
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
          {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          
          <input
            name="phone"
            value={form.phone}
            onChange={e => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setForm({ ...form, phone: value });
            }}
            placeholder="Phone"
            required
            className="w-full p-2 border rounded"
          />
          {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
          
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
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

      {/* Submit Button at the End */}
      {selectedDate && selectedHour && (
        <div className="mt-6 mb-4">
          {errors.cart && <p className="text-red-600 text-sm mb-3">{errors.cart}</p>}
          
          {/* Order Summary */}
          {Object.keys(cart).length > 0 && (
            <div className="bg-gray-100 p-4 rounded mb-4 border">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 mb-3">
                {Object.values(cart).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.title} x{item.qty}</span>
                    <span>${(getEffectivePrice(Number(item.price)) * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 font-semibold flex justify-between">
                <span>Total:</span>
                <span>${Object.values(cart).reduce((acc, item) => {
                  const price = Number(getEffectivePrice(Number(item.price)));
                  return acc + (price * item.qty);
                }, 0).toFixed(2)}</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleSubmit} 
            disabled={!form.name || !form.phone || !form.email || Object.keys(cart).length === 0}
            className={`w-full py-2 rounded font-semibold ${
              form.name && form.phone && form.email && Object.keys(cart).length > 0
                ? 'selected-hour cursor-pointer'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            Continue to Payment
          </button>

          {/* Validation Errors Display */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-500 rounded">
              <p className="font-bold text-lg text-red-700 mb-2">Please fix the following errors:</p>
              <ul className="text-red-600 font-semibold text-base">
                {errors.name && <li>• {errors.name}</li>}
                {errors.phone && <li>• {errors.phone}</li>}
                {errors.email && <li>• {errors.email}</li>}
                {errors.country && <li>• {errors.country}</li>}
                {errors.city && <li>• {errors.city}</li>}
                {errors.date && <li>• {errors.date}</li>}
                {errors.hour && <li>• {errors.hour}</li>}
                {errors.cart && <li>• {errors.cart}</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
