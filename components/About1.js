import Link from "next/link";

export default function Features() {
  return (
    <>
      <div className="sywPaymentOptions container">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .border-gray-400 {
                --tw-border-opacity: 1;
                border-color: rgb(156 163 175 / var(--tw-border-opacity)) !important;
              }
            `,
          }}
        />

        <div className="relative  ">
          <div className="w-full h-[350px] mb-4 lg:h-[550px]">
            <img
              src="https://res.cloudinary.com/dtjcqfoxc/image/upload/v1747135761/67959747_2643467562338550_2499207839948472320_n_rroaew.jpg"
              className="object-cover w-full h-full transition-all duration-500 grayscale hover:grayscale-0"
              alt={'Rafi Daham'}
            />
          </div>
          <span className="mx-4">
            <h1 className="uppercase myparhal1 text-left">
              About <b className="myBold">Rafi Daham</b>
            </h1>
          </span>
        </div>

        <div className="flex justify-start"> 
          <button
            className="customb"
            onClick={() => window.location.href = `about`}
          >
            Discover
          </button>
        </div>
      </div>
    </>
  );
}
