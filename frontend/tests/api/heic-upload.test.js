import { beforeEach, describe, expect, it, vi } from "vitest";

const { convertHeic } = vi.hoisted(() => ({
  convertHeic: vi.fn(),
}));

vi.mock("heic2any", () => ({
  default: convertHeic,
}));

import { isHeicImage, prepareImageFile } from "../../src/lib/heic-upload.js";

describe("HEIC image uploads", () => {
  beforeEach(() => {
    convertHeic.mockReset();
  });

  it.each([
    ["photo.HEIC", "application/octet-stream"],
    ["photo", "image/heic"],
    ["photo.heif", "image/heif"],
    ["photo", "image/heic-sequence"],
  ])("recognizes %s with MIME type %s", (name, type) => {
    expect(isHeicImage(new File(["image"], name, { type }))).toBe(true);
  });

  it("does not convert standard web image formats", async () => {
    const file = new File(["image"], "photo.png", { type: "image/png" });

    await expect(prepareImageFile(file)).resolves.toBe(file);
    expect(convertHeic).not.toHaveBeenCalled();
  });

  it("converts HEIC to a JPEG file accepted by existing storage policies", async () => {
    convertHeic.mockResolvedValue(new Blob(["converted"], { type: "image/jpeg" }));
    const source = new File(["heic-data"], "portrait.HEIC", {
      type: "image/heic",
      lastModified: 123,
    });

    const converted = await prepareImageFile(source);

    expect(convertHeic).toHaveBeenCalledWith({
      blob: source,
      toType: "image/jpeg",
      quality: 0.9,
    });
    expect(converted).toBeInstanceOf(File);
    expect(converted.name).toBe("portrait.jpg");
    expect(converted.type).toBe("image/jpeg");
    expect(converted.lastModified).toBe(123);
    expect(await converted.text()).toBe("converted");
  });

  it("uses the first converted frame if the converter returns multiple blobs", async () => {
    convertHeic.mockResolvedValue([
      new Blob(["first"], { type: "image/jpeg" }),
      new Blob(["second"], { type: "image/jpeg" }),
    ]);

    const converted = await prepareImageFile(
      new File(["heic-data"], "photo.heif", { type: "application/octet-stream" }),
    );

    expect(converted.name).toBe("photo.jpg");
    expect(await converted.text()).toBe("first");
  });
});
