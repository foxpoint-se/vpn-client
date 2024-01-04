import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const wgPasswordSecretKey = "vpn-wg-password";
const region = "eu-west-1";

export const getPassword = async (): Promise<string> => {
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
