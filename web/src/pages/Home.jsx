import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import useProducts from '../hooks/useProducts';
import { getProductId } from '../utils/productHelpers';
import { couponService } from '../services/index';

const Home = () => {
  const { data: allProducts = [], isLoading } = useProducts();

  // Preferir los marcados como featured; si no hay suficientes, completar con el resto
  const featured = allProducts.filter((p) => p.featured).slice(0, 4).length > 0
    ? allProducts.filter((p) => p.featured).slice(0, 4)
    : allProducts.slice(0, 4);

  const { data: couponData } = useQuery({
    queryKey: ['coupons', 'active'],
    queryFn: couponService.getActive,
    staleTime: 5 * 60 * 1000,
  });
  const activePromos = couponData?.coupons || [];
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
    <main className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-primary py-20 text-white lg:py-32">
        <div className="container relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-sanstext-4xl font-black leading-tight lg:text-6xl">
              El sabor auténtico de{' '}
              <span className="text-ui-background">Colombia</span>
            </h1>
            <p className="mt-4 text-lg opacity-90 lg:text-xl">
              Palitos de Queso crujientes, Buñuelos esponjosos y tradición colombiana en
              cada bocado. Calidad desde 2005.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/catalogo">
                <Button
                  size="lg"
                  className="bg-brand-accent text-white hover:brightness-110 shadow-lg"
                >
                  Ver Catálogo
                  <IoArrowForward className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a
                href="https://wa.me/573148702078"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="ghost"
                  className="border-2 border-white text-white hover:bg-white hover:text-brand-primary"
                >
                  Pedir por WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 lg:opacity-30">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-brand-primary" />
          <img
            src="https://res.cloudinary.com/diqoi03kk/image/upload/v1771179829/Comida-de-navidad-en-Colombia_rpr88g.jpg"
            alt="Comida colombiana"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="font-sans text-3xl md:text-4xl font-bold text-text-primary">
              Nuestros Favoritos
            </h2>
            <p className="mt-2 text-text-secondary">
              Los productos más pedidos por nuestros clientes
            </p>
          </div>

          {isLoading ? (
            <Loading />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={getProductId(product)} product={product} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link to="/catalogo">
              <Button
                variant="primary"
                outline
                size="lg"
              >
                Ver Todo el Catálogo
                <IoArrowForward className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Promos — carrusel con flechas */}
      {activePromos.length > 0 && (
        <section
          className="relative py-12 px-4 overflow-hidden"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/diqoi03kk/image/upload/v1771179829/Comida-de-navidad-en-Colombia_rpr88g.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-brand-primary/80" />
          <div className="container relative z-10">
            <h2 className="font-sans text-3xl md:text-4xl font-bold text-white mb-8 text-center">
              Promociones activas
            </h2>

            <div className="flex items-center justify-center gap-4">
              {/* Flecha izquierda */}
              <button
                onClick={() => setCurrentIdx((i) => (i - 1 + activePromos.length) % activePromos.length)}
                disabled={activePromos.length <= 1}
                className="text-white/80 hover:text-white disabled:opacity-20 transition-colors shrink-0"
                aria-label="Cupón anterior"
              >
                <IoChevronBack size={36} />
              </button>

              {/* Tarjeta única */}
              {(() => {
                const promo = activePromos[currentIdx];
                return (
                  <div className="w-full max-w-xs bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-brand-accent px-6 py-8 text-white text-center">
                      <p className="text-6xl font-black leading-none">
                        {promo.discountType === 'percentage'
                          ? `${promo.discountValue}%`
                          : `$${Number(promo.discountValue).toLocaleString('es-CO')}`}
                      </p>
                      <p className="text-sm mt-2 opacity-80 font-medium tracking-wide uppercase">
                        de descuento
                      </p>
                    </div>
                    <div className="border-t-2 border-dashed border-brand-accent/30 mx-6" />
                    <div className="px-6 py-5 flex flex-col items-center gap-2 text-center">
                      <span className="font-mono font-bold tracking-widest text-brand-accent border border-dashed border-brand-accent/50 px-3 py-1 rounded text-base">
                        {promo.code}
                      </span>
                      {promo.firstOrderOnly && (
                        <p className="text-xs text-gray-400">Solo en tu primera compra</p>
                      )}
                      {promo.expiresAt && (
                        <p className="text-xs text-gray-400">
                          Hasta {new Date(promo.expiresAt).toLocaleDateString('es-CO')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Flecha derecha */}
              <button
                onClick={() => setCurrentIdx((i) => (i + 1) % activePromos.length)}
                disabled={activePromos.length <= 1}
                className="text-white/80 hover:text-white disabled:opacity-20 transition-colors shrink-0"
                aria-label="Cupón siguiente"
              >
                <IoChevronForward size={36} />
              </button>
            </div>

            {/* Puntos indicadores */}
            {activePromos.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {activePromos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIdx ? 'bg-white' : 'bg-white/30'
                    }`}
                    aria-label={`Ir al cupón ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Google Maps */}
      <section className="py-16 bg-white">
        <div className="container text-center">
          <h2 className="mb-6 font-sans text-3xl md:text-4xl font-bold text-text-primary">
            Encuéntranos
          </h2>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border-2 border-ui-border shadow-lg">
            <iframe
              title="Ubicación Don Palito Jr"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15864.5!2d-75.6167!3d6.1517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4682e3d5e6b5c7%3A0x5b7a7d2c5c5b5b5b!2sSabaneta%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1700000000000"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
