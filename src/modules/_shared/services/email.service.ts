import { copyrightYear, Handlebars } from '@point-hub/express-utils';

import emailServiceConfig from '@/config/email';

export interface IData {
  to: string
  subject: string
  template: string
  context: Record<string, unknown>
}

export interface IEmailService {
  send(data: IData): Promise<void>;
  renderTemplate(path: string, context?: Record<string, unknown>): Promise<string>;
}

/**
 * One-time Handlebars setup
 */
const initHandlebars = (() => {
  let initialized = false;

  return async () => {
    if (initialized) return;
    initialized = true;

    // Partials
    const header = await Bun.file(`${import.meta.dir}/../emails/header.hbs`).text();
    Handlebars.registerPartial('header', Handlebars.compile(header));

    const footer = await Bun.file(`${import.meta.dir}/../emails/footer.hbs`).text();
    Handlebars.registerPartial('footer', Handlebars.compile(footer));

    // Helpers
    Handlebars.registerHelper('appName', () => 'Starter App');
    Handlebars.registerHelper('copyrightYear', copyrightYear);
  };
})();

/**
 * Render Handlebars template
 */
const renderTemplate = async (
  path: string,
  context: Record<string, unknown> = {},
): Promise<string> => {
  await initHandlebars();

  const file = Bun.file(`./src/${path}`);
  if (!(await file.exists())) {
    throw new Error(`Email template not found: ${path}`);
  }

  return Handlebars.render(await file.text(), context);
};

/**
 * Send email
 */
const send = async (data: IData): Promise<void> => {
  const html = await renderTemplate(data.template, data.context);

  await fetch(emailServiceConfig.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: data.to,
      subject: data.subject,
      html,
    }),
  });
};

/**
 * Static email service (singleton)
 */
export const EmailService: IEmailService = {
  send,
  renderTemplate,
};
