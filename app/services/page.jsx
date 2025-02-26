import Image from "next/image";

const services = [
  {
    id: 1,
    image: "https://www.dbeauty.fi/wp-content/uploads/2024/02/lashes6-1536x1024.jpg",
    title: "Service One",
    description: "This is a description of service one.",
  },
  {
    id: 2,
    image: "https://www.dbeauty.fi/wp-content/uploads/2024/02/lashes6-1536x1024.jpg",
    title: "Service Two",
    description: "This is a description of service two.",
  },
  {
    id: 3,
    image: "https://www.dbeauty.fi/wp-content/uploads/2024/02/lashes6-1536x1024.jpg",
    title: "Service Three",
    description: "This is a description of service three.",
  },
  {
    id: 4,
    image: "https://www.dbeauty.fi/wp-content/uploads/2024/02/lashes6-1536x1024.jpg",
    title: "Service Four",
    description: "This is a description of service four.",
  },
];

const ServicesGrid = () => {
  return (
    <div className="container mx-auto px-4 py-10 mb-10"> 
      <h1 className="text-center uppercase" style={{fontSize:'40px'}}>Hair Services</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="p-6 rounded-3xl text-center">
            <div className="w-60 h-60 mx-auto mb-4">
              <Image
                src={service.image}
                width={240}
                height={240}
                className="object-cover w-full h-full transition-all duration-500 grayscale hover:grayscale-0"
                style={{ clipPath: "circle(50%)" }}
                alt={service.title}
              />
            </div>
            <h3 className="text-xl font-semibold">{service.title}</h3>
            <p className="text-gray-600 my-2">{service.description}</p>
            <button className="mt-4 px-4 py-2 bg-[#222222] text-white rounded-full hover:bg-black">
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesGrid;
