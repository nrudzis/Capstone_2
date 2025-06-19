const { groupAndNest } = require("./group");

/************************************** groupAndNest */
const userResRows = [
  {
    "username": "u1",
    "accountBalance": "100000",
    "assetQuantity": "10",
    "assetSymbol": "AAPL",
    "assetName": "Apple Inc. Common Stock",
    "assetClass": "us_equity"
  },
  {
    "username": "u1",
    "accountBalance": "100000",
    "assetQuantity": "0.05",
    "assetSymbol": "BTCUSD",
    "assetName": "Bitcoin  / US Dollar",
    "assetClass": "crypto"
  }
];

const userResRowsNull = [
  {
    "username": "u2",
    "accountBalance": "200000",
    "assetQuantity": null,
    "assetSymbol": null,
    "assetName": null,
    "assetClass": null
  }
];

const userCorrectResult = [{
  "username": "u1",
  "accountBalance": "100000",
  "assets": [
    {
      "assetQuantity": "10",
      "assetSymbol": "AAPL",
      "assetName": "Apple Inc. Common Stock",
      "assetClass": "us_equity"
    },
    {
      "assetQuantity": "0.05",
      "assetSymbol": "BTCUSD",
      "assetName": "Bitcoin  / US Dollar",
      "assetClass": "crypto"
    }
  ]
}];

const userCorrectResultNull = [{
  "username": "u2",
  "accountBalance": "200000",
  "assets": []
}];

describe("groupAndNest", function() {
  test("works, user with assets to nest", function () {
    const userResult = groupAndNest(userResRows, "username", "assets", [
      "assetQuantity",
      "assetSymbol",
      "assetName",
      "assetClass"
    ]);
    expect(userResult).toEqual(userCorrectResult);
  });

  test("works, user without assets to nest", function () {
    const userResultNull = groupAndNest(userResRowsNull, "username", "assets", [
      "assetQuantity",
      "assetSymbol",
      "assetName",
      "assetClass"
    ]);
    expect(userResultNull).toEqual(userCorrectResultNull);
  });
});
