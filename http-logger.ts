import { serve } from 'https://deno.land/std@0.181.0/http/server.ts';
import { parse } from 'https://deno.land/std@0.181.0/flags/mod.ts';
import { Ngrok } from 'https://deno.land/x/ngrok@4.0.1/mod.ts';

const DEFAULT_PORT = 8085;
const flags = parse(Deno.args, {
  string: ['port'],
  alias: { port: 'p' },
  default: { port: DEFAULT_PORT },
});

const ngrok = await Ngrok.create({
  protocol: 'http',
  port: flags.port,
});

ngrok.addEventListener('ready', (event) => {
  liner();
  console.log(
    '%c> Ngrok is ready to tunnel requests!',
    'color: #90ee90; font-weight: bold;'
  );
  console.log('%chttp://' + event.detail, 'color: #ef5b25; font-weight: bold;');
  liner();
});

const { columns } = Deno.consoleSize();

const liner = () =>
  console.log(
    '%c' + '-'.repeat(columns),
    'color: #878787; font-size: 1px; font-weight: bold;'
  );

liner();
console.log(
  '%c    __  ____  __        __                               \r\n   / / / / /_/ /_____  / /   ____  ____ _____ ____  _____\r\n  / /_/ / __/ __/ __ \\/ /   / __ \\/ __ `/ __ `/ _ \\/ ___/\r\n / __  / /_/ /_/ /_/ / /___/ /_/ / /_/ / /_/ /  __/ /    \r\n/_/ /_/\\__/\\__/ .___/_____/\\____/\\__, /\\__, /\\___/_/     \r\n             /_/                /____//____/             ',
  'color: #ff0000; font-size: 20px; font-weight: bold;'
);
liner();

const handler = async (request: Request): Promise<Response> => {
  console.log(
    `\n[%c${request.method}%c] %c${request.url}\n`,
    'color: #ff00ff; font-weight: bold;',
    '',
    'color: #ff00ff;'
  );
  console.log(
    '%c> %o\n',
    'color: #ef5b25; font-weight: bold;',
    request.headers
  );

  let body = '';
  try {
    body = JSON.stringify(await request.json(), null, 2);
  } catch {
    body = (await request.text()) || '{}';
  }

  console.log('%c> Body', 'color: cyan; font-weight: bold;');
  console.log('%c%s\n', 'color: cyan; font-weight: bold;', body);
  liner();

  return new Response('', { status: 200 });
};

await serve(handler, {
  port: parseInt(flags.port),
  onListen: ({ hostname, port }) => {
    console.log(
      '%c> Server is running on \n%chttp://%s:%d',
      'color: #90ee90; font-weight: bold;',
      'color: #ef5b25; font-weight: bold;',
      hostname,
      port
    );
  },
});
await ngrok.destroy('SIGKILL');
