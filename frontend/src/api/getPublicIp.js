export async function getPublicIp() {
  try {
    const url = 'https://api.ipify.org?format=json';
    const response = await fetch(url);
    const data = await response.json();
    
    // The IP address is stored in the 'ip' key
    console.log("My Public IP:", data.ip); 
    
    return data.ip;
  } catch (error) {
    console.error("Could not fetch IP:", error);
  }
}
