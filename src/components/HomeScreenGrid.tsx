import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import LinkAppIcon from './LinkAppIcon';
import LinkWidget from './LinkWidget';
import { HOME_HREF } from '../config/socialLinks';
import {
  CSS_DESKTOP_HOME_APP_ROW_HEIGHT,
  getInitialPositions,
  listAllowedCells,
  loadSavedPositions,
  posKey,
  savePositions,
  tryMoveApp,
  type AppSlotId,
  type CellPos,
} from '../lib/homeGrid';

const LONG_PRESS_MS = 1000;
const MOVE_CANCEL_PX = 14;
const MOBILE_PROFILE_ROW_HEIGHT = 74;
const MOBILE_APPS_ROW_HEIGHT = 84;
const MOBILE_GRID_GAP = 8;
const MOBILE_APP_ICON_SIZE = 74 * 0.81;
const MOBILE_VIBE_ICON_SIZE = MOBILE_APPS_ROW_HEIGHT + MOBILE_GRID_GAP + MOBILE_APP_ICON_SIZE;

const HOME_LINKS: Record<AppSlotId, string> = {
  website: HOME_HREF.website,
  book: HOME_HREF.book,
  github: HOME_HREF.github,
};

const APP_ICON_SRC: Record<AppSlotId, string> = {
  website: '/app-icons/website.png',
  book: '/book/cover.jpg',
  github: '/app-icons/github.png',
};

function appIconFor(id: AppSlotId): ReactNode {
  return <img src={APP_ICON_SRC[id]} alt="" width={74} height={74} draggable={false} />;
}

function appMeta(id: AppSlotId): { label: string; bare?: boolean } {
  switch (id) {
    case 'website':
      return { label: 'Website' };
    case 'book':
      return { label: 'My Book' };
    case 'github':
      return { label: 'GitHub', bare: true };
    default:
      return { label: '' };
  }
}

type AppDragPreviewProps = Readonly<{ appId: AppSlotId }>;

/** Vista previa semitransparente (misma forma que el icono flotante). */
function AppDragPreview({ appId }: AppDragPreviewProps) {
  const bare = appMeta(appId).bare;
  return (
    <>
      <div
        className={
          bare
            ? 'flex h-[calc(74px*0.81)] w-[calc(74px*0.81)] shrink-0 items-center justify-center overflow-hidden [&_img]:h-full [&_img]:w-full [&_img]:object-cover'
            : 'flex h-[calc(74px*0.81)] w-[calc(74px*0.81)] shrink-0 items-center justify-center overflow-hidden rounded-[calc(20px*0.81)] bg-white/90 shadow-[0_8px_20px_rgba(0,0,0,0.22)] [&_svg]:h-full [&_img]:h-full [&_img]:w-full [&_img]:object-cover'
        }
      >
        {appIconFor(appId)}
      </div>
      <span className="text-[12px] font-medium leading-none text-neutral-800">
        {appMeta(appId).label}
      </span>
    </>
  );
}

type HomeScreenGridProps = Readonly<{
  onOpenOpoGenius?: () => void;
  onOpenBook?: () => void;
}>;

