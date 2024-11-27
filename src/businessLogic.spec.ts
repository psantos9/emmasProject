import { fetchUserIdsWithPermissionsInWorkspace, fetchUserIdsForAccount, deleteUser, limitedDeleteUser, getBearerToken } from './businessLogic'
import { writeFileSync } from 'fs'
const { LEANIX_APITOKEN: apitoken, LEANIX_HOST: host, LEANIX_WORKSPACE_ID: workspaceId, LEANIX_ACCOUNT_ID: accountId } = process.env

it('fetches userIds with permissions for a workspace', async () => {
  const userIdsWithPermissionsInWorkspace = await fetchUserIdsWithPermissionsInWorkspace({ workspaceId, host, apitoken })
  writeFileSync('userIdsWithPermissions.json', JSON.stringify(userIdsWithPermissionsInWorkspace))
}, 120000)

it('fetches userIds associated with an account', async () => {
  const userIdsForAccount = await fetchUserIdsForAccount({ accountId, host, apitoken })
  writeFileSync('userIdsForAccount.json', JSON.stringify(userIdsForAccount))
}, 120000)

it('fetches userIds without a permission in the sandbox workspace', async () => {
  const userIdsWithPermissionsInWorkspace = new Set<string>(await fetchUserIdsWithPermissionsInWorkspace({ workspaceId, host, apitoken }))
  const userIdsForAccount = new Set<string>(await fetchUserIdsForAccount({ accountId, host, apitoken }))
  const userIdsWithoutPermissions = [...userIdsForAccount].filter(userId => !userIdsWithPermissionsInWorkspace.has(userId))
  writeFileSync('userIdsWithoutPermissions.json', JSON.stringify(userIdsWithoutPermissions))

  const bearerToken = await getBearerToken({ host, apitoken })
  await Promise.all(userIdsWithoutPermissions.map(async (userId, i) => {
    await limitedDeleteUser({ bearerToken, host, userId })
    console.log(`Deleted user ${i} of ${userIdsWithoutPermissions.length}`)
  }))
  console.log('done')


}, 120000)
