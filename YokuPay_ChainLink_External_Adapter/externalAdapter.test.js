const request = require("supertest");
const Web3 = require("web3");
const app = require("./externalAdapter").app;

describe("GET /service/online", () => {
  describe("check the server status", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request(app).get("/service/online").send();
      expect(response.statusCode).toBe(200);
    });
  });
});

describe("POST /payment/opentheta/checkwallet", () => {
  describe("given a user and transaction hash", () => {
    test("should respond with a 200 status code", async () => {
      const response = await request(app)
        .post("/payment/opentheta/checkwallet")
        .send({
          id: 0,
          data: {
            user: "f22b54d37fd15fbcc716da7925c6cb39a0deab5d",
            txh: "0xf8526117ef28db377b3d4a6407983f77f52dac82529d7a7243b5a52b097eb95d",
          },
        });
      expect(response.statusCode).toBe(200);
    });

    test("should specify json in the content type header", async () => {
      const response = await request(app)
        .post("/payment/opentheta/checkwallet")
        .send({
          txh: "username",
          user: "password",
        });
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json")
      );
    });

    test("should return user + 2 + exchange rate", async () => {
      const response = await request(app)
        .post("/payment/opentheta/checkwallet")
        .send({
          id: 0,
          data: {
            user: "f22b54d37fd15fbcc716da7925c6cb39a0deab5d",
            txh: "0xf8526117ef28db377b3d4a6407983f77f52dac82529d7a7243b5a52b097eb95d",
          },
        });
      const responseAscii = Web3.utils
        .hexToAscii(response.body.data.result)
        .slice(0, 43);
      expect(responseAscii).toBe("0xf22b54d37fd15fbcc716da7925c6cb39a0deab5d2");
    });

    test("should return user + 1 + exchange rate", async () => {
      const response = await request(app)
        .post("/payment/opentheta/checkwallet")
        .send({
          id: 0,
          data: {
            user: "21ba299fd57f868ea9901252a6f671d8e688a71c",
            txh: "0xf84ed1a04a8109fcb8978464bb3f1e555409a8cb73f3731d96c87e894d6b248f",
          },
        });
      const responseAscii = Web3.utils
        .hexToAscii(response.body.data.result)
        .slice(0, 43);
      expect(responseAscii).toBe("0x21ba299fd57f868ea9901252a6f671d8e688a71c1");
    });

    test("should return user + 4 + exchange rate", async () => {
      const response = await request(app)
        .post("/payment/opentheta/checkwallet")
        .send({
          id: 0,
          data: {
            user: "7e1BBDDe3cB26F406800868f10105592d507bD07",
            txh: "0xbf2249b35f3dfc0b9435b6d58a54ae661fd35af1ce63de98d6745d6abbc696df",
          },
        });
      const responseAscii = Web3.utils
        .hexToAscii(response.body.data.result)
        .slice(0, 43);
      expect(responseAscii).toBe("0x7e1BBDDe3cB26F406800868f10105592d507bD074");
    });
  });

  describe("when the user and txh is missing", () => {
    test("should respond with a status code of 400", async () => {
      const bodyData = [{ txh: "username" }, { user: "password" }, {}];
      for (const body of bodyData) {
        const response = await request(app)
          .post("/payment/opentheta/checkwallet")
          .send(body);
        expect(response.statusCode).toBe(400);
      }
    });
  });
});
