import { IoCheckmarkCircle, IoEllipseOutline, IoCloseCircle } from 'react-icons/io5';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

// Flujo normal: 3 pasos
const STEPS = ['pending', 'paid', 'delivered'];

const OrderTimeline = ({ timeline, currentStatus }) => {
  // Caso especial: rechazado (no sigue el flujo normal)
  if (currentStatus === 'rejected') {
    return (
      <div className="space-y-3">
        {timeline.map((entry, i) => (
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
        ))}
      </div>
    );
  }

  const completedStatuses = timeline.map((t) => t.status);
  const timelineMap = {};
  timeline.forEach((t) => { timelineMap[t.status] = t.date; });

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const isCompleted = completedStatuses.includes(step);
        const isCurrent = step === currentStatus;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {isCompleted ? (
                <IoCheckmarkCircle className="text-green-500" size={22} />
              ) : (
                <IoEllipseOutline className="text-gray-300" size={22} />
              )}
              {!isLast && (
                <div className={`w-0.5 h-8 ${isCompleted && !isCurrent ? 'bg-green-500' : 'bg-gray-200'}`} />
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
