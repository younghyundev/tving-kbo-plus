import { waitForElement } from "./dom";
import selectors from "../constant/selectors";

export async function getVideoElement(): Promise<HTMLVideoElement | null> {
  return waitForElement<HTMLVideoElement>(selectors.VIDEO);
}

export async function getTitle(): Promise<string | null> {
  const title = await waitForElement<HTMLTitleElement>("head > title");
  return title?.textContent || null;
}

export function getCurrentTime(): string {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}${month}${date}${hours}${minutes}`;
}
