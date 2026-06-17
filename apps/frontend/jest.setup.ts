import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/tasks"),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  redirect: jest.fn(),
}));

if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response),
  );
}
