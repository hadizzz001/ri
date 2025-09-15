import Link from "next/link";

export default function Features() {
  return (
    <>
      <div className="sywPaymentOptions py-4 px-4 container">
        <h1 className="uppercase myparhal1 text-left">
          About <b className="myBold">Rafi Daham</b>
        </h1>

        <hr className="custom-hr" />

        <p className="text-lg myparhal2 text-left">
          Passion for Beauty, Excellence in Care <br />
          <br />
          Since our launch in 1999, our passion for beauty and hair artistry has
          been the foundation of a journey marked by lasting success. Over more
          than two decades, we have built a reputation grounded in years of
          achievement, the trust of our clients, and a constant drive for
          innovation and growth.
          <br />
          <br />
          At Rafi Daham Salon, we believe that hair is a crown you never take
          off. We stay at the forefront of global trends, traveling frequently
          to explore the latest techniques and inspirations—blending Eastern
          elegance with Western style—to bring our clients the newest fashions
          and cutting-edge services.
          <br />
          <br />
        </p>


        <p className="myparhal2">Our Comprehensive Services</p>
        <p className="myparhal2">
          We offer a luxurious, all-inclusive beauty experience that meets every
          need of the modern woman, including:
        </p>

        <ul
          style={{
            listStyleType: "disc",
            paddingLeft: "1.5rem", 
          }}
          className="myparhal2 text-left"
        >
          <li className="myparhal2">Expert haircuts and contemporary styling</li>
          <li className="myparhal2">Advanced coloring techniques and premium treatments</li>
          <li className="myparhal2">Professional makeup for every occasion</li>
          <li className="myparhal2">Skin care and revitalizing facials for a radiant glow</li>
          <li className="myparhal2">High-quality hair extensions for natural volume and length</li>
        </ul>

        <p className="  myparhal2 text-left">
          Whether you are preparing for a once-in-a-lifetime celebration or
          simply want to elevate your everyday look, we provide everything you
          need to shine like royalty.
          <br />
          <br />
          Step into Rafi Daham Salon and indulge in a complete beauty experience
          where creativity and expertise meet in every detail.
        </p>
      </div>
    </>
  );
}
