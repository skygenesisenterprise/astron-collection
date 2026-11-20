import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";

import { createMemoryDatabase, paginate, runMigrations } from "../src/storage/index.js";

describe("database", () => {
  it("supports prepared queries and rolls back a failed transaction", () => {
    const db = createMemoryDatabase();
    db.exec("CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT NOT NULL)");

    const inserted = db.run("INSERT INTO t (name) VALUES (?)", "alpha");
    assert.equal(inserted.changes, 1);
    assert.equal(db.get("SELECT name FROM t WHERE id = ?", inserted.lastInsertRowid).name, "alpha");
    assert.equal(db.all("SELECT * FROM t").length, 1);

    assert.throws(() => {
      db.transaction(() => {
        db.run("INSERT INTO t (name) VALUES (?)", "beta");
        throw new Error("rollback");
      });
    }, /rollback/);

    assert.equal(db.get("SELECT COUNT(*) AS count FROM t").count, 1);
    db.close();
    assert.throws(() => db.get("SELECT 1"), /closed/);
  });

  it("supports nested transactions with savepoints", () => {
    const db = createMemoryDatabase();
    db.exec("CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT)");

    db.transaction(() => {
      db.run("INSERT INTO t (name) VALUES (?)", "outer");
      assert.throws(() =>
        db.transaction(() => {
          db.run("INSERT INTO t (name) VALUES (?)", "inner");
          throw new Error("inner failure");
        }),
      );
    });

    assert.deepEqual(
      db.all("SELECT name FROM t").map((row) => row.name),
      ["outer"],
    );
    db.close();
  });
});

describe("migrations", () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), "astron-migrations-"));
  writeFileSync(
    path.join(dir, "001_init.sql"),
    "CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\n",
  );
  writeFileSync(path.join(dir, "002_seed.sql"), "INSERT INTO items (name) VALUES ('seeded');\n");
  after(() => rmSync(dir, { recursive: true, force: true }));

  it("applies pending migrations once and refuses an edited migration", () => {
    const db = createMemoryDatabase();

    const first = runMigrations(db, dir);
    assert.deepEqual(first.applied, ["001_init", "002_seed"]);
    assert.equal(db.get("SELECT COUNT(*) AS count FROM items").count, 1);

    const second = runMigrations(db, dir);
    assert.deepEqual(second.applied, []);
    assert.deepEqual(second.skipped, ["001_init", "002_seed"]);

    const file = path.join(dir, "002_seed.sql");
    const original = readFileSync(file, "utf8");
    writeFileSync(file, `${original}-- edited\n`);

    assert.throws(() => runMigrations(db, dir), /changed after it was applied/);

    writeFileSync(file, original);
    db.close();
  });
});

describe("value helpers", () => {
  it("clamps pagination to a safe window", () => {
    assert.deepEqual(paginate({ page: 0, pageSize: 999 }), {
      page: 1,
      pageSize: 50,
      offset: 0,
      limit: 50,
    });
    assert.deepEqual(paginate({ page: 3, pageSize: 10 }), {
      page: 3,
      pageSize: 10,
      offset: 20,
      limit: 10,
    });
  });
});