export default function HomeScreenGrid({
  onOpenOpoGenius,
  onOpenBook,
}: HomeScreenGridProps) {
  const [positions, setPositions] = useState<Record<AppSlotId, CellPos>>(getInitialPositions);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [draggingId, setDraggingId] = useState<AppSlotId | null>(null);
  const [previewCell, setPreviewCell] = useState<CellPos | null>(null);
  const [previewAnchor, setPreviewAnchor] = useState<{ x: number; y: number } | null>(null);
  const [floatPos, setFloatPos] = useState({ x: 0, y: 0 });

  const positionsRef = useRef(positions);
  positionsRef.current = positions;

  const dragPointerIdRef = useRef<number | null>(null);
  const dragSourceElRef = useRef<HTMLElement | null>(null);
  const dragOriginRef = useRef<CellPos | null>(null);
  const skipClickRef = useRef(false);
  const slotElementsRef = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    const saved = loadSavedPositions();
    if (saved) setPositions(saved);
  }, []);

  useEffect(() => {
    const mql = globalThis.matchMedia('(max-width: 767px)');
    const onMediaChange = () => setIsMobileLayout(mql.matches);
    onMediaChange();
    mql.addEventListener('change', onMediaChange);

    return () => {
      mql.removeEventListener('change', onMediaChange);
    };
  }, []);

  useLayoutEffect(() => {
    if (!draggingId || !previewCell) {
      setPreviewAnchor(null);
      return;
    }
    const el = slotElementsRef.current.get(posKey(previewCell));
    if (!el) {
      setPreviewAnchor(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setPreviewAnchor({
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
    });
  }, [draggingId, previewCell]);

  const appByCell = useMemo(() => {
    const m = new Map<string, AppSlotId>();
    for (const id of Object.keys(positions) as AppSlotId[]) {
      m.set(posKey(positions[id]), id);
    }
    return m;
  }, [positions]);

  const registerSlot = useCallback((pos: CellPos, el: HTMLElement | null) => {
    slotElementsRef.current.set(posKey(pos), el);
  }, []);

  const resolveDropCell = useCallback((clientX: number, clientY: number): CellPos | null => {
    for (const [, el] of slotElementsRef.current) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (
        clientX >= r.left &&
        clientX <= r.right &&
        clientY >= r.top &&
        clientY <= r.bottom
      ) {
        const row = el.dataset.gridRow;
        const col = el.dataset.gridCol;
        if (row !== undefined && col !== undefined) {
          return { row: Number(row), col: Number(col) };
        }
      }
    }
    return null;
  }, []);

  const endDrag = useCallback(
    (clientX: number, clientY: number, appId: AppSlotId) => {
      const pid = dragPointerIdRef.current;
      const target = resolveDropCell(clientX, clientY);
      if (target) {
        setPositions((prev) => {
          const next = tryMoveApp(prev, appId, target);
          if (next) {
            savePositions(next);
            return next;
          }
          return prev;
        });
      }
      setDraggingId(null);
      setPreviewCell(null);
      dragPointerIdRef.current = null;
      dragOriginRef.current = null;
      try {
        const el = dragSourceElRef.current;
        if (el != null && pid != null) el.releasePointerCapture(pid);
      } catch {
        /* ignore */
      }
      dragSourceElRef.current = null;
      document.body.style.removeProperty('cursor');
    },
    [resolveDropCell],
  );

  useEffect(() => {
    if (!draggingId || dragPointerIdRef.current === null) return;

    const pid = dragPointerIdRef.current;
    const id = draggingId;

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      setFloatPos({ x: e.clientX, y: e.clientY });
      const over = resolveDropCell(e.clientX, e.clientY);
      const origin = dragOriginRef.current;
      setPreviewCell(over ?? origin);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== pid) return;
      skipClickRef.current = true;
      endDrag(e.clientX, e.clientY, id);
      globalThis.removeEventListener('pointermove', onMove);
      globalThis.removeEventListener('pointerup', onUp);
      globalThis.removeEventListener('pointercancel', onUp);
    };

    globalThis.addEventListener('pointermove', onMove);
    globalThis.addEventListener('pointerup', onUp);
    globalThis.addEventListener('pointercancel', onUp);

    return () => {
      globalThis.removeEventListener('pointermove', onMove);
      globalThis.removeEventListener('pointerup', onUp);
      globalThis.removeEventListener('pointercancel', onUp);
    };
  }, [draggingId, endDrag, resolveDropCell]);

  const makePointerHandlers = useCallback(
    (appId: AppSlotId) => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let startX = 0;
      let startY = 0;
      let activePointerId: number | null = null;

      const cleanupWindow = (move: (e: PointerEvent) => void, up: (e: PointerEvent) => void) => {
        globalThis.removeEventListener('pointermove', move);
        globalThis.removeEventListener('pointerup', up);
        globalThis.removeEventListener('pointercancel', up);
      };

      const onPointerDown = (e: React.PointerEvent<HTMLAnchorElement>) => {
        if (e.button !== 0) return;
        startX = e.clientX;
        startY = e.clientY;
        activePointerId = e.pointerId;

        const onEarlyMove = (ev: PointerEvent) => {
          if (ev.pointerId !== activePointerId) return;
          if (
            Math.hypot(ev.clientX - startX, ev.clientY - startY) > MOVE_CANCEL_PX
          ) {
            if (timer !== null) clearTimeout(timer);
            timer = null;
            cleanupWindow(onEarlyMove, onEarlyUp);
          }
        };

        const onEarlyUp = (ev: PointerEvent) => {
          if (ev.pointerId !== activePointerId) return;
          if (timer !== null) clearTimeout(timer);
          timer = null;
          cleanupWindow(onEarlyMove, onEarlyUp);
        };

        globalThis.addEventListener('pointermove', onEarlyMove);
        globalThis.addEventListener('pointerup', onEarlyUp);
        globalThis.addEventListener('pointercancel', onEarlyUp);

        timer = setTimeout(() => {
          timer = null;
          cleanupWindow(onEarlyMove, onEarlyUp);
          const origin = positionsRef.current[appId];
          dragOriginRef.current = origin;
          setPreviewCell(origin);
          dragPointerIdRef.current = e.pointerId;
          dragSourceElRef.current = e.currentTarget;
          setFloatPos({ x: e.clientX, y: e.clientY });
          setDraggingId(appId);
          document.body.style.cursor = 'grabbing';
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            /* ignore */
          }
        }, LONG_PRESS_MS);
      };

      const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (skipClickRef.current) {
          e.preventDefault();
          skipClickRef.current = false;
        }
      };

      return { onPointerDown, onClick };
    },
    [],
  );

  const handlersCache = useRef(
    new Map<AppSlotId, ReturnType<typeof makePointerHandlers>>(),
  );

  const getHandlers = (appId: AppSlotId) => {
    let h = handlersCache.current.get(appId);
    if (!h) {
      h = makePointerHandlers(appId);
      handlersCache.current.set(appId, h);
    }
    return h;
  };

  const allowedCells = listAllowedCells();

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div className="h-full w-full">
      <div
        className="grid h-full min-h-0 grid-cols-4 gap-2.5 max-md:gap-2 md:gap-[15px]"
        style={
          isMobileLayout
            ? {
                gridTemplateRows: `${MOBILE_PROFILE_ROW_HEIGHT}px ${MOBILE_PROFILE_ROW_HEIGHT}px repeat(4, ${MOBILE_APPS_ROW_HEIGHT}px)`,
              }
            : ({
                gridTemplateRows: `minmax(0, 1fr) minmax(0, 1fr) ${CSS_DESKTOP_HOME_APP_ROW_HEIGHT} ${CSS_DESKTOP_HOME_APP_ROW_HEIGHT} minmax(0, 1fr) minmax(0, 1fr)`,
                ['--desktop-app-row-height' as string]: CSS_DESKTOP_HOME_APP_ROW_HEIGHT,
                ['--desktop-vibe-square-max' as string]:
                  'min(100%, calc(2 * var(--desktop-app-row-height) + 15px))',
              } as CSSProperties)
        }
      >
        <LinkWidget
          variant="profile"
          caption="About me"
          className="col-span-4 row-span-2 h-full min-h-0 max-md:max-h-[82%] max-md:self-start md:max-h-[90%] md:self-end"
          profileImage="/foto-jasper.jpg"
          firstName="Jasper"
          lastName="van Puffelen López"
        />

        <LinkWidget
          caption="OpoGenius"
          onInternalNavigate={onOpenOpoGenius}
          aria-label="OpoGenius app"
          className="col-start-3 row-start-3 col-span-2 row-span-2 h-full min-h-0"
          iconSizeMobilePx={MOBILE_VIBE_ICON_SIZE}
          icon={
            <img
              src="/opogenius/icon.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              width={800}
              height={800}
              draggable={false}
              decoding="async"
            />
          }
        />
        {allowedCells.map((pos) => {
          const k = posKey(pos);
          const occupant = appByCell.get(k);
          return (
            <div
              key={k}
              ref={(el) => registerSlot(pos, el)}
              data-grid-row={pos.row}
              data-grid-col={pos.col}
              className="relative flex h-full min-h-0 min-w-0 items-start justify-center md:items-end"
              style={{
                gridRowStart: pos.row + 1,
                gridColumnStart: pos.col + 1,
              }}
            >
              {occupant ? (
                <LinkAppIcon
                  label={appMeta(occupant).label}
                  href={HOME_LINKS[occupant]}
                  bare={appMeta(occupant).bare}
                  icon={appIconFor(occupant)}
                  className={
                    draggingId === occupant
                      ? 'pointer-events-none invisible'
                      : ''
                  }
                  anchorProps={{
                    ...getHandlers(occupant),
                    style: { touchAction: 'manipulation' },
                    onClick: (e) => {
                      const wasSkipping = skipClickRef.current;
                      getHandlers(occupant).onClick(e);
                      if (wasSkipping) return;

                      if (occupant === 'book' && onOpenBook) {
                        e.preventDefault();
                        onOpenBook();
                      }
                    },
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      </div>

      {draggingId && previewAnchor ? (
        <div
          className="pointer-events-none fixed z-[150] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 opacity-40 [will-change:left,top]"
          style={{
            left: previewAnchor.x,
            top: previewAnchor.y,
            transition:
              'left 220ms cubic-bezier(0.22, 0.99, 0.35, 1), top 220ms cubic-bezier(0.22, 0.99, 0.35, 1)',
          }}
          aria-hidden
        >
          <AppDragPreview appId={draggingId} />
        </div>
      ) : null}

      {draggingId ? (
        <div
          className="pointer-events-none fixed z-[200] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
          style={{ left: floatPos.x, top: floatPos.y }}
          aria-hidden
        >
          <AppDragPreview appId={draggingId} />
        </div>
      ) : null}
    </div>
  );
}
