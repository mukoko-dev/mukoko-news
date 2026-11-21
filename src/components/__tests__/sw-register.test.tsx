import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import {
  ServiceWorkerRegister,
  formatIncomingVersion,
  requestIncomingVersion,
} from "@/components/pwa/sw-register";

type Listener = (event?: unknown) => void;

function createEventTarget() {
  const listeners = new Map<string, Set<Listener>>();
  return {
    addEventListener: vi.fn((type: string, cb: Listener) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)?.add(cb);
    }),
    removeEventListener: vi.fn((type: string, cb: Listener) => {
      listeners.get(type)?.delete(cb);
    }),
    emit(type: string, event?: unknown) {
      listeners.get(type)?.forEach((cb) => cb(event));
    },
  };
}

function createMockWorker(state = "installing") {
  return { state, postMessage: vi.fn(), ...createEventTarget() };
}

type MockWorker = ReturnType<typeof createMockWorker>;

function createMockRegistration(
  overrides: {
    waiting?: MockWorker | null;
    installing?: MockWorker | null;
  } = {},
) {
  return {
    waiting: null,
    installing: null,
    update: vi.fn().mockResolvedValue(undefined),
    ...createEventTarget(),
    ...overrides,
  };
}

type MockRegistration = ReturnType<typeof createMockRegistration>;

function installMockContainer(
  registration: MockRegistration,
  { controller = {} as object | null } = {},
) {
  const container = {
    register: vi.fn().mockResolvedValue(registration),
    controller,
    ...createEventTarget(),
  };
  Object.defineProperty(window.navigator, "serviceWorker", {
    value: container,
    configurable: true,
  });
  return container;
}

function removeMockContainer() {
  delete (window.navigator as { serviceWorker?: unknown }).serviceWorker;
}

describe("ServiceWorkerRegister", () => {
  beforeEach(() => {
    // The component defers registration to the window load event unless the
    // document has already finished loading.
    Object.defineProperty(document, "readyState", {
      value: "complete",
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    removeMockContainer();
  });

  it("does not register outside production", async () => {
    const container = installMockContainer(createMockRegistration());
    render(<ServiceWorkerRegister />);
    await act(async () => {});
    expect(container.register).not.toHaveBeenCalled();
  });

  it("registers the constant /sw.js URL in production (the version is in the script bytes)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const container = installMockContainer(createMockRegistration());
    render(<ServiceWorkerRegister />);
    await waitFor(() =>
      expect(container.register).toHaveBeenCalledWith("/sw.js"),
    );
  });

  it("renders nothing and does not crash when serviceWorker is unsupported", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { container } = render(<ServiceWorkerRegister />);
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it("actively checks for updates on mount, on becoming visible and on focus", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const registration = createMockRegistration();
    installMockContainer(registration);
    render(<ServiceWorkerRegister />);

    // Mount: a PWA left open across a deploy picks it up without a
    // navigation. This is the fix for the background-PWA hole.
    await waitFor(() => expect(registration.update).toHaveBeenCalledTimes(1));

    // Reopening an installed PWA (visibility → visible).
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(registration.update).toHaveBeenCalledTimes(2);

    // Focusing the window.
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(registration.update).toHaveBeenCalledTimes(3);
  });

  it("does not check on visibility when the document is being hidden", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const registration = createMockRegistration();
    installMockContainer(registration);
    render(<ServiceWorkerRegister />);
    await waitFor(() => expect(registration.update).toHaveBeenCalled());

    act(() => {
      Object.defineProperty(document, "visibilityState", {
        value: "hidden",
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const calls = registration.update.mock.calls.length;
    expect(calls).toBe(1);

    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
  });

  it("shows the update banner for an already-waiting worker and posts SKIP_WAITING", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const waiting = createMockWorker("installed");
    installMockContainer(createMockRegistration({ waiting }));
    render(<ServiceWorkerRegister />);

    const refresh = await screen.findByRole("button", { name: /refresh/i });
    expect(screen.getByText("New version available")).toBeInTheDocument();

    fireEvent.click(refresh);
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  });

  it("names the release the waiting worker reports via GET_VERSION", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const waiting = createMockWorker("installed");
    const container = installMockContainer(createMockRegistration({ waiting }));
    render(<ServiceWorkerRegister />);

    await screen.findByText("New version available");
    await waitFor(() =>
      expect(waiting.postMessage).toHaveBeenCalledWith({ type: "GET_VERSION" }),
    );

    act(() => {
      container.emit("message", {
        data: {
          type: "VERSION",
          sha: "9f2c1ab7d4e5f60718293a4b5c6d7e8f90a1b2c3",
          version: "4.83.0",
        },
      });
    });

    expect(await screen.findByText("Upgrading to v4.83.0")).toBeInTheDocument();
  });

  it("shows the banner after updatefound → installed while controlled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const registration = createMockRegistration();
    const container = installMockContainer(registration);
    render(<ServiceWorkerRegister />);
    await waitFor(() => expect(container.register).toHaveBeenCalled());

    const installing = createMockWorker("installing");
    registration.installing = installing;
    act(() => registration.emit("updatefound"));

    installing.state = "installed";
    act(() => installing.emit("statechange"));

    expect(
      await screen.findByText("New version available"),
    ).toBeInTheDocument();
  });

  it("does not prompt on the very first install (no controller yet)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const registration = createMockRegistration();
    const container = installMockContainer(registration, { controller: null });
    render(<ServiceWorkerRegister />);
    await waitFor(() => expect(container.register).toHaveBeenCalled());

    const installing = createMockWorker("installing");
    registration.installing = installing;
    act(() => registration.emit("updatefound"));
    installing.state = "installed";
    act(() => installing.emit("statechange"));

    expect(screen.queryByText("New version available")).not.toBeInTheDocument();
  });

  it("reloads exactly once on controllerchange", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const container = installMockContainer(createMockRegistration());
    const reloadPage = vi.fn();
    render(<ServiceWorkerRegister reloadPage={reloadPage} />);
    await waitFor(() => expect(container.register).toHaveBeenCalled());

    act(() => container.emit("controllerchange"));
    act(() => container.emit("controllerchange"));
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });

  it("can be dismissed", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const waiting = createMockWorker("installed");
    installMockContainer(createMockRegistration({ waiting }));
    render(<ServiceWorkerRegister />);

    await screen.findByText("New version available");
    fireEvent.click(screen.getByRole("button", { name: /dismiss update/i }));
    expect(screen.queryByText("New version available")).not.toBeInTheDocument();
  });
});

