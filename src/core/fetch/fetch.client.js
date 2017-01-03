import 'whatwg-fetch';

export default self.fetch.bind(self);

// noinspection JSUnusedGlobalSymbols
export const Headers = self.Headers;

// noinspection JSUnusedGlobalSymbols
export const Request = self.Request;

// noinspection JSUnusedGlobalSymbols
export const Response = self.Response;
