import fs from "node:fs/promises";
import path from "node:path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const baseUrl = process.argv[2] || "http://127.0.0.1:4173";
const outDir = process.argv[3] || path.resolve("ai4kids-mobile-preview-v3");
const chromePort = Number(process.env.CHROME_DEBUG_PORT || 9222);

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.json();
};

class CDPClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();
    this.ws.addEventListener("message", (event) => this.#onMessage(event));
    this.ws.addEventListener("close", () => this.#onClose());
    this.ws.addEventListener("error", () => this.#onClose());
  }

  static async connect(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });
    return new CDPClient(ws);
  }

  #onMessage(event) {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }

    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);

      if (message.error) {
        pending.reject(new Error(message.error.message || "CDP command failed"));
        return;
      }
      pending.resolve(message.result);
      return;
    }

    if (message.method) {
      const waiters = this.eventWaiters.get(message.method);
      if (!waiters || !waiters.length) return;
      this.eventWaiters.set(message.method, []);
      waiters.forEach((waiter) => waiter.resolve(message.params || {}));
    }
  }

  #onClose() {
    const error = new Error("Chrome DevTools connection closed.");
    for (const pending of this.pending.values()) {
      pending.reject(error);
    }
    this.pending.clear();
    this.eventWaiters.clear();
  }

  send(method, params = {}, timeoutMs = 20000) {
    const id = this.nextId++;
    const payload = { id, method, params };
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for CDP response to ${method}`));
      }, timeoutMs);

      this.pending.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
      this.ws.send(JSON.stringify(payload));
    });
  }

  waitForEvent(method, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs);

      const waiter = {
        resolve: (params) => {
          clearTimeout(timeout);
          resolve(params);
        },
      };

      const current = this.eventWaiters.get(method) || [];
      current.push(waiter);
      this.eventWaiters.set(method, current);
    });
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    await this.waitForEvent("Page.loadEventFired", 20000);
  }

  async waitForSelector(selector, timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs;
    const expression = `Boolean(document.querySelector(${JSON.stringify(selector)}))`;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = await this.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
      });
      if (result?.result?.value) return true;
      if (Date.now() > deadline) return false;
      await sleep(200);
    }
  }

  async waitForAnySelector(selectors, timeoutMs = 20000) {
    const deadline = Date.now() + timeoutMs;
    const expression = `Boolean(${selectors
      .map((selector) => `document.querySelector(${JSON.stringify(selector)})`)
      .join("||")})`;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const result = await this.send("Runtime.evaluate", {
        expression,
        returnByValue: true,
      });
      if (result?.result?.value) return true;
      if (Date.now() > deadline) return false;
      await sleep(200);
    }
  }

  async scrollTo(selector) {
    await this.send("Runtime.evaluate", {
      expression: `document.querySelector(${JSON.stringify(
        selector
      )})?.scrollIntoView({block: 'start', inline: 'nearest', behavior: 'instant'});`,
    });
  }

  async screenshot(filepath) {
    const result = await this.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await fs.writeFile(filepath, Buffer.from(result.data, "base64"));
  }

  async close() {
    try {
      this.ws.close();
    } catch {
      // ignore
    }
  }
}

const getPageWsUrl = async () => {
  const targets = await fetchJson(`http://127.0.0.1:${chromePort}/json/list`);
  const page = targets.find((target) => target.type === "page");
  if (!page?.webSocketDebuggerUrl) {
    throw new Error("Unable to find a Chrome page target with a websocket debugger url.");
  }
  return page.webSocketDebuggerUrl;
};

const seedCart = {
  items: [
    {
      itemType: "product",
      productId: "demo-product-1",
      comboKey: "",
      sku: "T22",
      slug: "t22-scooter-light-music-sensor",
      name: "T22 SCOOTER LIGHT MUSIC SENSOR",
      price: 3999,
      originalPrice: 6000,
      imageUrl: "/assets/ui/hero-mobile-reference.png",
      category: "Outdoor & Sports Toys",
      ageGroup: "3+",
      discountPercent: 33,
      moq: 1,
      stockCount: 99,
      quantity: 1,
    },
  ],
  coupon: null,
};

const run = async () => {
  await fs.mkdir(outDir, { recursive: true });

  const wsUrl = await getPageWsUrl();
  const cdp = await CDPClient.connect(wsUrl);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await cdp.send("Emulation.setScrollbarsHidden", { hidden: true });
  await cdp.send("Emulation.setUserAgentOverride", {
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
  });

  // Home: top
  console.log("[shots] Home: top");
  await cdp.navigate(`${baseUrl}/`);
  await cdp.waitForSelector(".hero-reference-card", 20000);
  await sleep(1200);
  await cdp.screenshot(path.join(outDir, "01-home-top.png"));

  // Home: categories
  console.log("[shots] Home: categories");
  await cdp.scrollTo(".category-showcase-panel");
  await sleep(600);
  await cdp.screenshot(path.join(outDir, "02-home-categories.png"));

  // Home: product grid
  console.log("[shots] Home: product grid");
  await cdp.scrollTo(".home-rail-card");
  await sleep(600);
  await cdp.screenshot(path.join(outDir, "03-home-product-grid.png"));

  // Listing: top
  console.log("[shots] Products: top");
  await cdp.navigate(`${baseUrl}/products`);
  await cdp.waitForSelector(".listing-search-card", 20000);
  await cdp.waitForAnySelector([".product-card", ".placeholder-card", ".empty-state"], 25000);
  await sleep(1400);
  await cdp.screenshot(path.join(outDir, "04-products-top.png"));

  // Listing: product grid
  console.log("[shots] Products: grid");
  await cdp.scrollTo(".catalog-card-list");
  await sleep(600);
  await cdp.screenshot(path.join(outDir, "05-products-grid.png"));

  // Seed cart + Checkout: payment selector near CTA
  console.log("[shots] Checkout: pay mode near CTA");
  const cartSeedString = JSON.stringify(seedCart);
  await cdp.send("Runtime.evaluate", {
    expression: `localStorage.setItem('ai4kids-cart', ${JSON.stringify(cartSeedString)});`,
  });
  await cdp.navigate(`${baseUrl}/checkout`);
  await cdp.waitForAnySelector([".mobile-pay-bar", ".checkout-paymode-grid", ".empty-state"], 25000);
  await sleep(1200);
  await cdp.scrollTo(".mobile-pay-bar");
  await sleep(600);
  await cdp.screenshot(path.join(outDir, "06-checkout-paymode.png"));

  await cdp.close();
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
