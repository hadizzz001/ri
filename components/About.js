"use client";
import Link from "next/link";
import { useState } from 'react';

export default function Features() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <div className="sywPaymentOptions py-4 px-4 container mb-20">
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
          <hr className="custom-hr" />

        <h2 className="myparhal1 text-left mb-10">A Journey of Achievements & Collaborations</h2>

        <p className="myparhal2 text-left">
          Throughout our journey, Rafi Daham Salon has been part of defining moments that shaped its name in the world of beauty. We have collaborated with a distinguished selection of artists and influential figures, and contributed to creative projects that gained prominent exposure in leading fashion and beauty magazines. Alongside this, we have built strong partnerships with global brands that share our passion for quality, excellence, and innovation.

          <br /><br />

          These collaborations were never merely milestones, but reflections of mutual trust and a shared vision of beauty—one that goes beyond passing trends to create a lasting identity defined by refined craftsmanship and timeless elegance. From editorial platforms to major events, from celebrity looks to global brand partnerships, the story of Rafi Daham Salon has been written through exceptional moments where precision met passion, and expertise evolved into a recognized and respected signature of beauty.

          <br /><br />

          <hr className="custom-hr" />

          <br /><br />

          <h2 className="myparhal1 text-left">Stars Who Trusted Us</h2>

          <br /><br />

          Rafi Daham Salon is honored to have worked with a select group of celebrities and artists who chose our expertise to accompany them in their signature looks—on the red carpet, at major events, and during pivotal moments of their artistic journeys.

          <br /><br />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359487/c1_qxqv3b.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359479/IMG_6145_sy8z9u.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359473/c7_qzuiib.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359466/c14_wihnyf.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359437/IMG_9937_gksy60.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359438/IMG_3916_gu0xxa.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359437/IMG_2353_mmepei.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359436/IMG_5759_slwjsg.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359436/IMG_8311_nt2sjb.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359435/IMG_2349_cmmadz.webp" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359426/IMG_1735_mo2hp8.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359425/IMG_1411_fhhvnb.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359425/IMG_0004_frtdbj.webp" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359425/IMG_1249_ocwr1e.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359422/c11_ryiuy4.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359422/EF3C23B2-9145-4F80-AD7D-092DACF14B48_ndmflc.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359422/c21_vdyzfn.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359420/c19_o6l9n3.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359420/c15_p1twoi.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359420/c12_asvxlz.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359413/c6_wclo91.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359413/c9_avl9mh.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359412/c8_kc1vpn.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359412/c3_xriur1.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359411/c4_sxhtac.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359410/c_ediozh.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
              </div>

          <br /><br />

          <hr className="custom-hr" />

          <br /><br />

          <h2 className="myparhal1 text-left">Partnerships with Global Brands</h2>

          <br /><br />

          Over the years, we have shared a commitment to quality and innovation with a number of international beauty and haircare brands through professional collaborations, campaigns, and specialized workshops that reflect the highest international standards.

          <br /><br />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364439/IMG_4773_dzyx8q.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364438/IMG_3882_dj2cmw.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364438/IMG_3937_jflq6u.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
            <img src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769359437/IMG_2956_daolsa.jpg" alt="Gallery" className="aspect-square object-cover cursor-pointer" onClick={(e) => setSelectedImage(e.target.src)} />
       
        </div>

          <br /><br />

          <hr className="custom-hr" />

          <br /><br />

          <h2 className="myparhal1 text-left">Editorial Shoots & Media Features</h2>

          <br /><br />

          Our artistic expertise has been prominently showcased through professional editorial shoots for fashion and beauty magazines, where hair became a central element in visual storytelling and our aesthetic signature appeared on the pages of renowned publications.

          <br /><br />

<div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364020/m10_wduidv.webp"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />

  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364019/m5_cgiaur.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />

  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364001/m2_ffdkgd.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />

  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364000/m1_ybam3p.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364001/IMG_9132_s26dm0.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364000/IMG_4938_pmgejd.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364001/IMG_8857_rn5qyd.webp"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364000/IMG_4132_m1rhzs.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769364000/m1_ybam3p.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769376882/WhatsApp_Image_2026-01-25_at_23.25.06_1_e4bfuy.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769376882/WhatsApp_Image_2026-01-25_at_23.25.06_lcp2lt.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769376881/WhatsApp_Image_2026-01-25_at_23.25.09_pfnwpp.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
  <img
    src="https://res.cloudinary.com/dgi9mfldc/image/upload/v1769376881/WhatsApp_Image_2026-01-25_at_23.25.12_suh5ez.jpg"
    alt="Gallery"
    className="aspect-square object-cover cursor-pointer"
    onClick={(e) => setSelectedImage(e.target.src)}
  />
</div>

        </p>

<hr className="custom-hr" />
        <h2 className="myparhal1 text-left mb-10"><b>Our Interviews on TV and More</b></h2>

        <p className="myparhal2 text-left mb-5">
          Discover our appearances on television, interviews, and other media features showcasing our expertise and passion for beauty. From insightful discussions to behind-the-scenes looks, explore the stories that highlight our journey in the beauty industry.
        </p>

          <button
            className="customb"
            onClick={() => window.location.href = `vid`}
          >
            Discover
          </button>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Zoomed" className="max-w-full max-h-full" />
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white text-3xl font-bold">&times;</button>
        </div>
      )}
    </>
  );
}
