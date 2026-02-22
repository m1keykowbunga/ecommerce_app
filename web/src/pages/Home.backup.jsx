import { Link } from 'react-router-dom';
import { IoArrowForward, IoStorefront, IoHeart, IoShield } from 'react-icons/io5';

const Home = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-in">
              Bienvenido a Don Palito Jr
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-in">
              Sabor tradicional colombiano en cada bocado 🥐
            </p>
            <p className="text-lg mb-8 text-white/80">
              Descubre nuestros deliciosos productos artesanales: 
              palitos de queso, buñuelos, natilla y mucho más.
            </p>
            <Link 
              to="/productos" 
              className="btn btn-lg bg-white text-primary hover:bg-gray-100 border-none"
            >
              Ver Productos
              <IoArrowForward className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <IoStorefront className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Productos Tradicionales</h3>
              <p className="text-gray-600">
                Recetas auténticas colombianas transmitidas de generación en generación
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <IoHeart className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hecho con Amor</h3>
              <p className="text-gray-600">
                Cada producto es elaborado con dedicación y los mejores ingredientes
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <IoShield className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Calidad Garantizada</h3>
              <p className="text-gray-600">
                Productos frescos y de la más alta calidad para tu satisfacción
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para probar nuestros productos?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Haz tu pedido ahora y disfruta del mejor sabor tradicional colombiano
            </p>
            <Link to="/productos" className="btn btn-primary btn-lg">
              Explorar Productos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
