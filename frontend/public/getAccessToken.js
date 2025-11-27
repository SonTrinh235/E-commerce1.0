import { readFile } from "fs/promises";
import { GoogleAuth } from "google-auth-library";

async function main() {
  const serviceAccount = JSON.parse(await readFile("./service-account.json", "utf8"));
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"]
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  console.log("Access Token:", accessToken.token);
}

main();
