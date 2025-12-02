import { useState } from 'react';
import { About } from './components/About';
import { BookingModal } from './components/BookingModal';
import { Contacts } from './components/Contacts';
import { Diagnostics } from './components/Diagnostics';
import { Doctors } from './components/Doctors';
import { Footer } from './components/Footer';
import { Gallery } from './components/Gallery';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Reviews } from './components/Reviews';
import { Services } from './components/Services';
import { AdminApp } from './admin/AdminApp';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:8080/api');
const PHONE_LINK = '+77001234567';
const WHATSAPP_LINK = 'https://wa.me/77001234567';

function App() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  const [isBookingOpen, setBookingOpen] = useState(false);

  const openBooking = () => setBookingOpen(true);
  const closeBooking = () => setBookingOpen(false);

  return (
    <div className="page">
      <Header onBook={openBooking} />
      <main>
        <Hero onBook={openBooking} />
        <About apiBaseUrl={API_BASE_URL} />
        <Services />
        <Diagnostics apiBaseUrl={API_BASE_URL} />
        <Doctors apiBaseUrl={API_BASE_URL} />
        <Gallery onBook={openBooking} />
        <Reviews apiBaseUrl={API_BASE_URL} />
        <Contacts />
      </main>
      <Footer />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={closeBooking}
        apiBaseUrl={API_BASE_URL}
        whatsappLink={WHATSAPP_LINK}
        phoneLink={PHONE_LINK}
      />
    </div>
  );
}

export default App;
