const chai = require("chai");
const spies = require("chai-spies");
const FakeTimers = require("@sinonjs/fake-timers");

const clock = FakeTimers.install({
  now: Date.now(),
});

chai.use(spies);
const spy = () => chai.spy(() => {});
const { expect } = chai;

const { debounce } = require("./program.js");

describe("debounce", () => {
  beforeEach(() => {
    clock.reset();
  });

  describe("when immediate is false", () => {
    describe("calling a debounced function once", () => {
      describe("before the delay has elapsed", () => {
        it(`shouldn't call the passed callback`, () => {
          const callback = spy();
          const debounced = debounce(callback, 1000);

          debounced();
          expect(callback).to.have.been.called.exactly(0);
          clock.tick(999);
          expect(callback).to.have.been.called.exactly(0);
        });
      });

      describe("after the delay has elapsed", () => {
        it("should call the passed callback", () => {
          const callback = spy();
          const debounced = debounce(callback, 1000);

          debounced();
          clock.tick(1000);
          expect(callback).to.have.been.called.exactly(1);
        });

        it(`should call the passed callback with the call's arguments`, () => {
          const callback = spy();
          const debounced = debounce(callback, 1000);

          debounced("foo", "bar");
          clock.tick(1000);
          expect(callback).to.have.been.called.with("foo", "bar");
        });
      });
    });

    describe("calling a debounced function multiple times", () => {
      describe("before the delay has elapsed since the last call", () => {
        it(`shouldn't call the passed callback`, () => {
          const callback = spy();
          const debounced = debounce(callback, 1000);

          debounced();
          clock.tick(500);
          debounced();
          clock.tick(500);
          expect(callback).to.have.been.called.exactly(0);
          debounced();
          clock.tick(500);
          expect(callback).to.have.been.called.exactly(0);
          debounced();
          clock.tick(500);
          expect(callback).to.have.been.called.exactly(0);
        });
      });

      describe("after the delay has elapsed since the last call", () => {
        it("should call the passed callback", () => {
          const callback = spy();
          const debounced = debounce(callback, 1000);

          debounced();
          clock.tick(500);
          debounced();
          clock.tick(500);
          debounced();
          clock.tick(500);
          debounced();
          clock.tick(500);
          expect(callback).to.have.been.called.exactly(0);
          clock.tick(500);
          expect(callback).to.have.been.called.exactly(1);
        });

        it(`should call the passed callback with the last call's arguments`, () => {
          const callback = spy();
          const debounced = debounce(callback, 1000);

          debounced("foo");
          clock.tick(500);
          debounced("bar");
          clock.tick(500);
          debounced("baz");
          clock.tick(500);
          debounced("last call");
          clock.tick(500);
          clock.tick(500);
          expect(callback).to.have.been.called.with("last call");
        });
      });
    });
  });

  describe("when immediate is true", () => {
    describe("calling a debounced function once", () => {
      describe("before the delay has elapsed", () => {
        it("should call the passed callback immediately", () => {
          const callback = spy();
          const debounced = debounce(callback, 1000, true);

          debounced();
          expect(callback).to.have.been.called.exactly(1);
        });

        it(`should call the passed callback with the call's arguments`, () => {
          const callback = spy();
          const debounced = debounce(callback, 1000, true);

          debounced("foo", "bar");
          expect(callback).to.have.been.called.with("foo", "bar");
        });
      });

      describe("after the delay has elapsed", () => {
        it(`shouldn't call the passed callback again`, () => {
          const callback = spy();
          const debounced = debounce(callback, 1000, true);

          debounced();
          debounced();
          clock.tick(1000);
          expect(callback).to.have.been.called.exactly(1);
          clock.tick(1000);
          expect(callback).to.have.been.called.exactly(1);
        });
      });
    });

    describe("calling a debounced function multiple times", () => {
      describe("before the delay has elapsed since the last call", () => {
        it("should call the passed callback once immediately", () => {
          const callback = spy();
          const debounced = debounce(callback, 1000, true);

          debounced();
          expect(callback).to.have.been.called.exactly(1);
          clock.tick(500);
          debounced();
          clock.tick(500);
          expect(callback).to.have.been.called.exactly(1);
          debounced();
          clock.tick(500);
          expect(callback).to.have.been.called.exactly(1);
        });

        it(`should call the passed callback with the first call's arguments`, () => {
          const callback = spy();
          const debounced = debounce(callback, 1000, true);

          debounced("first call");
          clock.tick(500);
          debounced("foo");
          clock.tick(500);
          debounced("bar");
          clock.tick(500);
          debounced("baz");
          clock.tick(500);
          clock.tick(500);
          expect(callback).to.have.been.called.with("first call");
        });
      });

      describe("after the delay has elapsed since the last call", () => {
        it("should call the passed callback again immediately", () => {
          const callback = spy();
          const debounced = debounce(callback, 1000, true);

          debounced();
          clock.tick(500);
          debounced();
          clock.tick(500);
          debounced();
          clock.tick(500);
          debounced();
          clock.tick(500);
          clock.tick(500);
          expect(callback).to.have.been.called.exactly(1);
          debounced();
          expect(callback).to.have.been.called.exactly(2);
        });

        it(`should call the passed callback again with the last call's arguments`, () => {
          const callback = spy();
          const debounced = debounce(callback, 1000, true);

          debounced("first call");
          clock.tick(500);
          debounced("foo");
          clock.tick(500);
          debounced("bar");
          clock.tick(500);
          debounced("baz");
          clock.tick(500);
          clock.tick(500);
          expect(callback).to.have.been.called.with("first call");
          debounced("last call");
          expect(callback).to.have.been.called.with("last call");
        });
      });
    });
  });

  describe("regardless of immediate", () => {
    it("callbacks should have the `this` context of the debounced function caller", () => {
      const object = { spy: spy() };
      function callback() {
        this.spy();
      }
      object.debounced = debounce(callback, 1000);
      object.immediateDebounced = debounce(callback, 1000, true);

      object.debounced();
      clock.tick(1000);
      expect(object.spy).to.have.been.called.exactly(1);
      object.immediateDebounced();
      expect(object.spy).to.have.been.called.exactly(2);
    });
  });
});
