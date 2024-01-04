import fs from "fs/promises";
import { getPassword } from "./awsClient";
import { getClientConf, getClients, login, logout } from "./vpnAdminClient";

const confFilePath = "../wg0.conf";

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
