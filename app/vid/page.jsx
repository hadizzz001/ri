const extensions = [
    {
      id: 1,
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      title: "Video One",
    },
    {
      id: 2,
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      title: "Video Two",
    },
    {
      id: 3,
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      title: "Video Three",
    },
    {
      id: 4,
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      title: "Video Four",
    },
  ];
  
  const ExtensionsGrid = () => {
    return (
      <div className="container mx-auto px-4 py-10 mb-10"> 
        <h1 className="text-center uppercase text-4xl">Our Videos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {extensions.map((extension) => (
            <div key={extension.id} className="p-6 rounded-lg text-center">
              <div className="w-60 h-60 mx-auto mb-4 overflow-hidden">
                <video
                  src={extension.video}
                  width={240}
                  height={240}
                  className="object-cover w-full h-full transition-all duration-500" 
                  muted
                />
              </div>
              <h3 className="text-xl font-semibold">{extension.title}</h3> 
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default ExtensionsGrid;
  