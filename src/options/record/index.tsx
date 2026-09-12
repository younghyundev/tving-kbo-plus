import { RecordButton } from "../../components/record";
import selectors from "../../constant/selectors";
import { mountControl } from "../mount-control";

export function addRecordButton(enabled: boolean) {
  return mountControl({
    buttonSelector: 'button[aria-label="녹화"]',
    enabled,
    name: "녹화",
    node: <RecordButton />,
    position: "after",
    targetSelector: selectors.SPACE,
  });
}
