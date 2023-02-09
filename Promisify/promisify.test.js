const chai = require('chai');
const spies = require('chai-spies');

chai.use(spies);
const spy = () =>
  chai.spy(function (x, y, callback) {
    const value = x + y;
    if (typeof value !== 'number') {
      callback(new Error('Not a number', null));
    } else {
      callback(null, value);
    }
  });

let thisContext;
const {expect} = chai;

const {promisify} = require('./program.js');

describe('promisify', () => {
  beforeEach(() => {
    thisContext = {test: '123'};
  });

  it('calling promisified function calls the original function', () => {
    const callback = spy();
    const promisified = promisify(callback);
    expect(callback).to.have.been.called.exactly(0);
    promisified(1, 2);
    expect(callback).to.have.been.called.exactly(1);
  });

  it('promisified function returns a promise', () => {
    const callback = spy();
    const promisified = promisify(callback);
    const returnValue = promisified(1, 2);
    expect(returnValue instanceof Promise).to.be.true;
  });

  it('promisified function handles non-error case', async () => {
    const callback = spy();
    const promisified = promisify(callback);
    const returnValue = await promisified(1, 2);
    expect(returnValue).to.equal(3);
  });

  it('promisified function handles error case', async () => {
    const callback = spy();
    const promisified = promisify(callback);
    let returnValue;
    let error;
    try {
      returnValue = await promisified(1, 'a');
    } catch (e) {
      error = e;
    }
    expect(returnValue).to.not.exist;
    expect(error).to.exist;
    expect(error.message).to.equal('Not a number');
  });

  it('promisified function can be called multiple times', async () => {
    const callback = spy();
    const promisified = promisify(callback);
    const returnValues = [];
    const errors = [];
    for (let i = 0; i < 4; i++) {
      returnValues.push(await promisified(i, 2));
    }
    for (let i = 0; i < 4; i++) {
      try {
        await promisified(i, 'a');
      } catch (e) {
        errors.push(i);
      }
    }
    expect(returnValues).to.deep.equal([2, 3, 4, 5]);
    expect(errors).to.deep.equal([0, 1, 2, 3]);
  });

  it('multiple functions can be promisified', async () => {
    const callback = spy();
    const promisified = promisify(callback);

    const callback2 = chai.spy(function (value, fn) {
      if (typeof value !== 'string') {
        fn(new Error('Not a string', null));
      } else {
        fn(null, value);
      }
    });
    const promisified2 = promisify(callback2);

    expect(callback).to.have.been.called.exactly(0);
    expect(callback2).to.have.been.called.exactly(0);

    const result1 = await promisified(1, 2);
    expect(callback).to.have.been.called.exactly(1);
    expect(callback2).to.have.been.called.exactly(0);

    const result2 = await promisified2('abc');
    expect(callback).to.have.been.called.exactly(1);
    expect(callback2).to.have.been.called.exactly(1);

    expect(result1).to.equal(3);
    expect(result2).to.equal('abc');
  });

  it('promisifed function has the `this` context of the promisifed function caller', async () => {
    const object = {spy: spy()};
    function callback(...args) {
      this.spy(...args);
    }
    object.promisified = promisify(callback);

    await object.promisified(1, 2);
    expect(object.spy).to.have.been.called.exactly(1);

    try {
      await object.promisified(1, 'a');
    } catch (e) {
      expect(object.spy).to.have.been.called.exactly(2);
    }
  });
});
