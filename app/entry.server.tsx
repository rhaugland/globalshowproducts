import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToPipeableStream} from 'react-dom/server';
import {PassThrough} from 'node:stream';
import type {EntryContext} from 'react-router';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  return new Promise<Response>((resolve, reject) => {
    const {pipe, abort} = renderToPipeableStream(
      <ServerRouter context={reactRouterContext} url={request.url} />,
      {
        onShellReady() {
          const body = new PassThrough();
          pipe(body);

          const chunks: Buffer[] = [];
          body.on('data', (chunk: Buffer) => chunks.push(chunk));
          body.on('end', () => {
            const html = Buffer.concat(chunks).toString();
            responseHeaders.set('Content-Type', 'text/html');
            resolve(
              new Response('<!DOCTYPE html>' + html, {
                headers: responseHeaders,
                status: responseStatusCode,
              }),
            );
          });
          body.on('error', reject);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error(error);
        },
      },
    );

    setTimeout(abort, 10000);
  });
}
