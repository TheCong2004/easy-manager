import { RefObject, useCallback, useEffect, useRef } from "react";

const RESIZE_MESSAGE_TYPE = "EASY_MANAGER_HTML_EMBED_RESIZE";

function dimensionOf(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return Math.max(
    rect.height || 0,
    element.scrollHeight || 0,
    element.offsetHeight || 0,
    element.clientHeight || 0
  );
}

export function measureElementContentHeight(root: HTMLElement) {
  const rootRect = root.getBoundingClientRect();
  let maxBottom = Math.max(
    root.scrollHeight || 0,
    root.offsetHeight || 0,
    root.clientHeight || 0,
    rootRect.height || 0
  );

  const children = Array.from(root.querySelectorAll("*")) as HTMLElement[];
  for (const element of children) {
    const rect = element.getBoundingClientRect();
    const height = dimensionOf(element);
    const bottom = rect.top - rootRect.top + height;
    if (Number.isFinite(bottom)) {
      maxBottom = Math.max(maxBottom, bottom);
    }
  }

  return Math.ceil(maxBottom);
}

export function measureDocumentContentHeight(doc: Document) {
  const body = doc.body;
  const html = doc.documentElement;

  return Math.ceil(
    Math.max(
      body ? measureElementContentHeight(body) : 0,
      html ? measureElementContentHeight(html) : 0,
      body?.scrollHeight || 0,
      html?.scrollHeight || 0,
      body?.offsetHeight || 0,
      html?.offsetHeight || 0,
      body?.clientHeight || 0,
      html?.clientHeight || 0
    )
  );
}

export function withHtmlResizeMessenger(html: string) {
  const script = `
<script>
(function () {
  function measureElement(root) {
    if (!root || !root.getBoundingClientRect) return 0;
    var rootRect = root.getBoundingClientRect();
    var maxBottom = Math.max(root.scrollHeight || 0, root.offsetHeight || 0, root.clientHeight || 0, rootRect.height || 0);
    var children = root.querySelectorAll("*");
    for (var i = 0; i < children.length; i += 1) {
      var el = children[i];
      if (!el || !el.getBoundingClientRect) continue;
      var rect = el.getBoundingClientRect();
      var h = Math.max(rect.height || 0, el.scrollHeight || 0, el.offsetHeight || 0, el.clientHeight || 0);
      maxBottom = Math.max(maxBottom, rect.top - rootRect.top + h);
    }
    return Math.ceil(maxBottom);
  }
  function postHeight() {
    var height = Math.max(
      measureElement(document.body),
      measureElement(document.documentElement),
      document.body ? document.body.scrollHeight : 0,
      document.documentElement ? document.documentElement.scrollHeight : 0
    );
    parent.postMessage({ type: "${RESIZE_MESSAGE_TYPE}", height: height }, "*");
  }
  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      postHeight();
    });
  }
  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule);
  if ("ResizeObserver" in window && document.documentElement) {
    new ResizeObserver(schedule).observe(document.documentElement);
  }
  if ("MutationObserver" in window && document.documentElement) {
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
  }
  Array.prototype.forEach.call(document.images || [], function (img) {
    if (!img.complete) img.addEventListener("load", schedule, { once: true });
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule).catch(function () {});
  }
  setTimeout(schedule, 60);
  setTimeout(schedule, 300);
  setTimeout(schedule, 1200);
})();
</script>`;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${script}</body>`);
  }

  return `${html}${script}`;
}

export function useAutoFitHtmlHeight(options: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  enabled: boolean;
  minHeight: number;
  onHeightChange: (height: number) => void;
}) {
  const { iframeRef, enabled, minHeight, onHeightChange } = options;
  const cleanupRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number | null>(null);
  const latestHeightRef = useRef(0);

  const cleanup = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const measureNow = useCallback(() => {
    if (!enabled) return;

    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return;

    const measured = measureDocumentContentHeight(doc);
    const nextHeight = Math.max(minHeight, measured);
    if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;

    if (Math.abs(latestHeightRef.current - nextHeight) >= 2) {
      latestHeightRef.current = nextHeight;
      onHeightChange(nextHeight);
    }
  }, [enabled, iframeRef, minHeight, onHeightChange]);

  const scheduleMeasure = useCallback(() => {
    if (!enabled || rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      measureNow();
    });
  }, [enabled, measureNow]);

  const bind = useCallback(() => {
    cleanup();
    if (!enabled) return;

    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!iframe || !doc || !win) return;

    const listeners: Array<() => void> = [];
    const iframeWindow = win as unknown as {
      ResizeObserver?: typeof ResizeObserver;
      MutationObserver?: typeof MutationObserver;
    };
    const ResizeObserverClass = iframeWindow.ResizeObserver || window.ResizeObserver;
    const MutationObserverClass = iframeWindow.MutationObserver || window.MutationObserver;

    const resizeObserver = ResizeObserverClass ? new ResizeObserverClass(scheduleMeasure) : null;
    if (resizeObserver) {
      if (doc.documentElement) resizeObserver.observe(doc.documentElement);
      if (doc.body) resizeObserver.observe(doc.body);
      listeners.push(() => resizeObserver.disconnect());
    }

    const mutationObserver = MutationObserverClass ? new MutationObserverClass(scheduleMeasure) : null;
    if (mutationObserver && doc.documentElement) {
      mutationObserver.observe(doc.documentElement, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
      });
      listeners.push(() => mutationObserver.disconnect());
    }

    const images = Array.from(doc.images || []);
    for (const image of images) {
      if (image.complete) continue;
      image.addEventListener("load", scheduleMeasure);
      image.addEventListener("error", scheduleMeasure);
      listeners.push(() => {
        image.removeEventListener("load", scheduleMeasure);
        image.removeEventListener("error", scheduleMeasure);
      });
    }

    win.addEventListener("resize", scheduleMeasure);
    listeners.push(() => win.removeEventListener("resize", scheduleMeasure));

    doc.fonts?.ready.then(scheduleMeasure).catch(() => undefined);

    cleanupRef.current = () => {
      listeners.forEach((dispose) => dispose());
    };

    scheduleMeasure();
    window.setTimeout(scheduleMeasure, 120);
    window.setTimeout(scheduleMeasure, 500);
    window.setTimeout(scheduleMeasure, 1500);
  }, [cleanup, enabled, iframeRef, scheduleMeasure]);

  useEffect(() => {
    if (!enabled) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data || {};
      if (data.type !== RESIZE_MESSAGE_TYPE || typeof data.height !== "number") return;
      const nextHeight = Math.max(minHeight, Math.ceil(data.height));
      if (Math.abs(latestHeightRef.current - nextHeight) >= 2) {
        latestHeightRef.current = nextHeight;
        onHeightChange(nextHeight);
      }
    };

    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("message", handleMessage);
      cleanup();
    };
  }, [cleanup, enabled, iframeRef, minHeight, onHeightChange, scheduleMeasure]);

  return { bind, measureNow, scheduleMeasure };
}
