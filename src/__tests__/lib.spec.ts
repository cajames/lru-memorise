import memorise from "../lib";

describe("memorise", () => {
  it("should return a value for sync functions", () => {
    const testfn = jest
      .fn<string, any[]>()
      .mockReturnValueOnce("success")
      .mockReturnValue("failure");
    const cachedFn = memorise(testfn);

    const val1 = cachedFn();
    const val2 = cachedFn();
    const val3 = cachedFn();
    expect(val1).toBe("success");
    expect(val2).toBe("success");
    expect(val3).toBe("success");
    expect(testfn).toHaveBeenCalledTimes(1);
  });

  it("should return a value for async functions", async () => {
    const testFn = jest
      .fn<Promise<string>, any[]>()
      .mockResolvedValueOnce("success")
      .mockResolvedValue("failure");

    const cachedFn = memorise(testFn);

    const [val1, val2, val3] = await Promise.all([
      cachedFn(),
      cachedFn(),
      cachedFn(),
    ]);
    expect(val1).toBe("success");
    expect(val2).toBe("success");
    expect(val3).toBe("success");
    expect(testFn).toHaveBeenCalledTimes(1);
  });

  it("should pass through arguments to the cached function", () => {
    const testFn = jest.fn().mockReturnValue("success");
    const cachedFn = memorise(testFn);

    const payload1 = 123;
    const payload2 = "abc";
    const payload3 = { a: "testing" };

    cachedFn(payload1);
    cachedFn(payload1);
    cachedFn(payload2);
    cachedFn(payload2);
    cachedFn(payload3);
    cachedFn(payload3);

    expect(testFn).toHaveBeenCalledTimes(3);
    expect(testFn).toHaveBeenNthCalledWith(1, payload1);
    expect(testFn).toHaveBeenNthCalledWith(2, payload2);
    expect(testFn).toHaveBeenNthCalledWith(3, payload3);
  });

  it("should rerun function if cached value expired", (done) => {
    const testFn = jest.fn<string, any[]>().mockReturnValue("success");
    const cachedFn = memorise(testFn, { lruOptions: { ttl: 100 } });
    cachedFn();
    expect(testFn).toHaveBeenCalledTimes(1);

    setTimeout(() => {
      cachedFn();
      expect(testFn).toHaveBeenCalledTimes(1);
    }, 50);

    setTimeout(() => {
      cachedFn();
      expect(testFn).toHaveBeenCalledTimes(2);
      done();
    }, 150);
  });

  it("should rerun function if cached value out of bounds", () => {
    const testFn = jest.fn<string, any[]>().mockReturnValue("success");
    const cachedFn = memorise(testFn, { lruOptions: { max: 3 } });
    cachedFn("1");
    cachedFn("2");
    cachedFn("3");
    cachedFn("4");
    cachedFn("1");
    expect(testFn).toHaveBeenCalledTimes(5);
    expect(testFn).toHaveBeenLastCalledWith("1");
  });

  it("should allow use of a custom cache key function", () => {
    const testFn = jest.fn<number, [string]>().mockReturnValue(42);
    const cachedFn = memorise(testFn, {
      cacheKeyResolver: (arg) => {
        return `${arg}-key`;
      },
    });
    cachedFn("test");
    expect(cachedFn._cache.keys()).toMatchObject(["test-key"]);
  });

  it("should pass arguments correctly to the key function", () => {
    const testFn = jest.fn<number, any[]>().mockReturnValue(42);
    const keyResolver = jest.fn().mockReturnValue("test-result");
    const cachedFn = memorise(testFn, {
      cacheKeyResolver: keyResolver,
    });
    cachedFn("test", "the", { a: "rgs" }, 1);
    expect(keyResolver).toHaveBeenCalledWith("test", "the", { a: "rgs" }, 1);
  });

  it("should cache a promise rejection", async () => {
    const testFn = jest
      .fn<Promise<string>, any[]>()
      .mockRejectedValueOnce("fail1")
      .mockRejectedValueOnce("fail2");

    const cachedFn = memorise(testFn);

    try {
      await cachedFn();
    } catch (error) {}

    expect(() => cachedFn()).rejects.toMatch("fail1");
    expect(testFn).toHaveBeenCalledTimes(1);
    expect((cachedFn._cache as any).size).toBe(1);
  });

  it("should not cache failed functions", () => {
    const testFn = jest.fn().mockImplementation(() => {
      throw Error("fail1");
    });
    const cachedFn = memorise(testFn);

    expect(() => cachedFn()).toThrow("fail1");
    expect(() => cachedFn()).toThrow("fail1");
    expect((cachedFn._cache as any).size).toBe(0);
  });

  it("should cache 0 and null as values", () => {
    let testFn = jest.fn().mockReturnValue(0);
    let cachedFn = memorise(testFn);
    expect(cachedFn()).toBe(0);
    expect(cachedFn()).toBe(0);
    expect(testFn).toHaveBeenCalledTimes(1);

    testFn = jest.fn().mockReturnValue(null);
    cachedFn = memorise(testFn);
    expect(cachedFn()).toBe(null);
    expect(cachedFn()).toBe(null);
    expect(testFn).toHaveBeenCalledTimes(1);
  });

  // Later features
  xit("should not cache a promise rejection when configured not to", async () => {});
  xit("should cache an error when configured to", async () => {});
});
