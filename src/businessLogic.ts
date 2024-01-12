import axios from 'axios'
export interface IUser {
  email: string

}
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
    if (emails.size < total) page++
    else hasMore = false
  } while (hasMore)
  return Array.from(emails)
}
