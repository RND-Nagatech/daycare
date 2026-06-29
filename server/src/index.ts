import "dotenv/config";

import cors from "cors";
import express from "express";
import { closeDatabase, collections, connectDatabase } from "./db.js";
import { daycareService } from "./daycare-service.js";
import { createToken, verifyPassword, verifyToken } from "./auth-utils.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "daycare-server" });
});

function ok<T>(res: express.Response, data: T, message = "OK", status = 200) {
  res.status(status).json({ success: true, message, data });
}

function v1Get(path: string, handler: (req: express.Request) => Promise<unknown>) {
  app.get(`/api/v1${path}`, async (req, res, next) => {
    try {
      ok(res, await handler(req));
    } catch (error) {
      next(error);
    }
  });
}

function v1Post(path: string, handler: (req: express.Request) => Promise<unknown>) {
  app.post(`/api/v1${path}`, async (req, res, next) => {
    try {
      ok(res, await handler(req), "Created", 201);
    } catch (error) {
      next(error);
    }
  });
}

function v1Patch(path: string, handler: (req: express.Request) => Promise<unknown>) {
  app.patch(`/api/v1${path}`, async (req, res, next) => {
    try {
      ok(res, await handler(req));
    } catch (error) {
      next(error);
    }
  });
}

function v1Put(path: string, handler: (req: express.Request) => Promise<unknown>) {
  app.put(`/api/v1${path}`, async (req, res, next) => {
    try {
      ok(res, await handler(req));
    } catch (error) {
      next(error);
    }
  });
}

function v1Delete(path: string, handler: (req: express.Request) => Promise<unknown>) {
  app.delete(`/api/v1${path}`, async (req, res, next) => {
    try {
      ok(res, await handler(req));
    } catch (error) {
      next(error);
    }
  });
}

function routeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function publicUser(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

app.get("/api/v1/app-config", async (_req, res, next) => {
  try {
    const profile = await collections().daycareProfile.findOne({}, { projection: { _id: 0, name: 1, logo: 1 } });
    ok(res, { appName: profile?.name?.trim() || "Daycare Management", logo: profile?.logo });
  } catch (error) {
    next(error);
  }
});

app.post("/api/v1/auth/login", async (req, res, next) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    const password = String(req.body.password ?? "");
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email dan password wajib diisi", errors: {} });
      return;
    }

    const user = await collections().users.findOne({ email });
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ success: false, message: "Email atau password salah", errors: {} });
      return;
    }

    ok(
      res,
      {
        token: createToken({ userId: user.id, email: user.email, role: user.role }),
        user: publicUser(user),
      },
      "Login berhasil",
    );
  } catch (error) {
    next(error);
  }
});

