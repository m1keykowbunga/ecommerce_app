import { Link } from 'react-router-dom';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoWhatsapp,
  IoMail,
  IoCall,
  IoLocation
} from 'react-icons/io5';
import logoColor from '../../assets/images/logo-color.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-secondary text-white/80 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Columna 1: About */}
          <div>
            <div className="mb-4">
              <img src={logoColor} alt="Don Palito Jr" className="h-14 w-auto" />
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              Productos tradicionales de la mejor calidad.<br/>
              Sabor auténtico desde Sabaneta, Antioquia.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-brand-accent transition-colors"
              >
                <IoLogoFacebook size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-brand-accent transition-colors"
              >
                <IoLogoInstagram size={24} />
              </a>
              <a
                href="https://wa.me/573148702078"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-brand-accent transition-colors"
              >
                <IoLogoWhatsapp size={24} />
              </a>
            </div>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/sobre-nosotros" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terminos-condiciones" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidad" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/politica-cookies" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <IoLocation className="mt-1 flex-shrink-0 text-brand-accent" size={20} />
                <span className="text-sm text-white/70">
                  Cra 47 # 76D Sur - 37<br />
                  Sabaneta, Antioquia
                </span>
              </li>
              <li className="flex items-center gap-2">
                <IoCall className="flex-shrink-0 text-brand-accent" size={20} />
                <a href="tel:+573148702078" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  314 870 2078
                </a>
              </li>
              <li className="flex items-center gap-2">
                <IoMail className="flex-shrink-0 text-brand-accent" size={20} />
                <a href="mailto:luchodonpalito@gmail.com" className="text-sm text-white/70 hover:text-brand-accent transition-colors">
                  luchodonpalito@gmail.com
                </a>
              </li>
            </ul>

            <div className="mt-4">
              <h5 className="text-white text-sm font-semibold mb-2">Horarios</h5>
              <p className="text-xs text-white/50">
                Lun - Vie: 6:00 AM - 9:00 PM<br />
                Sábados: 7:00 AM - 9:00 PM<br />
                Domingos: 8:00 AM - 9:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-sm text-white/40">
              © {currentYear} Don Palito Jr. Todos los derechos reservados.
            </p>
            <p className="text-sm text-white/40">
              Developed by <span className="text-brand-accent font-medium">MigaTech</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
