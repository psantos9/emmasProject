import { fetchEmails } from './businessLogic'
import { it } from 'vitest'
import { writeFileSync } from 'fs'

it('fetches the emails from an account', async () => {
  const emails = await fetchEmails({ accountId: '', host: '', apitoken: '' })
  writeFileSync('emails.json', JSON.stringify(emails))
}, 120000)
