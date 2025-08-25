import { Client, Account, Databases, Storage, ID } from 'appwrite'

// Appwrite configuration
const appwriteUrl = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!

// Client-side Appwrite client for use in components and client-side code
export const createAppwriteClient = () => {
  const client = new Client()
    .setEndpoint(appwriteUrl)
    .setProject(appwriteProjectId)

  return client
}

// Simple client for non-SSR use cases
const client = new Client()
  .setEndpoint(appwriteUrl)
  .setProject(appwriteProjectId)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export { ID }

// Export the client for advanced use cases
export { client as appwrite }
