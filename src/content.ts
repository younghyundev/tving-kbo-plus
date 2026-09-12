import selectors from "./constant/selectors";

type ContentFeaturesModule = typeof import("./content-features");

let featureModule: ContentFeaturesModule | null = null;
let activeRoot: HTMLElement | null = null;
let initializationId = 0;

function addedNodeContainsSportsRoot(node: Node): boolean {
  if (!(node instanceof Element)) return false;
  return (
    node.matches(selectors.SPORTS_GAME_ROOT) ||
    Boolean(node.querySelector(selectors.SPORTS_GAME_ROOT))
  );
}

function removedNodeContainsActiveRoot(node: Node): boolean {
  return (
    activeRoot !== null &&
    node instanceof Element &&
    (node === activeRoot || node.contains(activeRoot))
  );
}

async function initializeSportsRoot(root: HTMLElement): Promise<void> {
  const currentInitializationId = ++initializationId;
  const module = featureModule ?? (await import("./content-features"));
  featureModule = module;

  if (currentInitializationId !== initializationId || !root.isConnected) {
    return;
  }

  await module.initializeContentFeatures(root);
}

function syncSportsPage(): void {
  const root = document.querySelector<HTMLElement>(selectors.SPORTS_GAME_ROOT);
  if (!root) {
    if (activeRoot) featureModule?.disposeContentFeatures();
    activeRoot = null;
    initializationId += 1;
    return;
  }
  if (root === activeRoot) return;

  if (activeRoot) featureModule?.disposeContentFeatures();
  activeRoot = root;
  void initializeSportsRoot(root).catch((error: unknown) => {
    if (activeRoot === root) activeRoot = null;
    console.error("[TVING KBO PLUS] 초기화에 실패했습니다.", error);
  });
}

const pageObserver = new MutationObserver((mutations) => {
  const sportsRootChanged = mutations.some((mutation) => {
    if ([...mutation.removedNodes].some(removedNodeContainsActiveRoot)) {
      return true;
    }
    if (activeRoot) return false;
    return [...mutation.addedNodes].some(addedNodeContainsSportsRoot);
  });
  if (sportsRootChanged) syncSportsPage();
});

function startPageObservation(): void {
  pageObserver.observe(document, { childList: true, subtree: true });
  syncSportsPage();
}

window.addEventListener("pagehide", () => {
  pageObserver.disconnect();
  featureModule?.disposeContentFeatures();
  activeRoot = null;
  initializationId += 1;
});
window.addEventListener("pageshow", startPageObservation);

startPageObservation();
