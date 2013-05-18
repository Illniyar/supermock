var assert = require("assert")
var SuperMock = require("./index").SuperMock

function verifyCallCount(instance,count) {
    assert.equal(instance.getCallCount(), count);
    instance.assertCallCount(count)  
    try {
        instance.assertCallCount(count)
    } catch (err) {
        assert.equal(err.name,"AssertionError")
        assert.equal(err.expected,count)
    }
}
function verifyCalledWith(instance) {
    var args = Array.prototype.slice.call(arguments);
    var expectList = args.slice(1)
    var calls = instance.getCalledWith();
    assert.equal(expectList.length,calls.length)
    for (var i=0;i<expectList.length;i++) {
        if (expectList[i] === null) {
            assert.equal(calls[i].length,0)
            instance.assertCalledWith()
        } else {
            expected = [].concat(expectList[i]);
            assert.deepEqual(expected,calls[i])
            instance.assertCalledWith.apply(instance,expected)
        }         
    }
}
function verifyFailWith(instance,expected) {
    try {
        instance.assertCalledWith(expected)
    } catch(err) {
        assert.equal(err.name,"AssertionError")
    }
}
describe("SuperMock test", function () {
    var instance;
    beforeEach(function () {
        instance = new SuperMock()
    })
    it("should assert call count", function () {
        verifyCallCount(instance, 0)
        instance()
        verifyCallCount(instance, 1)
        instance()
        verifyCallCount(instance, 2)
    })
    it("should assert called with", function () {
        instance()
        verifyCalledWith(instance, null)
        instance("asdsd")
        verifyCalledWith(instance, null, "asdsd")
        instance("asdsd", "zzz")
        verifyCalledWith(instance, null, "asdsd", ["asdsd", "zzz"])
    })
    it("should fail when asserting something not called with", function () {
        verifyFailWith(instance);
        instance()
        verifyFailWith(instance, "asdsd")
    })
    it("should return new mock if no value", function () {
        var newMock = instance.something;
        assert.equal(newMock.constructor.name, "SuperMock")
    })
    it("should return passed value", function () {
        instance.returnValue = "some value"
        assert.equal(instance(), "some value")
        instance = new SuperMock({ returnValue: "some different value" })
        assert.equal(instance(), "some different value")
    })
    it("should have a name representing call path", function () {
        assert.equal(instance.some.path.for.mock.getName(), "<anonymous>.some.path.for.mock")
        instance = new SuperMock({ mockName: "instance" })
        assert.equal(instance.some.path.for.mock.getName(), "instance.some.path.for.mock")
    })
    it("should keep properties passed", function () {
        instance.some.path.to.mock = "leaf"
        assert.equal(instance.some.path.to.mock, "leaf")
    })
    it("should return properties as passed in constructor", function () {
        instance = new SuperMock({ someProperty: "some value" })
        assert.equal(instance.someProperty, "some value")
    })
    it("should throw if throw defined", function () {
        instance = new SuperMock({ throws: new Error('some error') });
        assert.throws(instance, /some error/);
    })
    it("should call callback if passed", function () {
        instance = new SuperMock({ callback: ["some error", "callback message"] });
        var finished = false;
        instance(function (error, message) {
            assert.equal(error, "some error")
            assert.equal(message, "callback message")
            finished = true;
        })
        assert.ok(finished, "callback was not called")
    })
})