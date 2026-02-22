const faqData = [
  {
    category: 'Pedidos',
    questions: [
      {
        q: '¿Cómo hago un pedido?',
        a: 'Navega por nuestro catálogo, agrega los productos al carrito y sigue el proceso de checkout. Puedes pagar por transferencia, QR o efectivo contra entrega.',
      },
      {
        q: '¿Puedo modificar mi pedido después de realizarlo?',
        a: 'Si tu pedido aún está en estado "Pendiente", puedes contactarnos por WhatsApp para solicitar cambios. Una vez en preparación, no es posible modificarlo.',
      },
      {
        q: '¿Cuánto tarda mi pedido?',
        a: 'Los pedidos generalmente se preparan en un plazo de 30 minutos a 1 hora, dependiendo de la carga. El envío puede tomar entre 30 y 60 minutos adicionales.',
      },
    ],
  },
  {
    category: 'Pagos',
    questions: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos transferencia bancaria (Bancolombia), pago por QR (Nequi y Daviplata), y efectivo contra entrega.',
      },
      {
        q: '¿Los precios incluyen IVA?',
        a: 'Sí, todos nuestros precios incluyen IVA (19%). En el resumen de tu pedido verás el desglose informativo de la base y el IVA.',
      },
    ],
  },
  {
    category: 'Envíos',
    questions: [
      {
        q: '¿Cuánto cuesta el envío?',
        a: 'El envío tiene un costo de $10.000 COP. Es opcional: puedes recoger tu pedido directamente en nuestro local sin costo adicional.',
      },
      {
        q: '¿A qué zonas realizan envíos?',
        a: 'Actualmente realizamos envíos en Sabaneta, Envigado e Itagüí. Estamos expandiendo nuestra cobertura.',
      },
    ],
  },
  {
    category: 'Productos',
    questions: [
      {
        q: '¿Los productos son frescos?',
        a: 'Sí, todos nuestros productos se preparan el mismo día con ingredientes frescos de la mejor calidad.',
      },
      {
        q: '¿Tienen opciones para personas con restricciones alimentarias?',
        a: 'Actualmente no contamos con opciones sin gluten o veganas, pero estamos trabajando en ampliar nuestro menú.',
      },
    ],
  },
  {
    category: 'Cuenta',
    questions: [
      {
        q: '¿Necesito una cuenta para comprar?',
        a: 'Sí, necesitas crear una cuenta para realizar pedidos. Esto nos permite brindarte un mejor seguimiento de tus compras.',
      },
      {
        q: '¿Cómo elimino mi cuenta?',
        a: 'Puedes eliminar tu cuenta desde la sección "Mi Perfil". Ten en cuenta que esta acción es irreversible.',
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-2">Preguntas Frecuentes</h1>
      <p className="text-gray-500 mb-8">Encuentra respuestas a las preguntas más comunes.</p>

      <div className="space-y-6">
        {faqData.map((section) => (
          <div key={section.category}>
            <h2 className="text-xl font-semibold text-brand-primary mb-3">{section.category}</h2>
            <div className="space-y-2">
              {section.questions.map((item, i) => (
                <div key={i} className="collapse collapse-arrow bg-white rounded-xl shadow-sm border">
                  <input type="checkbox" />
                  <div className="collapse-title font-medium">{item.q}</div>
                  <div className="collapse-content">
                    <p className="text-gray-600 text-sm">{item.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
