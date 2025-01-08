import { copyrightYear, Handlebars } from '@point-hub/express-utils'

import emailServiceConfig from '@/config/email'

// Partials
const header = await Bun.file('./src/utils/email/header.hbs').text()
Handlebars.registerPartial('header', Handlebars.compile(header))
const footer = await Bun.file('./src/utils/email/footer.hbs').text()
Handlebars.registerPartial('footer', Handlebars.compile(footer))

// Helpers
Handlebars.registerHelper('appName', () => {
  return 'Pointhub'
})
Handlebars.registerHelper('copyrightYear', copyrightYear)

// Render
export const renderHbsTemplate = async (path: string, context?: Record<string, unknown>) => {
  const file = Bun.file(`./src/${path}`)
  if (!(await file.exists())) {
    return `Template not found: ${path}`
  }
  return Handlebars.render(await file.text(), context ?? {})
}

// Sending Mail
export const sendMail = async (html: string, to: string, subject: string) => {
  fetch(emailServiceConfig.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: html,
      to: to,
      subject: subject,
    }),
  })
}
