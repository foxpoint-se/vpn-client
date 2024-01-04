import axios from "axios";
import setCookie from "set-cookie-parser";

const sessionKey = "connect.sid";

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

type AuthHeader = {
  Cookie: string;
};

axios.defaults.baseURL = "https://vpnadmin.foxpoint.se";

export const login = async (password: string): Promise<AuthHeader> => {
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

export const logout = async (authHeader: AuthHeader) => {
  await axios.delete("/api/session", { headers: { ...authHeader } });
};

export const getClients = async (authHeader: AuthHeader): Promise<Client[]> => {
  const clientsReq = await axios.get("/api/wireguard/client", {
    headers: { ...authHeader },
  });
  const clients = clientsReq.data as Client[];
  return clients;
};

export const getClientConf = async (
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
