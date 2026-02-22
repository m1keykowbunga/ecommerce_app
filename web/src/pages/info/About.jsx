import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl [&_p]:text-justify">
      <h1 className="text-3xl font-bold text-brand-secondary mb-6">Sobre Nosotros</h1>

      {/* Historia */}
      <section className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-2xl font-semibold text-brand-primary mb-4">Nuestra Historia</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Don Palito Jr. nació en Sabaneta, Antioquia, con la pasión de llevar los sabores
          más auténticos de la gastronomía colombiana a cada rincón. Lo que comenzó como un
          pequeño emprendimiento familiar se ha convertido en un referente de calidad y tradición.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Cada uno de nuestros productos es elaborado con recetas tradicionales, ingredientes
          frescos y el amor que solo una familia colombiana puede poner en cada preparación.
          Desde nuestros crujientes palitos de queso hasta nuestros esponjosos buñuelos, cada
          bocado cuenta una historia de tradición y dedicación.
        </p>
      </section>

      {/* Misión y Visión */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-semibold text-brand-primary mb-3">Misión</h2>
          <p className="text-gray-600 leading-relaxed">
            Ofrecer productos de panadería y repostería colombiana de la más alta calidad,
            preservando las recetas tradicionales y brindando una experiencia de sabor
            auténtico que conecte a nuestros clientes con la esencia de Colombia.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-semibold text-brand-primary mb-3">Visión</h2>
          <p className="text-gray-600 leading-relaxed">
            Ser la marca líder en productos de panadería colombiana en el Valle de Aburrá,
            reconocida por la calidad de nuestros productos, la calidez de nuestro servicio
            y nuestro compromiso con la tradición culinaria colombiana.
          </p>
        </div>
      </div>

      {/* Valores */}
      <section className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-2xl font-semibold text-brand-primary mb-4">Nuestros Valores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Tradición', desc: 'Preservamos las recetas auténticas colombianas.' },
            { title: 'Calidad', desc: 'Solo usamos ingredientes frescos y de primera.' },
            { title: 'Familia', desc: 'Cada producto lleva el cariño de una familia.' },
            { title: 'Servicio', desc: 'Atendemos con la calidez que nos caracteriza.' },
          ].map((v) => (
            <div key={v.title} className="flex gap-3">
              <div className="w-2 h-2 bg-brand-primary rounded-full mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center gradient-primary rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">¿Listo para probar?</h2>
        <p className="mb-4 opacity-90 !text-center">Descubre nuestros productos y lleva el sabor colombiano a tu mesa.</p>
        <Link to="/catalogo">
          <Button variant="ghost" className="!bg-white !text-brand-primary hover:!bg-gray-100">
            Ver catálogo
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default About;
