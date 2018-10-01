import { LRUMap } from "./lru.js";

const asserteq = (a, b) => expect(a).toEqual(b);
const assert = a => expect(a).toBeTruthy();
assert.deepEqual = (a, b) => expect(a).toEqual(b); // .objectContaining(b);
assert.throws = a => expect(a).toThrow();

describe("LRUMap", () => {
  it("set and get", () => {
    let c = new LRUMap(4);
    asserteq(c.size, 0);
    asserteq(c.limit, 4);
    asserteq(c.oldest, undefined);
    asserteq(c.newest, undefined);

    c.set("adam", 29)
      .set("john", 26)
      .set("angela", 24)
      .set("bob", 48);
    // asserteq(c.toString(), "adam:29 < john:26 < angela:24 < bob:48");
    asserteq(c.size, 4);

    asserteq(c.get("adam"), 29);
    asserteq(c.get("john"), 26);
    asserteq(c.get("angela"), 24);
    asserteq(c.get("bob"), 48);
    // asserteq(c.toString(), "adam:29 < john:26 < angela:24 < bob:48");

    asserteq(c.get("angela"), 24);
    // asserteq(c.toString(), "adam:29 < john:26 < bob:48 < angela:24");

    c.set("ygwie", 81);
    // asserteq(c.toString(), "john:26 < bob:48 < angela:24 < ygwie:81");
    asserteq(c.size, 4);
    asserteq(c.get("adam"), undefined);

    c.set("john", 11);
    // asserteq(c.toString(), "bob:48 < angela:24 < ygwie:81 < john:11");
    asserteq(c.get("john"), 11);

    // let expectedKeys = ["bob", "angela", "ygwie", "john"];
    // c.forEach(function(v, k) {
    //   //sys.sets(k+': '+v);
    //   asserteq(k, expectedKeys.shift());
    // });

    // removing one item decrements size by one
    // let currentSize = c.size;
    // assert(c.delete("john") !== undefined);
    // asserteq(currentSize - 1, c.size);
  });

  it("construct with iterator", () => {
    let verifyEntries = function(c) {
      asserteq(c.size, 4);
      asserteq(c.limit, 4);
      asserteq(c.oldest.key, "adam");
      asserteq(c.newest.key, "bob");
      asserteq(c.get("adam"), 29);
      asserteq(c.get("john"), 26);
      asserteq(c.get("angela"), 24);
      asserteq(c.get("bob"), 48);
    };

    // with explicit limit
    verifyEntries(
      new LRUMap(4, [["adam", 29], ["john", 26], ["angela", 24], ["bob", 48]])
    );

    // with inferred limit
    verifyEntries(
      new LRUMap([["adam", 29], ["john", 26], ["angela", 24], ["bob", 48]])
    );
  });

  it("assign", () => {
    let c = new LRUMap([
      ["adam", 29],
      ["john", 26],
      ["angela", 24],
      ["bob", 48]
    ]);

    let newEntries = [["mimi", 1], ["patrick", 2], ["jane", 3], ["fred", 4]];
    c.assign(newEntries);
    asserteq(c.size, 4);
    asserteq(c.limit, 4);
    asserteq(c.oldest.key, newEntries[0][0]);
    asserteq(c.newest.key, newEntries[newEntries.length - 1][0]);
    // let i = 0;
    // c.forEach(function(v, k) {
    //   asserteq(k, newEntries[i][0]);
    //   asserteq(v, newEntries[i][1]);
    //   i++;
    // });

    // assigning too many items should throw an exception
    assert.throws(() => {
      c.assign([
        ["adam", 29],
        ["john", 26],
        ["angela", 24],
        ["bob", 48],
        ["ken", 30]
      ]);
    }, /overflow/);

    // assigning less than limit should not affect limit but adjust size
    c.assign([["adam", 29], ["john", 26], ["angela", 24]]);
    asserteq(c.size, 3);
    asserteq(c.limit, 4);
  });

  // it("delete", () => {
  //   let c = new LRUMap([
  //     ["adam", 29],
  //     ["john", 26],
  //     ["angela", 24],
  //     ["bob", 48]
  //   ]);
  //   c.delete("adam");
  //   asserteq(c.size, 3);
  //   c.delete("angela");
  //   asserteq(c.size, 2);
  //   c.delete("bob");
  //   asserteq(c.size, 1);
  //   c.delete("john");
  //   asserteq(c.size, 0);
  //   asserteq(c.oldest, undefined);
  //   asserteq(c.newest, undefined);
  // });

  // it("clear", () => {
  //   let c = new LRUMap(4);
  //   c.set("adam", 29);
  //   c.set("john", 26);
  //   asserteq(c.size, 2);
  //   c.clear();
  //   asserteq(c.size, 0);
  //   asserteq(c.oldest, undefined);
  //   asserteq(c.newest, undefined);
  // });

  // it("shift", () => {
  //   let c2 = new LRUMap(4);
  //   asserteq(c2.size, 0);
  //   c2.set("a", 1);
  //   c2.set("b", 2);
  //   c2.set("c", 3);
  //   asserteq(c2.size, 3);

  //   let e = c2.shift();
  //   asserteq(e[0], "a");
  //   asserteq(e[1], 1);

  //   e = c2.shift();
  //   asserteq(e[0], "b");
  //   asserteq(e[1], 2);

  //   e = c2.shift();
  //   asserteq(e[0], "c");
  //   asserteq(e[1], 3);

  //   // c2 should be empty
  //   c2.forEach(function() {
  //     assert(false);
  //   });
  //   asserteq(c2.size, 0);
  // });

  // it("set", () => {
  //   // Note: v0.1 allows putting same key multiple times. v0.2 does not.
  //   let c = new LRUMap(4);
  //   c.set("a", 1);
  //   c.set("a", 2);
  //   c.set("a", 3);
  //   c.set("a", 4);
  //   asserteq(c.size, 1);
  //   asserteq(c.newest, c.oldest);
  //   asserteq(c.newest.key, "a");
  //   asserteq(c.newest.value, 4);

  //   c.set("a", 5);
  //   asserteq(c.size, 1);
  //   asserteq(c.newest, c.oldest);
  //   asserteq(c.newest.key, "a");
  //   asserteq(c.newest.value, 5);

  //   c.set("b", 6);
  //   asserteq(c.size, 2);
  //   assert(c.newest !== c.oldest);

  //   asserteq(c.newest.key, "b");
  //   asserteq(c.newest.value, 6);
  //   asserteq(c.oldest.key, "a");
  //   asserteq(c.oldest.value, 5);

  //   c.shift();
  //   asserteq(c.size, 1);
  //   c.shift();
  //   asserteq(c.size, 0);
  //   c.forEach(function() {
  //     assert(false);
  //   });
  // });

  // it("entry iterator", () => {
  //   let c = new LRUMap(4, [
  //     ["adam", 29],
  //     ["john", 26],
  //     ["angela", 24],
  //     ["bob", 48]
  //   ]);

  //   let verifyEntries = function(iterable) {
  //     asserteq(typeof iterable[Symbol.iterator], "function");
  //     let it = iterable[Symbol.iterator]();
  //     assert.deepEqual(it.next().value, ["adam", 29]);
  //     assert.deepEqual(it.next().value, ["john", 26]);
  //     assert.deepEqual(it.next().value, ["angela", 24]);
  //     assert.deepEqual(it.next().value, ["bob", 48]);
  //     assert(it.next().done);
  //   };

  //   verifyEntries(c);
  //   verifyEntries(c.entries());
  // });

  // it("key iterator", () => {
  //   let c = new LRUMap(4, [
  //     ["adam", 29],
  //     ["john", 26],
  //     ["angela", 24],
  //     ["bob", 48]
  //   ]);
  //   let kit = c.keys();
  //   asserteq(kit.next().value, "adam");
  //   asserteq(kit.next().value, "john");
  //   asserteq(kit.next().value, "angela");
  //   asserteq(kit.next().value, "bob");
  //   assert(kit.next().done);
  // });

  // it("value iterator", () => {
  //   let c = new LRUMap(4, [
  //     ["adam", 29],
  //     ["john", 26],
  //     ["angela", 24],
  //     ["bob", 48]
  //   ]);
  //   let kit = c.values();
  //   asserteq(kit.next().value, 29);
  //   asserteq(kit.next().value, 26);
  //   asserteq(kit.next().value, 24);
  //   asserteq(kit.next().value, 48);
  //   assert(kit.next().done);
  // });

  // it("toJSON", () => {
  //   let c = new LRUMap(4, [
  //     ["adam", 29],
  //     ["john", 26],
  //     ["angela", 24],
  //     ["bob", 48]
  //   ]);
  //   let json = c.toJSON();
  //   assert(json.length == 4);
  //   assert.deepEqual(json, [
  //     { key: "adam", value: 29 },
  //     { key: "john", value: 26 },
  //     { key: "angela", value: 24 },
  //     { key: "bob", value: 48 }
  //   ]);
  // });
});
