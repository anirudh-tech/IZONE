import { Client, Account, Databases, Storage, Users, ID } from 'appwrite'

const appwriteUrl = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
const appwriteApiKey = process.env.APPWRITE_API_KEY!

export const createAppwriteAdminClient = () => {
  if (!appwriteUrl || !appwriteProjectId || !appwriteApiKey) {
    throw new Error('Appwrite admin configuration missing. Please set NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, and APPWRITE_API_KEY')
  }

  const client = new Client()
    .setEndpoint(appwriteUrl)
    .setProject(appwriteProjectId)
    .setKey(appwriteApiKey)

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client)
  }
}
