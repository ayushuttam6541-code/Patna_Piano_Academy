import dns from "node:dns";
import { MongoClient } from 'mongodb'

// Set DNS servers before any MongoDB operations - THIS MUST BE AT MODULE LEVEL
dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

console.log('🔧 DNS servers set to:', dns.getServers());

const uri = process.env.MONGO_URL
const dbName = process.env.DB_NAME || 'patna_piano_academy'

if (!uri) {
  throw new Error('MONGO_URL is not defined')
}

// For MongoDB Atlas SRV connections on Windows, we need to manually resolve SRV records
// and use a direct connection string since the MongoDB driver doesn't respect Node.js DNS settings
async function getDirectConnectionString(srvUri: string): Promise<string> {
  try {
    // Extract the cluster name from SRV URI
    const match = srvUri.match(/mongodb\+srv:\/\/(?:[^@]+@)?([^/]+)/);
    if (!match) return srvUri;
    
    const hostPart = match[1];
    const srvRecord = `_mongodb._tcp.${hostPart}`;
    
    console.log('🔍 Resolving SRV record:', srvRecord);
    
    // Resolve SRV records
    const srvRecords = await new Promise<any[]>((resolve, reject) => {
      dns.resolveSrv(srvRecord, (err, addresses) => {
        if (err) reject(err);
        else resolve(addresses);
      });
    });
    
    if (!srvRecords || srvRecords.length === 0) {
      console.log('⚠️ No SRV records found, using original URI');
      return srvUri;
    }
    
    // Pick the first available host
    const { name, port } = srvRecords[0];
    console.log('✅ Resolved to:', name, ':', port);
    
    // Parse the SRV URI properly to extract credentials and database
    const url = new URL(srvUri.replace('mongodb+srv://', 'http://'));
    const username = url.username;
    const password = url.password;
    const dbPart = url.pathname.substring(1) || dbName; // Remove leading slash
    
    // Build direct connection string
    const authPart = username && password ? `${username}:${password}` : '';
    const directUri = `mongodb://${authPart}@${name}:${port}/${dbPart}?ssl=true&retryWrites=true&w=majority&authSource=admin`;
    console.log('🔗 Using direct connection string');
    
    return directUri;
  } catch (error) {
    console.log('⚠️ SRV resolution failed, using original URI:', error);
    return srvUri;
  }
}

let connectionUri = uri;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
  var _connectionUri: string | undefined
}

// Use cached connection if available, otherwise establish new connection
if (process.env.NODE_ENV === 'production') {
  clientPromise = getDirectConnectionString(uri).then(directUri => {
    connectionUri = directUri;
    const client = new MongoClient(directUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    return client.connect();
  });
} else {
  if (!global._mongoClientPromise) {
    global._connectionUri = uri;
    global._mongoClientPromise = getDirectConnectionString(uri).then(directUri => {
      connectionUri = directUri;
      const client = new MongoClient(directUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      return client.connect();
    });
  }
  clientPromise = global._mongoClientPromise;
}

export async function db() {
  try {
    const c = await clientPromise
    console.log('✅ MongoDB connected successfully')
    return c.db(dbName)
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
}

export default db