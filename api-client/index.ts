import axios from "axios";
import fs from "fs/promises";
import setCookie from "set-cookie-parser";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const sessionKey = "connect.sid";
const wgPasswordSecretKey = "vpn-wg-password";
const region = "eu-west-1";
const confFilePath = "../wg0.conf";

type Client = {
  id: string;
  name: string;
  enabled: boolean;
  address: string;
  publicKey: string;
  createdAt: string;
  updatedAt: string;
  persistentKeepalive: string;
  latestHandshakeAt?: string;
  transferRx: number;
  transferTx: number;
};

const getPassword = async (): Promise<string> => {
  const client = new SecretsManagerClient({ region });
  const command = new GetSecretValueCommand({
    SecretId: wgPasswordSecretKey,
  });
  const response = await client.send(command);
  const password = response.SecretString;
  if (!password) {
    throw new Error(
      `Could not get a value for secret ${wgPasswordSecretKey} in region ${region}`
    );
  }
  return password;
};

type AuthHeader = {
  Cookie: string;
};

axios.defaults.baseURL = "https://vpnadmin.foxpoint.se";

const login = async (password: string): Promise<AuthHeader> => {
  const resp = await axios.post("/api/session", {
    password,
  });
  var cookies = setCookie.parse(resp.headers["set-cookie"] || [], {
    decodeValues: true, // default: true
  });
  const sessionIdCookie = cookies.find((c) => c.name === sessionKey);
  if (!sessionIdCookie) {
    throw new Error("Failed to find session cookie");
  }
  const authHeader = { Cookie: `${sessionKey}=${sessionIdCookie.value}` };
  return authHeader;
};

const logout = async (authHeader: AuthHeader) => {
  await axios.delete("/api/session", { headers: { ...authHeader } });
};

const getClients = async (authHeader: AuthHeader): Promise<Client[]> => {
  const clientsReq = await axios.get("/api/wireguard/client", {
    headers: { ...authHeader },
  });
  const clients = clientsReq.data as Client[];
  return clients;
};

const getClientConf = async (
  authHeader: AuthHeader,
  clientId: string
): Promise<string> => {
  const confResp = await axios.get(
    `/api/wireguard/client/${clientId}/configuration`,
    {
      headers: { ...authHeader },
    }
  );

  const conf = confResp.data as string;
  return conf;
};

const writeConfFile = async (
  confFileContent: string,
  clientName: string,
  filePath: string
) => {
  const content = `# Client: ${clientName}
${confFileContent}`;
  await fs.writeFile(filePath, content);
};

const getWgClientConf = async () => {
  const clientNames = process.argv.slice(2);
  const clientName = clientNames[0];
  if (!clientName) {
    throw new Error("Please provide at a client name.");
  }
  console.log("Getting WG conf for client", clientName);
  const password = await getPassword();
  const authHeader = await login(password);
  const clients = await getClients(authHeader);
  const client = clients.find((c) => c.name === clientName);
  if (!client) {
    throw new Error(
      `Failed to find client with name ${clientName}. Available clients are ${clients.map(
        (c) => c.name
      )}`
    );
  }
  const conf = await getClientConf(authHeader, client.id);
  await logout(authHeader);
  await writeConfFile(conf, clientName, confFilePath);
  console.log(
    "Created file",
    confFilePath,
    "with WG config for client",
    clientName
  );
};

getWgClientConf();
