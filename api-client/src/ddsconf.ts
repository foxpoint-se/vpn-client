import fs from "fs/promises";
import { getPassword } from "./awsClient";
import { getClients, login, logout } from "./vpnAdminClient";

const confFilePath = "../dds.xml";

const writeDdsConfFile = async (clientsIps: string[], filePath: string) => {
  const content = `<?xml version="1.0" encoding="UTF-8" ?>
<CycloneDDS xmlns="https://cdds.io/config" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://cdds.io/config https://raw.githubusercontent.com/eclipse-cyclonedds/cyclonedds/master/etc/cyclonedds.xsd">
  <Domain id="any">
    <General>
      <NetworkInterfaceAddress>wg0</NetworkInterfaceAddress>
    </General>
    <Discovery>
      <Peers>
${clientsIps.map((c) => `\t\t\t\t<Peer address="${c}" />`).join("\n")}
      </Peers>
      <ParticipantIndex>auto</ParticipantIndex>
    </Discovery>
  </Domain>
</CycloneDDS>`;
  await fs.writeFile(filePath, content);
};

const addServerAsClient = (clients: string[]): string[] => {
  if (clients.some((c) => c.endsWith(".1"))) {
    return clients;
  }
  if (clients.length < 1) {
    return clients;
  }
  const firstClient = clients[0];
  const parts = firstClient.split(".");
  const serverIp = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
  return [serverIp, ...clients];
};

const getDdsConf = async () => {
  const password = await getPassword();
  const authHeader = await login(password);
  const clients = await getClients(authHeader);
  const clientIps = clients.map((c) => c.address);
  const clientsWithServerClient = addServerAsClient(clientIps);
  await logout(authHeader);
  await writeDdsConfFile(clientsWithServerClient, confFilePath);
  console.log(
    "Created file",
    confFilePath,
    "with DDS config for client IPs",
    clientsWithServerClient
  );
};

getDdsConf();
