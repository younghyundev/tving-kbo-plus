import { useRecord } from "../../hooks/use-record";

export const RecordButton = () => {
  const { isRecording, handleRecord } = useRecord();

  return (
    <button
      className="control-button"
      type="button"
      aria-label={isRecording ? "녹화 중지" : "녹화"}
      onClick={handleRecord}
      title={isRecording ? "녹화 중지" : "녹화"}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isRecording ? (
          <rect x="9" y="9" width="10" height="10" fill="red" />
        ) : (
          <circle cx="14" cy="14" r="6" fill="red" />
        )}
      </svg>
    </button>
  );
};
