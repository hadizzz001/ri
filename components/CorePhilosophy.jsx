// "Our Core Philosophy" — dark band with the four brand values.
// Icons are 24px / 1.5 stroke line pictos, matching amadeussabra.com.

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const VALUES = [
  {
    title: 'Visionary Artistry',
    text: 'We believe beauty is an art form. Our passion lies in pioneering innovative techniques and crafting bespoke transformations that go beyond trends to celebrate individual radiance.',
    icon: (
      <Icon>
        <path clipRule="evenodd" d="m12.695 1.676 3.198 6.334 6.154.61a.77.77 0 0 1 .477 1.313l-5.064 5.02 1.878 6.82a.777.777 0 0 1-1.1.894l-6.24-3.09-6.23 3.086a.777.777 0 0 1-1.1-.893l1.878-6.821-5.068-5.02a.77.77 0 0 1 .478-1.313l6.154-.61 3.192-6.33a.783.783 0 0 1 1.393 0Z" />
      </Icon>
    ),
  },
  {
    title: 'Relentless Perfection',
    text: 'Every detail matters. From the finest product ingredients to the precision of our services, we are dedicated to an uncompromising standard of quality and excellence in everything we do.',
    icon: (
      <Icon>
        <path d="m11.016 11.859 4.167-4.167" />
        <path clipRule="evenodd" d="m15.183 7.692.568-3.75L18.999.75l.502 2.624 2.624.502-3.192 3.248-3.75.568v0Z" />
        <path d="M21.055 9.513A9.75 9.75 0 1 1 12.614 2.3" />
        <path d="M16.722 10.737a5.25 5.25 0 1 1-5.1-3.987m-5.106 13.5-.75 3m11.25-3 .75 3" />
      </Icon>
    ),
  },
  {
    title: 'Empowering Education',
    text: 'Our legacy extends beyond our clients. We are committed to nurturing the next generation of talent, sharing knowledge, and shaping the future of the beauty industry through mentorship and training.',
    icon: (
      <Icon>
        <path d="M16.592 8.01c-.205 2.758-2.296 5.008-4.592 5.008s-4.391-2.25-4.592-5.009C7.199 5.14 9.234 3 12 3c2.765 0 4.8 2.192 4.592 5.01Z" />
        <path d="M2 21.364c.853-4.728 5.46-7.232 10-7.232s9.147 2.504 10 7.232" strokeMiterlimit="10" />
      </Icon>
    ),
  },
  {
    title: 'Unwavering Trust',
    text: 'Our relationship with our clientele is our greatest asset. We build lasting connections through authenticity, personalized care, and a consistent promise of delivering an exceptional experience.',
    icon: (
      <Icon>
        <path clipRule="evenodd" d="m12 21.844-9.588-10a5.672 5.672 0 0 1-1.063-6.551v0a5.673 5.673 0 0 1 9.085-1.474L12 5.384l1.566-1.565a5.673 5.673 0 0 1 9.085 1.474v0a5.673 5.673 0 0 1-1.062 6.548L12 21.844Z" />
      </Icon>
    ),
  },
];

const CorePhilosophy = () => (
  <section className="corePhilosophy" aria-labelledby="core-philosophy-title">
    <div className="rd-section-head corePhilosophy__head">
      <p className="rd-kicker">Our Core Philosophy</p>
      <h2 id="core-philosophy-title" className="rd-title rd-title--lg">Driven by Our Values</h2>
      <p className="corePhilosophy__intro">
        At Rafi Daham, our work is more than just beauty—it&apos;s a commitment to a set of core
        values that guide every service, every product, and every interaction. These principles
        are the foundation of our legacy and the promise we make to you.
      </p>
    </div>

    <div className="rd-icon-cols corePhilosophy__values">
      {VALUES.map((value) => (
        <div key={value.title}>
          {value.icon}
          <div className="rd-icon-cols__text">
            <h3 className="rd-icon-cols__title">{value.title}</h3>
            <p className="rd-icon-cols__body">{value.text}</p>
          </div>
        </div>
      ))}
    </div>

    <style
      dangerouslySetInnerHTML={{
        __html: `
.corePhilosophy{background:#1c1c1c;color:#fff;padding:2.5rem 1.25rem;margin:3rem 0}
.corePhilosophy *{color:#fff !important}
.corePhilosophy__head{gap:1rem;margin-bottom:2.5rem;padding:0}
.corePhilosophy__intro{max-width:680px;margin:.5rem 0 0 !important;font-size:14px;line-height:1.7}
.corePhilosophy__values{max-width:1360px;margin:0 auto}
@media (min-width:700px){.corePhilosophy{padding:4rem 2rem}}
@media (min-width:1000px){.corePhilosophy{padding:4rem 3rem}.corePhilosophy__head{margin-bottom:4rem}}
`,
      }}
    />
  </section>
);

export default CorePhilosophy;
