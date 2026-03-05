import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpg";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto" style={{ background: "var(--soft)", borderTop: "1px solid rgba(15,23,42,.06)" }}>
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-12 col-lg-4">
            <Link className="text-decoration-none d-flex align-items-center gap-2" to="/">
             <span className="d-inline-flex align-items-center justify-content-center rounded-circle">
                         <img
                           src={logo}
                           alt="Medi Suite"
                           style={{
                             width: 32,
                             height: 32,
                             objectFit: "contain",
                           }}
                         />
                       </span>
              <span className="fw-semibold fs-5 text-dark">
               <span style={{ color: "var(--brand)" }}>Medi</span>
               <span style={{ color: "var(--accent)" }}>suite</span>
        
              </span>

            </Link>

            <p className="text-secondary mt-3 mb-3" style={{ maxWidth: 360 }}>
              Pharmacy essentials and skincare you can trust. COD delivery with ring-road pricing and clear return rules
              for eligible products.
            </p>

            <div className="d-flex gap-2">
              <a className="btn btn-outline-secondary rounded-pill btn-sm px-3" href="#" aria-label="Instagram">
                <i className="bi bi-instagram me-2" />
                Instagram
              </a>
              <a className="btn btn-outline-secondary rounded-pill btn-sm px-3" href="#" aria-label="Facebook">
                <i className="bi bi-facebook me-2" />
                Facebook
              </a>
            </div>

            <div className="mt-3 small text-secondary">
              <i className="bi bi-info-circle me-1" />
              Some products may require prescription. Always follow label instructions.
            </div>
          </div>

          {/* Quick links */}
          <div className="col-6 col-lg-2">
            <div className="fw-bold mb-2">Shop</div>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              <li><Link className="text-decoration-none text-secondary" to="/products">All products</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/brands">Brands</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/products?category=skincare">Skincare</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/products?category=wellness">Wellness</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-6 col-lg-2">
            <div className="fw-bold mb-2">Company</div>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              <li><Link className="text-decoration-none text-secondary" to="/about">About</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/contact">Contact</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/blogs">Blog</Link></li>
              <li><Link className="text-decoration-none text-secondary" to="/products">New arrivals</Link></li>
            </ul>
          </div>

          {/* Support + Newsletter */}
          <div className="col-12 col-lg-4">
            <div className="fw-bold mb-2">Support</div>

            <div className="card card-soft p-3 mb-3">
              <div className="d-flex flex-wrap gap-3">
                <div>
                  <div className="small text-secondary">Phone</div>
                  <div className="fw-semibold">+977 98XXXXXXXX</div>
                </div>
                <div>
                  <div className="small text-secondary">Email</div>
                  <div className="fw-semibold">support@carepharm.com</div>
                </div>
                <div>
                  <div className="small text-secondary">Hours</div>
                  <div className="fw-semibold">9:00 AM – 7:00 PM</div>
                </div>
              </div>
            </div>

            <div className="fw-bold mb-2">Get offers + skincare tips</div>
            <form className="d-flex gap-2">
              <input className="form-control rounded-pill" placeholder="Enter your email" type="email" />
              <button className="btn btn-brand rounded-pill px-4" type="button">
                Subscribe
              </button>
            </form>
            <div className="small text-secondary mt-2">
              By subscribing, you agree to our privacy policy.
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <hr className="my-4" style={{ borderColor: "rgba(15,23,42,.08)" }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <div className="small text-secondary">
            © {year} Medisuite. All rights reserved.
          </div>

          <div className="d-flex flex-wrap gap-3">
            <Link className="small text-decoration-none text-secondary" to="/pages/terms">Terms</Link>
            <Link className="small text-decoration-none text-secondary" to="/pages/privacy">Privacy</Link>
            <Link className="small text-decoration-none text-secondary" to="/pages/refund">Refund policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
