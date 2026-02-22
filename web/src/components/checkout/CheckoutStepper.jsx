import { IoCheckmark } from 'react-icons/io5';

const steps = ['Resumen', 'Dirección', 'Pago'];

const CheckoutStepper = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i < currentStep
                  ? 'bg-green-500 text-white'
                  : i === currentStep
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i < currentStep ? <IoCheckmark size={20} /> : i + 1}
            </div>
            <span className={`text-xs mt-1 ${i <= currentStep ? 'text-brand-primary font-medium' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-2 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default CheckoutStepper;
