describe("config", function () {
  test("works", function () {
    process.env.PORT = "5000";
    process.env.SECRET_KEY = "test-secret";
    process.env.NODE_ENV = "test-env";
    process.env.DATABASE_URL = "test-db-url";

    const config = require("./config");
    expect(config.PORT).toEqual(5000);
    expect(config.SECRET_KEY).toEqual("test-secret");
    expect(config.getDatabaseUri()).toEqual("test-db-url");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    delete process.env.PORT;
    delete process.env.SECRET_KEY;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URL;

    expect(config.getDatabaseUri()).toEqual("postgresql:///swap");
    process.env.NODE_ENV = "test"
    expect(config.getDatabaseUri()).toEqual("postgresql:///swap_test");
  });
});
