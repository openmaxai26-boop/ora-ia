import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Agents from "@/components/Agents";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
    return (
          <main>
                <Navbar />
                <Hero />
                <Agents />
                <HowItWorks />
                <Pricing />
                <Footer />
          </main>
        );
}
