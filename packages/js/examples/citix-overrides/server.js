import dotenv from 'dotenv';
dotenv.config();
import express, { json } from 'express';
import axios from 'axios';

const app = express();

const projectId = process.env.SIGNALWIRE_PROJECT_KEY;
const projectKey = process.env.SIGNALWIRE_TOKEN;
const space = process.env.SIGNALWIRE_SPACE;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function apiRequest(endpoint, payload = {}, method = 'POST') {
  const url = `https://${space}${endpoint}`;

  const resp = await axios.post(url, payload, {
    auth: {
      username: projectId,
      password: projectKey,
    },
  });
  return resp.data;
}

app.get('/', async (req, res) => {
  var defaultDestination = process.env.DEFAULT_DESTINATION;
  var tokenName = req.query.tokenName || 'myclient';
  var forceTcp = req.query.forceTcp == 'true';
  var relayHost = process.env.SIGNALWIRE_RELAY_HOST || 'relay.signalwire.com';
  var token = await apiRequest('/api/relay/rest/jwt', {
    expires_in: 120,
    resource: tokenName,
  });
  var curlString = `curl -XPOST --location 'https://${process.env.SIGNALWIRE_SPACE}/api/laml/2010-04-01/Accounts/${process.env.SIGNALWIRE_PROJECT_KEY}/Calls' --user '${process.env.SIGNALWIRE_PROJECT_KEY}:${process.env.SIGNALWIRE_TOKEN}' --data-urlencode 'Url=https://lpradovera.signalwire.com/laml-bins/40db8a19-4c5b-41b6-9f62-b6c51e201a07' --data-urlencode 'From=${process.env.CALLER_ID}' --data-urlencode 'To=verto:${tokenName}@${process.env.SIGNALWIRE_VERTO_DOMAIN}'`;
  console.log(curlString);
  res.render('index', {
    defaultDestination,
    projectId,
    token: token.jwt_token,
    name: tokenName,
    forceTcp,
    relayHost,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Server listening on ${port}\nSpace:${space}\nProjectId:${projectId} has Token: ${!!projectKey}`
  );
});
