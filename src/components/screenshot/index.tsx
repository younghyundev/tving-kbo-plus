import { useCallback } from "react";
import { screenshot } from "../../utils/screenshot";

export const ScreenshotButton = () => {
  const handleOnClick = useCallback(() => {
    void screenshot();
  }, []);

  return (
    <button
      className="control-button"
      type="button"
      aria-label="스크린샷"
      onClick={handleOnClick}
      title="스크린샷"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.333 7H19.25l-1.167-2.333h-8.166L8.75 7H4.667A2.333 2.333 0 002.333 9.333v11.334A2.333 2.333 0 004.667 23h18.666a2.333 2.333 0 002.334-2.333V9.333A2.333 2.333 0 0023.333 7zM14 19.833a4.667 4.667 0 110-9.333 4.667 4.667 0 010 9.333z"
          fill="#fff"
        />
      </svg>
    </button>
  );
};
