import selectors from "../../constant/selectors";

export async function hideLikeButton(enabled: boolean) {
  if (!enabled) return;
  if (document.getElementById("kbo-plus-hide-like-style")) return;

  const style = document.createElement("style");
  style.id = "kbo-plus-hide-like-style";
  style.textContent = `
    ${selectors.LIKE_BUTTON} {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}
