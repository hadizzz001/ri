'use client';

const videos = [

  {
    id: 2,
    url: 'https://www.youtube.com/embed/tlgoyOuQut8',
    title: 'Video 2',
  },
  {
    id: 3,
    url: 'https://www.youtube.com/embed/8nqRl7HNT0s',
    title: 'Video 3',
  },
  {
    id: 4,
    url: 'https://www.youtube.com/embed/RFOe3hlM4v4',
    title: 'Video 4',
  },
  {
    id: 5,
    url: 'https://www.youtube.com/embed/twFVYqmVXXg',
    title: 'Video 5',
  },
    {
    id: 6,
    url: 'https://www.youtube.com/embed/pkdHihaF3R8',
    title: 'Video 1',
  },
];

const ExtensionsGrid = () => {
  return (
    <div className="container mx-auto px-4 py-10 mb-10 mt-10">
      <h1 className="text-center uppercase text-4xl mb-8">Our Interviews</h1>

      <div className="grid grid-cols-1 gap-10">
        {videos.map((video) => (
          <div key={video.id} className="w-full">
            <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden shadow-md">
              <iframe
                src={video.url}
                title={video.title}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
 
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtensionsGrid;
