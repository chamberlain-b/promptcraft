import { type FC } from 'react';

type RequestLimitBannerProps = {
  requestLimit: number | null;
  requestsLeft: number | null;
};

const RequestLimitBanner: FC<RequestLimitBannerProps> = ({ requestLimit, requestsLeft }) => {
  if (!requestLimit) return null;

  const statusRole = requestsLeft === 0 ? 'alert' : 'status';
  const liveMode = requestsLeft === 0 ? 'assertive' : 'polite';

  return (
    <div className="mb-6 flex justify-center" aria-live={liveMode} role={statusRole}>
      <div className={`rounded-xl px-6 py-3 text-lg font-semibold shadow-md border-2 ${
        requestsLeft === 0
          ? 'bg-red-900/70 border-red-500 text-red-200'
          : requestsLeft <= 5
          ? 'bg-yellow-900/70 border-yellow-400 text-yellow-200'
          : 'bg-teal-900/70 border-teal-500 text-teal-200'
      }`}>
        {requestsLeft === 0
          ? `You have reached your free request limit for this month.`
          : `You have ${requestsLeft} of ${requestLimit} free requests left this month.`}
      </div>
    </div>
  );
};

export default RequestLimitBanner;
