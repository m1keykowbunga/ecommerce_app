const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-6">Política de Privacidad</h1>

      <div className="bg-white rounded-xl shadow-md p-8 prose prose-sm max-w-none">
        <p className="text-gray-500 text-sm mb-6">Última actualización: 1 de enero de 2026</p>

        <h2 className="text-lg font-semibold text-brand-secondary">1. Información que Recopilamos</h2>
        <p className="text-gray-600 mb-4">
          Recopilamos la información que usted nos proporciona al crear una cuenta, realizar
          un pedido o contactarnos: nombre, email, teléfono, dirección de entrega y datos
          de pago necesarios para procesar su pedido.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">2. Uso de la Información</h2>
        <p className="text-gray-600 mb-4">
          Utilizamos su información personal para: procesar y entregar sus pedidos, comunicarnos
          sobre el estado de sus pedidos, mejorar nuestros productos y servicios, y enviar
          comunicaciones comerciales solo si ha dado su consentimiento.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">3. Protección de Datos</h2>
        <p className="text-gray-600 mb-4">
          Implementamos medidas de seguridad técnicas y organizativas para proteger su
          información personal contra acceso no autorizado, pérdida o destrucción.
          Sus contraseñas se almacenan de forma encriptada.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">4. Compartir Información</h2>
        <p className="text-gray-600 mb-4">
          No vendemos ni compartimos su información personal con terceros, excepto cuando sea
          necesario para procesar sus pedidos (servicios de entrega) o cuando la ley lo requiera.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">5. Derechos del Usuario</h2>
        <p className="text-gray-600 mb-4">
          De acuerdo con la Ley 1581 de 2012 (Protección de Datos Personales en Colombia),
          usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos personales.
          Puede ejercer estos derechos contactándonos directamente.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">6. Cookies</h2>
        <p className="text-gray-600 mb-4">
          Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Para más
          información, consulte nuestra Política de Cookies.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">7. Contacto</h2>
        <p className="text-gray-600">
          Para cualquier consulta sobre privacidad, puede contactarnos al correo
          luchodonpalito@gmail.com.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
