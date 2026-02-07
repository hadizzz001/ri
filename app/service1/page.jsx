export default function CustomTable() {
  return (
    <div className="container">

      <h1 className="uppercase myparhal1 text-left mb-6">
        <b className="myBold">Rafi Daham</b> Services Menu
      </h1>
      <hr className="custom-hr1" />

      {/* Wrapper: 1 table per row on mobile, 2 on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Table 1: HAIR */}
        <div className="border-y border-[#333]">
          <div className="uppercase text-left py-3 border-b border-[#333] myparhal1">
            Hair
          </div>
          <hr className="custom-hr1" />
          {[
            { title: 'Hair Wash', value: '10$' },
            { title: 'Blow Dry', value: '25$' },
            { title: 'Blow Dry With (EX)', value: '35$' }, 
          ].map((item, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="py-3 px-2 myBold1">{item.title}</div>
                <div className="py-3 px-2 myparhal">{item.value}</div>
              </div>
              <hr className="custom-hr1" />
            </div>
          ))}
        </div>

        {/* Table 2: HAIR CUTS SERVICE */}
        <div className="border-y border-[#333]">
          <div className="uppercase text-left py-3 border-b border-[#333] myparhal1">
            Hair Cuts Service
          </div>
          <hr className="custom-hr1" />
          {[
            { title: 'Hair Cut', value: '50$' },
            { title: 'Fringe Cut', value: '25$' },
            { title: "Kid’s Cut", value: '35$' },
            { title: 'Hair Trim', value: '35$' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="py-3 px-2 myBold1">{item.title}</div>
                <div className="py-3 px-2 myparhal">{item.value}</div>
              </div>
              <hr className="custom-hr1" />
            </div>
          ))}
        </div>

        {/* Table 3: HAIR NORMAL */}
        <div className="border-y border-[#333]">
          <div className="uppercase text-left py-3 border-b border-[#333] myparhal1">
            Hair Normal
          </div>
          <hr className="custom-hr1" />
          {[
            { title: 'Simple Hairstyle', value: '35$' },
            { title: 'Wave Hair', value: '35$' },
            { title: 'Wave – Long', value: '45$' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="py-3 px-2 myBold1">{item.title}</div>
                <div className="py-3 px-2 myparhal">{item.value}</div>
              </div>
              <hr className="custom-hr1" />
            </div>
          ))}
        </div>

        {/* Table 4: HAIR COLORING SERVICE */}
        <div className="border-y border-[#333]">
          <div className="uppercase text-left py-3 border-b border-[#333] myparhal1">
            Hair Coloring Service
          </div>
          <hr className="custom-hr1" />
          {[
            { title: 'Igora Roots', value: '60$' },
            { title: 'Inoa Roots', value: '70$' },
            { title: 'Igora Full Color', value: '70$' },
            { title: 'Igora Full Color – Long', value: '80$' },
            { title: 'Inoa Full Color – Long', value: '90$' },
            { title: 'Face Framing', value: '100$' },
            { title: 'Toner / Rinsage – Short', value: '35$' },
            { title: 'Toner / Rinsage – Long', value: '50$' },
            { title: 'Scalp Bleach', value: '100$' },
            { title: 'Color Project – Short', value: '250$' },
            { title: 'Color Project – Long', value: '400$' },
            { title: 'Balayage with Toner', value: '120$ – 170$' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="py-3 px-2 myBold1">{item.title}</div>
                <div className="py-3 px-2 myparhal">{item.value}</div>
              </div>
              <hr className="custom-hr1" />
            </div>
          ))}
        </div>

        {/* Table 5: (Healthy) HAIR TREATMENTS */}
        <div className="border-y border-[#333]">
          <div className="uppercase text-left py-3 border-b border-[#333] myparhal1">
            (Healthy) Hair Treatments
          </div>
          <hr className="custom-hr1" />
          {[
            { title: 'RAFI DAHAM Collagen', value: '100$ – 160$' },
            { title: 'Caviar Treatment', value: '25$ – 50$' },
            { title: 'GTOX Treatment', value: 'From 170$-220$' },
            { title: 'CRESTAL Treatment – Short', value: '150$' },
            { title: 'CRESTAL Treatment – Long', value: '220$' },
            { title: 'EXTE BB Cream – Short', value: '35$' },
            { title: 'EXTE BB Cream – Long', value: '45$' },
            { title: 'BLOWOUT Treatment – Short', value: '200$' },
            { title: 'BLOWOUT Treatment – Long', value: '300$' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="py-3 px-2 myBold1">{item.title}</div>
                <div className="py-3 px-2 myparhal">{item.value}</div>
              </div>
              <hr className="custom-hr1" />
            </div>
          ))}
        </div>

        {/* Table 6: HAIR STYLES */}
        <div className="border-y border-[#333]">
          <div className="uppercase text-left py-3 border-b border-[#333] myparhal1">
            Hair Styles
          </div>
          <hr className="custom-hr1" />
          {[
            { title: 'Curly Hair Style', value: '45$' },
            { title: 'Wedding Up Do / Hairstyle', value: '70$' },
            { title: 'Half Up', value: '50$' },
            { title: 'Ponytail', value: '50$' },
            { title: 'Wet Look Style', value: '35$' },
            { title: 'Retro Classic Style', value: '90$' },
            { title: 'Bride`s Hair (In Salon)', value: '600$' },
            { title: 'Bride`s Hair (Outside)', value: '1300$' },
            { title: 'ENGAGEMENT Hair (In Salon)', value: '300$' },
            { title: 'ENGAGEMENT Hair (Outside)', value: '700$' }, 
          ].map((item, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="py-3 px-2 myBold1">{item.title}</div>
                <div className="py-3 px-2 myparhal">{item.value}</div>
              </div>
              <hr className="custom-hr1" />
            </div>
          ))}
        </div>
        {/* Table 6: HAIR STYLES */}
        <div className="border-y border-[#333]">
          <div className="uppercase text-left py-3 border-b border-[#333] myparhal1">
            HAIR EXTENSION  
          </div>
          <hr className="custom-hr1" />
          {[
            { title: 'Micro Extension', value: '1.5$- 3$  (1 pc.)' },
            { title: 'Tape Extension (Planted)', value: '320$' },
            { title: 'Tape Extension (Normal)', value: '250$' },
            { title: 'Front Wigs Full lase', value: '800$. 1300$' },
            { title: 'bangs half haed', value: '350$ 500$' }, 
          ].map((item, idx) => (
            <div key={idx}>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="py-3 px-2 myBold1">{item.title}</div>
                <div className="py-3 px-2 myparhal">{item.value}</div>
              </div>
              <hr className="custom-hr1" />
            </div>
          ))}
        </div>

      </div>

      {/* 🌟 Important Note */}
      <div className="py-3 px-2 myBold1">
        🌟 Important Note About Prices & Services 
        <p className="py-3 px-2 myparhal">
          All prices listed above are applicable for services provided within our luxury salon.
        </p>
        <ul className="list-disc ml-5 py-3 px-2 myparhal">
          <li>Services provided outside the salon within Lebanon will incur a 100% increase.</li>
          <li>Services provided outside Lebanon will incur a 300% increase.</li>
        </ul>
        <p className="py-3 px-2 myparhal">
          We guarantee you an exclusive and premium experience with the highest standards of quality, whether inside the salon or wherever you choose.
        </p>
      </div>

    </div>
  );
}
