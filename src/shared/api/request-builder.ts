import type { AxiosRequestConfig } from "axios";
import { apiClient } from "./client";
import { ErrorRequest } from "./error-request";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export class RequestBuilder<T = unknown> extends ErrorRequest {
  private config: AxiosRequestConfig = {};

  withMethod(method: HttpMethod): this {
    this.config.method = method;
    return this;
  }

  withUrl(url: string): this {
    this.config.url = url;
    return this;
  }

  withData(data: unknown): this {
    this.config.data = data;
    return this;
  }

  withParams(params: Record<string, unknown>): this {
    this.config.params = params;
    return this;
  }

  withHeaders(headers: Record<string, string>): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  async send(): Promise<T> {
    try {
      const { data } = await apiClient.request<T>(this.config);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }
}


export function createRequest(url: string): RequestBuilder {
  return new RequestBuilder().withUrl(url);
}
