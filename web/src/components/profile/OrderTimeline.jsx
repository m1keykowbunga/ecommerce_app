import { IoCheckmarkCircle, IoEllipseOutline, IoCloseCircle } from 'react-icons/io5';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

// Flujo normal: 3 pasos (en inglés — igual que el backend)
const STEPS = ['pending', 'paid', 'delivered'];
const STEP_ORDER = { pending: 0, paid: 1, delivered: 2 };

const OrderTimeline = ({ timeline, currentStatus }) => {
  // Caso especial: rechazado
  if (currentStatus === 'rejected') {
    return (
      <div className="space-y-3">
        {timeline.length > 0 ? (
          timeline.map((entry, i) => (
            <div key={i} className="flex items-center gap-3">
              {entry.status === 'rejected' ? (
                <IoCloseCircle className="text-red-500" size={20} />
              ) : (
                <IoCheckmarkCircle className="text-green-500" size={20} />
              )}
              <div>
                <p className={`font-medium text-sm ${entry.status === 'rejected' ? 'text-red-600' : 'text-gray-800'}`}>
                  {ORDER_STATUS_LABELS[entry.status] || entry.status}
                </p>
                <p className="text-xs text-gray-500">{formatDateTime(entry.date)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3">
            <IoCloseCircle className="text-red-500" size={20} />
            <p className="font-medium text-sm text-red-600">Rechazado</p>
          </div>
        )}
      </div>
    );
  }

  // Si el backend no retorna timeline, derivamos los pasos completados del currentStatus
  const currentStepIndex = STEP_ORDER[currentStatus] ?? -1;
  const completedStatuses =
    timeline.length > 0
      ? timeline.map((t) => t.status)
      : STEPS.filter((_, i) => i <= currentStepIndex);

  const timelineMap = {};
  timeline.forEach((t) => { timelineMap[t.status] = t.date; });

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const isCompleted = completedStatuses.includes(step);
        const isLast = i === STEPS.length - 1;
        // La línea conectora es verde solo si el SIGUIENTE paso también está completado
        const nextCompleted = !isLast && completedStatuses.includes(STEPS[i + 1]);

        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {isCompleted ? (
                <IoCheckmarkCircle className="text-green-500" size={22} />
              ) : (
                <IoEllipseOutline className="text-gray-300" size={22} />
              )}
              {!isLast && (
                <div className={`w-0.5 h-8 ${nextCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`font-medium text-sm ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                {ORDER_STATUS_LABELS[step] || step}
              </p>
              {timelineMap[step] && (
                <p className="text-xs text-gray-500">{formatDateTime(timelineMap[step])}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
