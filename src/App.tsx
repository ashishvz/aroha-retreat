import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Intro from "./components/Intro";
import Packages from "./components/Packages";
import Rates from "./components/Rates";
import Cottages from "./components/Cottages";
import Experiences from "./components/Experiences";
import Gallery from "./components/Gallery";
import Location from "./components/Location";
import Enquire from "./components/Enquire";
import Footer from "./components/Footer";
import Admin from "./components/Admin";

export default function App() {
  if (location.pathname.replace(/\/$/, "") === "/admin") return <Admin />;

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Intro />
        <Packages />
        <Rates />
        <Cottages />
        <Experiences />
        <Gallery />
        <Location />
        <Enquire />
      </main>
      <Footer />
    </>
  );
}
