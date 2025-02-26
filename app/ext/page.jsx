import Image from "next/image";

const extensions = [
  {
    id: 1,
    image: "https://www.dbeauty.fi/wp-content/uploads/2024/02/lashes6-1536x1024.jpg",
    title: "extension One",
    description: "This is a description of extension one.",
  },
  {
    id: 2,
    image: "https://www.dbeauty.fi/wp-content/uploads/2024/02/lashes6-1536x1024.jpg",
    title: "extension Two",
    description: "This is a description of extension two.",
  },
  {
    id: 3,
    image: "https://www.dbeauty.fi/wp-content/uploads/2024/02/lashes6-1536x1024.jpg",
    title: "extension Three",
    description: "This is a description of extension three.",
  },
  {
    id: 4,
    image: "https://www.dbeauty.fi/wp-content/uploads/2024/02/lashes6-1536x1024.jpg",
    title: "extension Four",
    description: "This is a description of extension four.",
  },
];

const extensionsGrid = () => {
  return (
    <div className="container mx-auto px-4 py-10 mb-10"> 
      <h1 className="text-center uppercase" style={{fontSize:'40px'}}>Extensions</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {extensions.map((extension) => (
          <div key={extension.id} className="p-6 rounded-3xl text-center">
            <div className="w-60 h-60 mx-auto mb-4">
              <Image
                src={extension.image}
                width={240}
                height={240}
                className="object-cover w-full h-full transition-all duration-500 grayscale hover:grayscale-0"
                style={{ clipPath: "circle(50%)" }}
                alt={extension.title}
              />
            </div>
            <h3 className="text-xl font-semibold">{extension.title}</h3>
            <p className="text-gray-600 my-2">{extension.description}</p>
            <button className="mt-4 px-4 py-2 bg-[#222222] text-white rounded-full hover:bg-black">
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default extensionsGrid;
