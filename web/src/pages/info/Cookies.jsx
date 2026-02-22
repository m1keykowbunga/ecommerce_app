const Cookies = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-6">Política de Cookies</h1>

      <div className="bg-white rounded-xl shadow-md p-8 prose prose-sm max-w-none [&_p]:text-justify">
        <p className="text-gray-500 text-sm mb-6">Última actualización: 1 de enero de 2026</p>

        <h2 className="text-lg font-semibold text-brand-secondary">¿Qué son las cookies?</h2>
        <p className="text-gray-600 mb-4">
          Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando
          visita nuestro sitio web. Nos ayudan a mejorar su experiencia de navegación y a
          entender cómo se utiliza nuestro sitio.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">Cookies que utilizamos</h2>
        <div className="overflow-x-auto mb-6">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th className="bg-gray-50">Cookie</th>
                <th className="bg-gray-50">Tipo</th>
                <th className="bg-gray-50">Propósito</th>
                <th className="bg-gray-50">Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono text-xs">token</td>
                <td>Esencial</td>
                <td>Autenticación de sesión</td>
                <td>Sesión</td>
              </tr>
              <tr>
                <td className="font-mono text-xs">cart</td>
                <td>Funcional</td>
                <td>Guardar carrito de compras</td>
                <td>30 días</td>
              </tr>
              <tr>
                <td className="font-mono text-xs">cookiesAccepted</td>
                <td>Esencial</td>
                <td>Registrar aceptación de cookies</td>
                <td>1 año</td>
              </tr>
              <tr>
                <td className="font-mono text-xs">recentSearches</td>
                <td>Funcional</td>
                <td>Guardar búsquedas recientes</td>
                <td>30 días</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-lg font-semibold text-brand-secondary">Gestión de cookies</h2>
        <p className="text-gray-600 mb-4">
          Puede configurar su navegador para rechazar todas las cookies o para que le avise
          cuando se envía una cookie. Sin embargo, algunas funciones del sitio pueden no
          funcionar correctamente si desactiva las cookies.
        </p>

        <h2 className="text-lg font-semibold text-brand-secondary">Contacto</h2>
        <p className="text-gray-600">
          Para cualquier consulta sobre nuestra política de cookies, puede contactarnos
          al correo luchodonpalito@gmail.com.
        </p>
      </div>
    </div>
  );
};

export default Cookies;
