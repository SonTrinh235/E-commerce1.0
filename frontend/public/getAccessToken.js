import { GoogleAuth } from "google-auth-library";

async function main() {
  try {
    const auth = new GoogleAuth({
      keyFile: "./service-account.json",
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    console.log("✅ Access Token:");
    console.log(accessToken.token);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

import { readFile } from "fs/promises";
async function debugKey() {
    try {
        const content = await readFile("./service-account.json", "utf8");
        const json = JSON.parse(content);
        const key = json.private_key;
        
        console.log("\n--- DEBUG ---");
        console.log("Client Email:", json.client_email);
        console.log("Key Length:", key.length);
    } catch (e) {
        console.log("Lỗi đọc file debug:", e);
    }
}

main();