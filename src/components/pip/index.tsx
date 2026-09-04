import { useEffect, useState } from "react";
import { togglePip } from "../../utils/pip";
import { getVideoElement } from "../../utils/get";

export const PipButton = () => {
  const [isPip, setIsPip] = useState(false);

  useEffect(() => {
    let video: HTMLVideoElement | null = null;
    let disposed = false;
    const updatePipState = () => {
      setIsPip(document.pictureInPictureElement !== null);
    };

    getVideoElement().then((element) => {
      if (!element || disposed) return;

      video = element;
      video.addEventListener("enterpictureinpicture", updatePipState);
      video.addEventListener("leavepictureinpicture", updatePipState);
      updatePipState();
    });

    return () => {
      disposed = true;
      video?.removeEventListener("enterpictureinpicture", updatePipState);
      video?.removeEventListener("leavepictureinpicture", updatePipState);
    };
  }, []);

  const handleOnClick = async () => {
    const result = await togglePip();
    setIsPip(result);
  };

  return (
    <button
      className="control-button"
      type="button"
      aria-label={isPip ? "PIP 종료" : "PIP 모드"}
      onClick={handleOnClick}
      title={isPip ? "PIP 종료" : "PIP 모드"}
    >
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {!isPip ? (
          <>
            <rect x="3" y="6" width="22" height="16" rx="1" stroke="#fff" strokeWidth="2" fill="none" />
            <rect x="14" y="13" width="9" height="7" rx="1" fill="#fff" />
          </>
        ) : (
          <>
            <rect x="3" y="6" width="22" height="16" rx="1" stroke="#fff" strokeWidth="2" fill="none" />
            <rect x="14" y="13" width="9" height="7" rx="1" stroke="#fff" strokeWidth="2" fill="none" />
          </>
        )}
      </svg>
    </button>
  );
};
