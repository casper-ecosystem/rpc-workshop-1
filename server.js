const express = require('express')
var cors = require('cors')
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, DeployUtil, CLPublicKey } = require('casper-js-sdk')
const app = express();
const port = 3000;
const client = new CasperClient("http://3.208.91.63:7777/rpc");
const contract = new Contracts.Contract(client);
contract.setContractHash("hash-75143aa704675b7dead20ac2ee06c1c3eccff4ffcf1eb9aebb8cce7c35648041");

app.use(express.static(__dirname + '/public/static'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile('public/index.html', {root: __dirname });
});

app.post('/sendDeploy', (req, res) => {
  const signedJSON = req.body; //Get JSON from POST body
  console.log(signedJSON);
  let signedDeploy = DeployUtil.deployFromJson(signedJSON).unwrap(); //Unwrap from JSON to Deploy object
  signedDeploy.send("http://3.208.91.63:7777/rpc").then((response) => { //Send Signed Deploy
    res.send(response);
  }).catch((error) => {
    console.log(error);
    return;
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});

app.get("/getDeploy", (req, res) => {
  const hash = req.query.hash;
  client.getDeploy(hash).then((response) => {
    res.send(response[1].execution_results);
    return;
  }).catch((error) => {
    res.send(error);
    return;
  })
});

app.get("/getHighscore", (req, res) => {
  const hash = req.query.hash;
  console.log(hash);
  console.log(CLPublicKey.fromHex(hash).toAccountHashStr());
  contract.queryContractDictionary("highscore_dictionary", CLPublicKey.fromHex(hash).toAccountHashStr().substring(13)).then((response) => {
    console.log("Got highscore");
    console.log(response);
    return;
  }).catch((error) => {
    res.send(error);
    return;
  })
});

const getDeploy = function(deployHash) {
  return new Promise((resolve, reject) => {
    client.getDeploy(deployHash).then((response) => {
      resolve(response);
    }).catch((error) => {
      reject(error);
    });
  });
}