app.use("/api/v1", async (req, res, next) => {
  try {
    const [scheme, token] = String(req.headers.authorization ?? "").split(" ");
    const payload = /^Bearer$/i.test(scheme) ? verifyToken(token ?? "") : null;
    if (!payload) {
      res.status(401).json({ success: false, message: "Login dibutuhkan", errors: {} });
      return;
    }

    const user = await collections().users.findOne({ id: payload.userId, isActive: true });
    if (!user) {
      res.status(401).json({ success: false, message: "Session tidak valid", errors: {} });
      return;
    }
    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
});

v1Get("/auth/me", (req) => Promise.resolve(publicUser(req.res?.locals.user)));

v1Get("/daycare", () => daycareService.snapshot());
v1Get("/master-data", () => daycareService.masterData());
v1Get("/master/:resource", (req) => daycareService.listMasterResource(routeParam(req.params.resource)));
v1Get("/dashboard/admin", () => daycareService.dashboardAdmin());
v1Get("/users", () => daycareService.listUsers());

v1Post("/master/:resource", (req) => daycareService.createMasterResource(routeParam(req.params.resource), req.body));
v1Post("/anak", (req) => daycareService.createChild(req.body));
v1Post("/registrasi-anak", (req) => daycareService.createChild(req.body));
v1Post("/pembelian-paket", (req) => daycareService.purchasePackage(req.body, req.res?.locals.user.id));
v1Post("/booking", (req) => daycareService.createBooking(req.body));
v1Post("/checkin", (req) => daycareService.checkIn(req.body.childId, req.body));
v1Post("/aktivitas-harian", (req) => daycareService.createActivity(req.body));
v1Post("/catatan-kesehatan", (req) => daycareService.createHealthNote(req.body));
v1Post("/insiden", (req) => daycareService.createIncident(req.body));
v1Post("/pembayaran", (req) => daycareService.createPayment(req.body));
v1Post("/pembayaran/:paymentId/verify", (req) => daycareService.verifyPayment(routeParam(req.params.paymentId), req.body, req.res?.locals.user.id));
v1Post("/pembayaran/:paymentId/reject", (req) => daycareService.rejectPayment(routeParam(req.params.paymentId), req.body, req.res?.locals.user.id));
v1Post("/users", (req) => daycareService.createUser(req.body));

v1Patch("/anak/:childId/check-in", (req) => daycareService.checkIn(routeParam(req.params.childId), req.body));
v1Patch("/anak/:childId/check-out", (req) => daycareService.checkOut(routeParam(req.params.childId), req.body));
v1Patch("/pengaturan/profil-daycare", (req) => daycareService.updateDaycareProfile(req.body));
v1Post("/tagihan/recalculate", () => daycareService.recalculateInvoices());
v1Put("/master/:resource/:id", (req) =>
  daycareService.updateMasterResource(routeParam(req.params.resource), routeParam(req.params.id), req.body),
);
v1Put("/users/:id", (req) => daycareService.updateUser(routeParam(req.params.id), req.body));
v1Delete("/master/:resource/:id", (req) =>
  daycareService.deleteMasterResource(routeParam(req.params.resource), routeParam(req.params.id)),
);
v1Delete("/users/:id", (req) => daycareService.deleteUser(routeParam(req.params.id)));

app.get("/api/daycare", async (_req, res, next) => {
  try {
    res.json(await daycareService.snapshot());
  } catch (error) {
    next(error);
  }
});

app.get("/api/master-data", async (_req, res, next) => {
  try {
    res.json(await daycareService.masterData());
  } catch (error) {
    next(error);
  }
});

app.post("/api/daycare/children", async (req, res, next) => {
  try {
    res.status(201).json(await daycareService.createChild(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/daycare/package-purchases", async (req, res, next) => {
  try {
    res.status(201).json(await daycareService.purchasePackage(req.body, res.locals.user?.id));
  } catch (error) {
    next(error);
  }
});

app.post("/api/daycare/bookings", async (req, res, next) => {
  try {
    res.status(201).json(await daycareService.createBooking(req.body));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/daycare/children/:childId/check-in", async (req, res, next) => {
  try {
    res.json(await daycareService.checkIn(req.params.childId, req.body));
  } catch (error) {
    next(error);
  }
});

app.patch("/api/daycare/children/:childId/check-out", async (req, res, next) => {
  try {
    res.json(await daycareService.checkOut(req.params.childId, req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/daycare/activities", async (req, res, next) => {
  try {
    res.status(201).json(await daycareService.createActivity(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/daycare/payments", async (req, res, next) => {
  try {
    res.status(201).json(await daycareService.createPayment(req.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/daycare/invoices/recalculate", async (_req, res, next) => {
  try {
    res.json(await daycareService.recalculateInvoices());
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
  res.status(Number.isFinite(status) ? status : 500).json({
    success: false,
    message: error instanceof Error ? error.message : "Internal server error",
    errors: {},
  });
});

await connectDatabase();

const server = app.listen(port, () => {
  console.log(`Daycare server listening on http://127.0.0.1:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  });
}