/**
 * The card names the build it would upgrade you TO.
 *
 * "Update available" alone tells a reader nothing they can check afterwards —
 * they refresh and have no way to confirm they got the thing. The value comes
 * from the WAITING worker's own reply to GET_VERSION, because `process.env`
 * is baked into the bundle already running and therefore names the version
 * being left.
 */
describe("formatIncomingVersion", () => {
  it("renders the release with the leading v every release page uses", () => {
    expect(
      formatIncomingVersion({ sha: "9f2c1ab7d4e5f607", version: "4.60.0" }),
    ).toBe("v4.60.0");
  });

  it("prefers the release even though a sha is present and would otherwise parse", () => {
    // The regression this guards: a reader must never see the SHA while a
    // real version is available.
    expect(
      formatIncomingVersion({ sha: "9f2c1ab7d4e5f607", version: "4.60.0" }),
    ).not.toBe("9f2c1ab");
  });

  it("shortens a commit SHA the way git does", () => {
    expect(
      formatIncomingVersion({
        sha: "9f2c1ab7d4e5f60718293a4b5c6d7e8f90a1b2c3",
        version: "",
      }),
    ).toBe("9f2c1ab");
  });

  it.each([
    ["empty", ""],
    ["not semantic", "main"],
    ["partial", "4.60"],
  ])("ignores a %s version and falls back to the sha", (_label, version) => {
    // The version is ours to set, so a value that is not a plain semantic
    // version is a bug on our side — show the sha we do trust, not the junk.
    expect(formatIncomingVersion({ sha: "9f2c1ab7d4e5f607", version })).toBe(
      "9f2c1ab",
    );
  });

  it.each([
    ["no fields at all", {}],
    ["nothing but whitespace", { sha: "   ", version: "   " }],
    ["an implausibly long sha", { sha: "x".repeat(80), version: "" }],
    ["nullish fields", { sha: null, version: undefined }],
  ])("returns null for %s rather than inventing one", (_label, build) => {
    // A version line reading "unknown" is worse than no version line.
    expect(formatIncomingVersion(build)).toBeNull();
  });
});

describe("requestIncomingVersion", () => {
  afterEach(() => removeMockContainer());

  it("asks the worker for its build and formats the reply", async () => {
    const waiting = createMockWorker("installed");
    const container = installMockContainer(createMockRegistration({ waiting }));

    const promise = requestIncomingVersion(waiting as unknown as ServiceWorker);
    await waitFor(() =>
      expect(waiting.postMessage).toHaveBeenCalledWith({ type: "GET_VERSION" }),
    );

    act(() => {
      container.emit("message", {
        data: {
          type: "VERSION",
          sha: "9f2c1ab7d4e5f60718293a4b5c6d7e8f90a1b2c3",
          version: "4.83.0",
        },
      });
    });

    await expect(promise).resolves.toBe("v4.83.0");
  });

  it("resolves null when the worker predates GET_VERSION and never answers", async () => {
    vi.useFakeTimers();
    try {
      const waiting = createMockWorker("installed");
      installMockContainer(createMockRegistration({ waiting }));

      const promise = requestIncomingVersion(
        waiting as unknown as ServiceWorker,
      );
      await vi.advanceTimersByTimeAsync(1600);
      await expect(promise).resolves.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
