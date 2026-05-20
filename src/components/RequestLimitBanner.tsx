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
    <div className="mb-4 flex justify-center" aria-live={liveMode} role={statusRole}>
      <div className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-md border ${
        requestsLeft === 0
          ? 'bg-red-300/[0.09] border-red-300/30 text-red-100'
          : requestsLeft <= 5
          ? 'bg-amber-300/[0.09] border-amber-300/30 text-amber-100'
          : 'bg-teal-300/[0.08] border-teal-300/25 text-teal-100'
      }`}>
        {requestsLeft === 0
          ? `You have reached your free request limit for this month.`
          : `You have ${requestsLeft} of ${requestLimit} free requests left this month.`}
      </div>
    </div>
  );
};

export default RequestLimitBanner;
