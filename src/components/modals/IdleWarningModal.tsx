import Button from "../forms/Button";

// TYPES
interface IdleWarningModalProps {
  visible: boolean;
  /** total seconds until auto-logout fires */
  secondsLeft: number;
  /** total idle minutes the agent has been idle (for display) */
  idleMinutes: number;
  onStayLoggedIn: () => void;
}

/* ============================== IDLE WARNING MODAL ============================== */

const IdleWarningModal = ({
  visible,
  secondsLeft,
  idleMinutes,
  onStayLoggedIn,
}: IdleWarningModalProps) => {
  if (!visible) return null;

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
    return `${s}s`;
  };

  return (
    <div
      id="popup-IdleWarningModal"
      tabIndex={-1}
      className="fixed top-0 left-0 right-0 z-[70] px-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[100%] max-h-full bg-black bg-opacity-50"
    >
      <div className="w-full h-full relative flex justify-center items-center">
        <div
          className="max-w-[480px] w-full"
          onClick={(e: any) => e.stopPropagation()}
        >
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Warning header bar */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-white text-base font-bold">
                Idle Session Warning
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-[#374151] mb-4">
                You will be{" "}
                <span className="font-semibold text-red-600">
                  automatically logged out
                </span>{" "}
                in:
              </p>

              {/* Countdown display */}
              <div className="flex justify-center mb-5">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl px-8 py-4 text-center">
                  <span className="text-3xl font-bold text-red-600 tabular-nums tracking-wider">
                    {formatTime(secondsLeft)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#6B7280] text-center">
                Click the button below to stay logged in.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-end">
              <Button
                className="px-6 py-2.5"
                text="Stay Logged In"
                style="primary"
                onClick={onStayLoggedIn}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdleWarningModal;
