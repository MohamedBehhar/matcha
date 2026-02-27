/**
 * IV.2: Explicit GPS consent. If user opts out, they must set location manually to use matching.
 */
const LOCATION_CONSENT_KEY = "location_gps_consent";

export type LocationConsent = "pending" | "granted" | "denied";

export function getLocationConsent(): LocationConsent {
  if (typeof window === "undefined") return "pending";
  const v = localStorage.getItem(LOCATION_CONSENT_KEY);
  if (v === "granted" || v === "denied") return v;
  return "pending";
}

export function setLocationConsent(value: "granted" | "denied"): void {
  localStorage.setItem(LOCATION_CONSENT_KEY, value);
}

export default function LocationConsentModal({
  open,
  onClose,
  onGranted,
  onDenied,
}: {
  open: boolean;
  onClose: () => void;
  onGranted: () => void;
  onDenied: () => void;
}) {
  if (!open) return null;

  const handleYes = () => {
    setLocationConsent("granted");
    onGranted();
    onClose();
  };

  const handleNo = () => {
    setLocationConsent("denied");
    onDenied();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Use your location?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          We can use GPS to show your neighborhood for better matches. You can
          change this later in profile settings.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleYes}
            className="flex-1 py-2.5 px-4 rounded-lg bg-red-primary hover:bg-red-600 text-white font-medium"
          >
            Yes, use GPS
          </button>
          <button
            type="button"
            onClick={handleNo}
            className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
          >
            No, I&apos;ll set it manually
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          If you opt out, you must set your city or neighborhood manually to use
          matching.
        </p>
      </div>
    </div>
  );
}
