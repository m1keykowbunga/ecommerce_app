const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-6">Términos y Condiciones</h1>

      <div className="bg-white rounded-xl shadow-md p-8 prose prose-sm max-w-none">
        <p className="text-gray-500 text-sm mb-6">Última actualización: 1 de enero de 2026</p>

        <h2 className="text-lg font-semibold text-brand-secondary">1. Aceptación de los Términos</h2>
        <p className="text-gray-600 mb-4">
          Al acceder y utilizar el sitio web de Don Palito Jr., usted acepta cumplir con estos
          términos y condiciones de uso. Si no está de acuerdo con alguno de estos términos,
          le recomendamos no utilizar nuestro sitio.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">2. Uso del Servicio</h2>
        <p className="text-gray-600 mb-4">
          Nuestro sitio web permite a los usuarios explorar nuestro catálogo de productos,
          realizar pedidos en línea y gestionar su cuenta personal. El uso del servicio está
          destinado exclusivamente a personas mayores de edad.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">3. Precios y Pagos</h2>
        <p className="text-gray-600 mb-4">
          Todos los precios mostrados incluyen IVA (19%). Los precios pueden cambiar sin previo
          aviso. El pago debe realizarse a través de los métodos disponibles: transferencia
          bancaria, QR (Nequi/Daviplata) o efectivo contra entrega.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">4. Pedidos y Entregas</h2>
        <p className="text-gray-600 mb-4">
          Los pedidos están sujetos a disponibilidad de productos. Nos reservamos el derecho
          de cancelar pedidos en caso de error en precios o falta de stock. El envío tiene un
          costo adicional de $10.000 COP y es opcional.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">5. Cancelaciones y Devoluciones</h2>
        <p className="text-gray-600 mb-4">
          Los pedidos pueden cancelarse mientras estén en estado "Pendiente". Debido a la
          naturaleza perecedera de nuestros productos, no aceptamos devoluciones una vez
          entregado el pedido, salvo defectos de calidad.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">6. Cuenta de Usuario</h2>
        <p className="text-gray-600 mb-4">
          Usted es responsable de mantener la confidencialidad de su cuenta y contraseña.
          Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">7. Propiedad Intelectual</h2>
        <p className="text-gray-600 mb-4">
          Todo el contenido del sitio (textos, imágenes, logos, diseños) es propiedad de
          Don Palito Jr. y está protegido por las leyes de propiedad intelectual colombianas.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">8. Contacto</h2>
        <p className="text-gray-600">
          Para cualquier consulta sobre estos términos, puede contactarnos a través de
          nuestro formulario de contacto o al correo luchodonpalito@gmail.com.
        </p>
      </div>
    </div>
  );
};

export default Terms;
