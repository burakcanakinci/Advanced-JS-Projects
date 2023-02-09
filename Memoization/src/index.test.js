const chai = require("chai");
const spies = require("chai-spies");
const { expect } = chai;

chai.use(spies);
const spy = () => chai.spy(() => {});

const { memoize } = require("./index.js");

describe("memoize", () => {
  it("callback without parameters is never called twice", () => {
    const callback = chai.spy(() => {});
    const memoized = memoize(callback);
    expect(callback).to.have.been.called.exactly(0);
    memoized();
    expect(callback).to.have.been.called.exactly(1);
    memoized();
    expect(callback).to.have.been.called.exactly(1);
    memoized();
    memoized();
    expect(callback).to.have.been.called.exactly(1);
  });

  it("return value is correct with no parameters", () => {
    const callback = chai.spy(() => 123);
    const memoized = memoize(callback);
    let returnVal = memoized();
    expect(returnVal).to.equal(123);
    returnVal = memoized();
    expect(returnVal).to.equal(123);
  });

  it("callback with a single parameter is handled properly", () => {
    const callback = chai.spy((val) => val * 2);
    const memoized = memoize(callback);
    expect(callback).to.have.been.called.exactly(0);
    const val1 = memoized(1);
    expect(callback).to.have.been.called.exactly(1);
    expect(val1).to.equal(2);

    const val2 = memoized(1);
    expect(callback).to.have.been.called.exactly(1);
    expect(val2).to.equal(2);

    const val3 = memoized(2);
    expect(callback).to.have.been.called.exactly(2);
    expect(val3).to.equal(4);

    const val4 = memoized(2);
    expect(callback).to.have.been.called.exactly(2);
    expect(val4).to.equal(4);

    const val5 = memoized(1);
    expect(callback).to.have.been.called.exactly(2);
    expect(val5).to.equal(2);
  });

  it("callback with multiple parameters is handled properly", () => {
    const callback = chai.spy((x, y) => x + y);
    const memoized = memoize(callback);
    expect(callback).to.have.been.called.exactly(0);

    const val1 = memoized(1, 2);
    expect(callback).to.have.been.called.exactly(1);
    expect(val1).to.equal(3);

    const val2 = memoized(1, 2);
    expect(callback).to.have.been.called.exactly(1);
    expect(val2).to.equal(3);

    const val3 = memoized(2, 1);
    expect(callback).to.have.been.called.exactly(2);
    expect(val3).to.equal(3);

    const val4 = memoized(1, 3);
    expect(callback).to.have.been.called.exactly(3);
    expect(val4).to.equal(4);

    const val5 = memoized(1, 3);
    expect(callback).to.have.been.called.exactly(3);
    expect(val5).to.equal(4);
  });

  it("callback with a variable number of parameters is handled properly", () => {
    const callback = chai.spy((...args) =>
      args.reduce((acc, curr) => acc + curr, 0)
    );
    const memoized = memoize(callback);
    expect(callback).to.have.been.called.exactly(0);

    const val1 = memoized(1, 2);
    expect(callback).to.have.been.called.exactly(1);
    expect(val1).to.equal(3);

    const val2 = memoized(1, 2, 3);
    expect(callback).to.have.been.called.exactly(2);
    expect(val2).to.equal(6);

    const val3 = memoized(1);
    expect(callback).to.have.been.called.exactly(3);
    expect(val3).to.equal(1);

    const val4 = memoized(1, 3);
    expect(callback).to.have.been.called.exactly(4);
    expect(val4).to.equal(4);

    const val5 = memoized(1, 2, 3);
    expect(callback).to.have.been.called.exactly(4);
    expect(val5).to.equal(6);

    const val6 = memoized(1, 2);
    expect(callback).to.have.been.called.exactly(4);
    expect(val6).to.equal(3);

    const val7 = memoized();
    expect(callback).to.have.been.called.exactly(5);
    expect(val7).to.equal(0);

    const val8 = memoized();
    expect(callback).to.have.been.called.exactly(5);
    expect(val7).to.equal(0);
  });

  it("parameters can be of different types", () => {
    const callback = chai.spy((...args) => args);
    const memoized = memoize(callback);
    expect(callback).to.have.been.called.exactly(0);

    const val1 = memoized("0");
    expect(callback).to.have.been.called.exactly(1);
    expect(val1).to.deep.equal(["0"]);

    const val2 = memoized(0);
    expect(callback).to.have.been.called.exactly(2);
    expect(val2).to.deep.equal([0]);

    const val3 = memoized("0");
    expect(callback).to.have.been.called.exactly(2);
    expect(val3).to.deep.equal(["0"]);

    const val4 = memoized(0);
    expect(callback).to.have.been.called.exactly(2);
    expect(val4).to.deep.equal([0]);

    const args = [
      () => {},
      {},
      [1, 2, 3],
      true,
      "abc",
      123,
      Symbol(),
      undefined,
      null
    ];
    const val5 = memoized(...args);
    expect(callback).to.have.been.called.exactly(3);
    expect(val5).to.deep.equal(args);

    const val6 = memoized(...args);
    expect(callback).to.have.been.called.exactly(3);
    expect(val6).to.deep.equal(args);

    args.pop();
    const val7 = memoized(...args);
    expect(callback).to.have.been.called.exactly(4);
    expect(val7).to.deep.equal(args);

    args.push(null);
    const val8 = memoized(...args);
    expect(callback).to.have.been.called.exactly(4);
    expect(val8).to.deep.equal(args);
  });

  it("custom cache key resolver can be passed", () => {
    const callback = chai.spy((...args) => args);
    const memoized = memoize(callback, () => "key");

    const val1 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(1);
    expect(val1).to.deep.equal([123, "abc"]);

    const val2 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(1);
    expect(val2).to.deep.equal([123, "abc"]);

    const val3 = memoized(1234, "abcd");
    expect(callback).to.have.been.called.exactly(1);
    expect(val3).to.deep.equal([123, "abc"]);

    const val4 = memoized(
      () => {},
      {},
      [1, 2, 3],
      true,
      "abc",
      123,
      Symbol(),
      undefined,
      null
    );
    expect(callback).to.have.been.called.exactly(1);
    expect(val4).to.deep.equal([123, "abc"]);

    const callback2 = chai.spy((...args) => args);
    const memoized2 = memoize(callback2, (...args) =>
      args.reduce((acc, curr) => acc + curr, 0)
    );

    const val5 = memoized2(1, 2, 3);
    expect(callback2).to.have.been.called.exactly(1);
    expect(val5).to.deep.equal([1, 2, 3]);

    const val6 = memoized2(3, 2, 1);
    expect(callback2).to.have.been.called.exactly(1);
    expect(val6).to.deep.equal([1, 2, 3]);

    const val7 = memoized2(1, 2);
    expect(callback2).to.have.been.called.exactly(2);
    expect(val7).to.deep.equal([1, 2]);

    const val8 = memoized2(3);
    expect(callback2).to.have.been.called.exactly(2);
    expect(val8).to.deep.equal([1, 2]);
  });

  it("callback can be memoized multiple times", () => {
    const callback = chai.spy((...args) => args);
    const memoized = memoize(callback, () => "key");
    const memoized2 = memoize(callback, (...args) =>
      args.reduce((acc, curr) => acc + curr, 0)
    );

    const val1 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(1);
    expect(val1).to.deep.equal([123, "abc"]);

    const val2 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(1);
    expect(val2).to.deep.equal([123, "abc"]);

    const val3 = memoized2(1, 2, 3);
    expect(callback).to.have.been.called.exactly(2);
    expect(val3).to.deep.equal([1, 2, 3]);

    const val4 = memoized2(3, 2, 1);
    expect(callback).to.have.been.called.exactly(2);
    expect(val4).to.deep.equal([1, 2, 3]);

    const val5 = memoized2(3, 2);
    expect(callback).to.have.been.called.exactly(3);
    expect(val5).to.deep.equal([3, 2]);
  });

  it("clear function works as expected", () => {
    const callback = chai.spy((...args) => args);
    const memoized = memoize(callback);

    const val1 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(1);
    expect(val1).to.deep.equal([123, "abc"]);

    const val2 = memoized(123);
    expect(callback).to.have.been.called.exactly(2);
    expect(val2).to.deep.equal([123]);

    const val3 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(2);
    expect(val3).to.deep.equal([123, "abc"]);

    memoized.clear();

    const val4 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(3);
    expect(val4).to.deep.equal([123, "abc"]);

    const val5 = memoized(123);
    expect(callback).to.have.been.called.exactly(4);
    expect(val5).to.deep.equal([123]);

    const val6 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(4);
    expect(val6).to.deep.equal([123, "abc"]);

    memoized.clear();

    const val7 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(5);
    expect(val7).to.deep.equal([123, "abc"]);

    const val8 = memoized(123);
    expect(callback).to.have.been.called.exactly(6);
    expect(val8).to.deep.equal([123]);

    const val9 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(6);
    expect(val9).to.deep.equal([123, "abc"]);
  });

  it("delete function works as expected", () => {
    const callback = chai.spy((...args) => args);
    const memoized = memoize(callback);

    const val1 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(1);
    expect(val1).to.deep.equal([123, "abc"]);

    const val2 = memoized(123);
    expect(callback).to.have.been.called.exactly(2);
    expect(val2).to.deep.equal([123]);

    const val3 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(2);
    expect(val3).to.deep.equal([123, "abc"]);

    memoized.delete(123, "abc");

    const val4 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(3);
    expect(val4).to.deep.equal([123, "abc"]);

    const val5 = memoized(123);
    expect(callback).to.have.been.called.exactly(3);
    expect(val5).to.deep.equal([123]);

    memoized.delete(123, "abc");

    const val6 = memoized(123, "abc");
    expect(callback).to.have.been.called.exactly(4);
    expect(val6).to.deep.equal([123, "abc"]);

    memoized.delete(123);
    const val7 = memoized(123);
    expect(callback).to.have.been.called.exactly(5);
    expect(val7).to.deep.equal([123]);
  });

  it("has function works as expected", () => {
    const callback = chai.spy((...args) => args);
    const memoized = memoize(callback);

    expect(memoized.has()).to.be.false;
    expect(memoized.has(123)).to.be.false;
    expect(memoized.has(123, "abc")).to.be.false;

    memoized();
    expect(memoized.has()).to.be.true;

    memoized(123);
    expect(memoized.has(123)).to.be.true;

    memoized(123, "abc");
    expect(memoized.has(123, "abc")).to.be.true;

    expect(callback).to.have.been.called.exactly(3);
  });

  it("clear, delete and has functions can be called together", () => {
    const callback = chai.spy((...args) => args);
    const memoized = memoize(callback);

    memoized(123);
    expect(memoized.has(123)).to.be.true;
    memoized.delete(123);
    expect(memoized.has(123)).to.be.false;
    memoized(123);
    expect(memoized.has(123)).to.be.true;
    memoized.clear();
    expect(memoized.has(123)).to.be.false;
    memoized(123);
    expect(memoized.has(123)).to.be.true;
    expect(memoized.has(123, "abc")).to.be.false;
    memoized(123, "abc");
    expect(memoized.has(123)).to.be.true;
    expect(memoized.has(123, "abc")).to.be.true;
    memoized.clear();
    expect(memoized.has(123)).to.be.false;
    expect(memoized.has(123, "abc")).to.be.false;
  });
});
