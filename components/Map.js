import React from "react";

const locations = [
  {
    name: "LEBANON",
    src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.586704423107!2d35.492900075600254!3d33.900296525738426!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f17109e2b809f%3A0x161ec381d7b4a1fb!2sRAFI%20DAHAM%20HAIR%20%26%20BEAUTY!5e0!3m2!1sen!2slb!4v1740584926410!5m2!1sen!2slb", 
  },
  {
    name: "KUWAIT",
    src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d890606.7636678368!2d47.020779637428674!3d29.313650604912763!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3fc5363fbeea51a1%3A0x74726bcd92d8edd2!2sKuwait!5e0!3m2!1sen!2slb!4v1740584762441!5m2!1sen!2slb", // Replace with Kuwait's Google Maps Embed URL 
  },
  {
    name: "SAUDI ARABIA",
    src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14944215.965377672!2d34.42701448445964!3d23.872229257712483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15e7b33fe7952a41%3A0x5960504bc21ab69b!2sSaudi%20Arabia!5e0!3m2!1sen!2slb!4v1740584877498!5m2!1sen!2slb", // Replace with Saudi Arabia's Google Maps Embed URL
  },
];

const MapsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {locations.map((location, index) => (
        <div key={index} className="w-full mb-10 mt-10">
          <h3 className="text-center font-bold mb-2">{location.name}</h3>
          <iframe
            src={location.src}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      ))}
    </div>
  );
};

export default MapsSection;
