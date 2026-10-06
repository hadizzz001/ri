/**
 * "Curated for You — Featured Products": the heading over the ads slider
 * (AdsBanner) that follows the hero on the home page. It sits on the page
 * background like the other home sections.
 */
export default function FeaturedProducts() {
  return (
    <div className="rd-section-head featuredProducts__head">
      <style
        dangerouslySetInnerHTML={{
          __html:
            /* the top padding leaves room for the hero's round "next section" button */
            '.featuredProducts__head{color:#1c1c1c;padding-top:65px}' +
            '@media (min-width:1000px){.featuredProducts__head{padding-top:89px}}',
        }}
      />
      <p className="rd-kicker">Curated for You</p>
      <h2 className="rd-title">Featured Products</h2>
    </div>
  );
}
