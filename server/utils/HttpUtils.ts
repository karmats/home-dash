export const DEFAULT_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const SSE_HEADERS = {
  ...DEFAULT_HEADERS,
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

export const resultToSseData = (result: any) => `data:${JSON.stringify({ result })}\n\n`;
export const heartbeatData = (time: number) => `data:${JSON.stringify({ heartbeat: time })}\n\n`;
export const errorToSseData = (error: any) => {
  let errorResult = error;
  if (error instanceof Error) {
    const { name, message } = error as Error;
    errorResult = { name, message };
  }
  return `data:${JSON.stringify({ errorResult })}\n\n`;
};
