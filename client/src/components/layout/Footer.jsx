// components/layout/Footer.jsx
// WHY: The Footer appears at the bottom of every page.
// Features: brand description, navigation links, categories, social icons,
// and a newsletter-style bottom bar.

import { Link } from "react-router-dom";
import {
  FiInstagram, FiTwitter, FiGithub, FiMail,
  FiShield, FiTruck, FiRefreshCw, FiHeadphones,
} from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Store: [
      { label: "Spare Parts",    to: "/shop?category=Spare+Parts" },
      { label: "Accessories",    to: "/shop?category=Accessories" },
      { label: "Riding Gear",    to: "/shop?category=Riding+Gear" },
      { label: "All Products",   to: "/shop" },
    ],
    Services: [
      { label: "Book Service",   to: "/book-service" },
      { label: "Used Bikes",     to: "/bikes" },
      { label: "General Service",to: "/book-service" },
      { label: "Modifications",  to: "/book-service" },
    ],
    Company: [
      { label: "About Us",      to: "/" },
      { label: "Contact Us",    to: "/" },
      { label: "Our Garage",     to: "/" },
      { label: "Location",       to: "/" },
    ],
  };

  const features = [
    { icon: <FiTruck size={22}/>,       title: "Fast Shipping",      desc: "Across Kerala & India" },
    { icon: <FiRefreshCw size={22}/>,   title: "Genuine Parts",      desc: "100% manufacturer warranty" },
    { icon: <FiShield size={22}/>,      title: "Expert Mechanics",   desc: "Certified service technicians" },
    { icon: <FiHeadphones size={22}/>,  title: "Service Support",    desc: "Direct help desk support" },
  ];

  return (
    <footer className="border-t border-white/5" style={{ background: "#0d0d15" }}>

      {/* ── Feature Strip ─────────────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="flex items-center gap-4 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                             transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                >
                  {feat.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{feat.title}</p>
                  <p className="text-xs text-slate-500">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer Content ───────────────────────────────────────── */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
              <img
                src="/logo.jpg"
                alt="Torque MotoTech Logo"
                className="w-9 h-9 rounded-xl object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <span className="font-display font-black text-2xl tracking-tight text-white">
                Torque<span className="gradient-text"> MotoTech</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-6">
              Premium motorcycle workshop, used bikes dealer, and spare parts store based in Kannur, Kerala.
              Delivering power, performance, and precision.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { icon: <FiInstagram size={17}/>, href: "#", label: "Instagram", color: "#e1306c" },
                { icon: <FiTwitter   size={17}/>, href: "#", label: "Twitter",   color: "#1da1f2" },
                { icon: <FiGithub    size={17}/>, href: "#", label: "GitHub",    color: "#f0f6fc"  },
                { icon: <FiMail      size={17}/>, href: "#", label: "Email",     color: "#f97316"  },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center
                             border border-white/10 text-slate-400
                             hover:scale-110 hover:border-white/20
                             transition-all duration-300"
                  style={{ "--hover-color": s.color }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = s.color;
                    e.currentTarget.style.background = `${s.color}15`;
                    e.currentTarget.style.borderColor = `${s.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.background = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-white
                                 transition-colors duration-200 flex items-center gap-1.5
                                 group"
                    >
                      <span className="w-0 h-px bg-primary-500 transition-all duration-300
                                       group-hover:w-3 rounded-full" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center
                        justify-between gap-3">
          <p className="text-sm text-slate-500">
            © {currentYear}{" "}
            <span className="gradient-text font-semibold">ShopVerse</span>.
            All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {/* Payment icons */}
            {["VISA", "MC", "UPI", "COD"].map((p) => (
              <span
                key={p}
                className="text-[10px] font-bold px-2 py-1 rounded
                           border border-white/10 text-slate-500"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
