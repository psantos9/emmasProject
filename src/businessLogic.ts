import axios from 'axios'
import Bottleneck from 'bottleneck'

export interface IUser {
  id: string // the user id
  email: string
}

export interface IPermission {
  user: {
    id: string
  }
}

const limiter = new Bottleneck({ maxConcurrent: 10, minTime: 33 })

export const getBearerToken = async (params: { host: string, apitoken: string }): Promise<string> => {
  const { host, apitoken } = params
  const base64ApiToken = Buffer.from(`apitoken:${apitoken}`).toString('base64')

  const authResponse = await axios.post<{ access_token: string }>(`https://${host}/services/mtm/v1/oauth2/token`, new URLSearchParams({ grant_type: 'client_credentials' }), {
    headers: {
      Authorization: `Basic ${base64ApiToken}`
    }
  }).then(({ data }) => data)
  return authResponse.access_token
}

export const fetchUserIdsWithPermissionInWorkspacePage = async (params: { bearerToken: string, host: string, workspaceId: string, page?: number, size?: number }): Promise<{ total: number, usersWithPermissions: string[] }> => {
  const { bearerToken, page: pageNumber = 1, size = 100, workspaceId, host } = params
  const url = new URL(`https://${host}/services/mtm/v1/permissions`)
  url.searchParams.set('workspaceId', workspaceId)
  url.searchParams.set('page', pageNumber.toString())
  url.searchParams.set('size', size?.toString())
  const page = await axios.get<{ errors: any[], status: 'OK' | 'NOK', total: number, type: string, data: IPermission[] }>(url.toString(), {
    headers: {
      authorization: `Bearer ${bearerToken}`
    }
  }).then(({ data }) => ({ total: data.total, usersWithPermissions: data.data.map(({ user: { id: userId } }) => userId) }))
  return page
}

export const fetchUserIdsWithPermissionsInWorkspace = async (params: { host: string, apitoken: string, workspaceId: string }): Promise<any> => {
  const { host, apitoken, workspaceId } = params
  const bearerToken = await getBearerToken({ host, apitoken })
  const userIdsWithPermissions = new Set<string>()
  let page = 1
  let hasMore = true
  do {
    const { usersWithPermissions: usersWithPermissionsPage, total } = await fetchUserIdsWithPermissionInWorkspacePage({ bearerToken, host, page, workspaceId })
    usersWithPermissionsPage.forEach(userId => userIdsWithPermissions.add(userId))
    console.log(`Fetched page ${page}, total count: ${total}, got: ${userIdsWithPermissions.size}`)
    if (userIdsWithPermissions.size < total) {
      page++
    }
    else { hasMore = false }
  } while (hasMore)
  return Array.from(userIdsWithPermissions)
}

export const fetchUserIdsForAccountPage = async (params: { bearerToken: string, host: string, accountId: string, page?: number, size?: number }): Promise<{ total: number, userIds: string[] }> => {
  const { bearerToken, page: pageNumber = 1, size = 100, accountId, host } = params
  const url = new URL(`https://${host}/services/mtm/v1/accounts/${accountId}/users`)
  url.searchParams.set('page', pageNumber.toString())
  url.searchParams.set('size', size?.toString())
  url.searchParams.set('sort', 'email-asc')
  const page = await axios.get<{ errors: any[], status: 'OK' | 'NOK', total: number, type: string, data: IUser[] }>(url.toString(), {
    headers: {
      authorization: `Bearer ${bearerToken}`
    }
  }).then(({ data }) => ({ total: data.total, userIds: data.data.map(({ id }) => id) }))
  return page
}

export const fetchUserIdsForAccount = async (params: { host: string, apitoken: string, accountId: string }): Promise<any> => {
  const { host, apitoken, accountId } = params
  const bearerToken = await getBearerToken({ host, apitoken })
  const userIds = new Set<string>()
  let page = 1
  let hasMore = true
  do {
    const { userIds: userIdsPage, total } = await fetchUserIdsForAccountPage({ bearerToken, host, page, accountId })
    userIdsPage.forEach(userId => userIds.add(userId))
    console.log(`Fetched page ${page}, total count: ${total}, got: ${userIds.size}`)
    if (userIds.size < total) {
      page++
    }
    else { hasMore = false }
  } while (hasMore)
  return Array.from(userIds)
}

export const fetchEmailsPage = async (params: { bearerToken: string, host: string, accountId: string, page?: number, size?: number }): Promise<{ total: number, emails: string[] }> => {
  const { bearerToken, page: pageNumber = 1, size = 100, accountId, host } = params
  const url = new URL(`https://${host}/services/mtm/v1/accounts/${accountId}/users`)
  url.searchParams.set('page', pageNumber.toString())
  url.searchParams.set('size', size?.toString())
  url.searchParams.set('sort', 'email-asc')
  const page = await axios.get<{ errors: any[], status: 'OK' | 'NOK', total: number, type: string, data: IUser[] }>(url.toString(), {
    headers: {
      authorization: `Bearer ${bearerToken}`
    }
  }).then(({ data }) => ({ total: data.total, emails: data.data.map(({ email }) => email) }))
  return page
}

export const fetchEmails = async (params: { host: string, apitoken: string, accountId: string }): Promise<any> => {
  const { host, apitoken, accountId } = params
  const bearerToken = await getBearerToken({ host, apitoken })
  const emails = new Set<string>()
  let page = 1
  let hasMore = true
  do {
    const { emails: emailsPage, total } = await fetchEmailsPage({ bearerToken, host, page, accountId })
    emailsPage.forEach(email => emails.add(email))
    console.log(`Fetched page ${page}, total count: ${total}, got: ${emails.size}`)
    if (emails.size < total) {
      page++
    }
    else { hasMore = false }
  } while (hasMore)
  return Array.from(emails)
}

export const deleteUser = async (params: { bearerToken: string, host: string, userId: string }) => {
  const { bearerToken, host, userId } = params
  const url = new URL(`https://${host}/services/mtm/v1/users/${userId}`)
  await axios.delete(url.toString(), {
    headers: {
      authorization: `Bearer ${bearerToken}`
    }
  })
}

export const limitedDeleteUser = limiter.wrap(deleteUser)
