import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { IoCall, IoMail, IoLocation, IoTime, IoLogoWhatsapp } from 'react-icons/io5';
import { contactSchema } from '../../utils/validationSchemas';
import { CONTACT_INFO } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const noNumbers = (e) => {
  if (/\d/.test(e.key)) e.preventDefault();
};

const Contact = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(contactSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Mensaje enviado. Te contactaremos pronto.');
    reset();
  };

  const infoCards = [
    { icon: <IoCall size={24} />, title: 'Teléfono', content: CONTACT_INFO.phone },
    { icon: <IoMail size={24} />, title: 'Email', content: CONTACT_INFO.email },
    { icon: <IoLocation size={24} />, title: 'Dirección', content: CONTACT_INFO.address },
    {
      icon: <IoTime size={24} />,
      title: 'Horarios',
      content: (
        <div className="text-sm">
          <p>Lun-Vie: {CONTACT_INFO.schedule.weekdays}</p>
          <p>Sábado: {CONTACT_INFO.schedule.saturday}</p>
          <p>Domingo: {CONTACT_INFO.schedule.sunday}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-2">Contáctanos</h1>
      <p className="text-gray-500 mb-8">Estamos aquí para ayudarte. Escríbenos y te responderemos pronto.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              error={errors.name?.message}
              required
              onKeyDown={noNumbers}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              required
              {...register('email')}
            />
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Mensaje <span className="text-error">*</span></span>
              </label>
              <textarea
                className={`textarea textarea-bordered bg-brand-secondary/10 w-full h-32 ${errors.message ? 'textarea-error' : ''}`}
                placeholder="¿En qué podemos ayudarte?"
                {...register('message')}
              />
              {errors.message && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.message.message}</span>
                </label>
              )}
            </div>
            <Button type="submit" variant="primary" fullWidth loading={isSubmitting}>
              Enviar mensaje
            </Button>
          </form>
        </div>

        {/* Info + Mapa */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoCards.map((card) => (
              <div key={card.title} className="bg-white rounded-xl shadow-md p-5">
                <div className="text-brand-primary mb-2">{card.icon}</div>
                <h3 className="font-semibold mb-1">{card.title}</h3>
                <div className="text-sm text-gray-600">{card.content}</div>
              </div>
            ))}
          </div>

          {/* Mapa */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <iframe
              title="Ubicación Don Palito Jr."
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5!2d${CONTACT_INFO.coordinates.lng}!3d${CONTACT_INFO.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sDon+Palito+Jr!5e0!3m2!1ses!2sco!4v1700000000000`}
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${CONTACT_INFO.phone}?text=Hola, me gustaría hacer un pedido`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl p-4 font-semibold hover:bg-green-600 transition-colors"
          >
            <IoLogoWhatsapp size={24} />
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
