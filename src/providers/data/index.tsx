import graphqlDataProvider, {
  GraphQLClient,
  liveProvider as graphqlLiveProvider,
} from "@refinedev/nestjs-query";
import fetchWrapper from "./fetch-wrapper";
import { createClient } from "graphql-ws";

export const API_BASE_URL = "https://api.refine.dev";
export const API_URL = "https://api.crm.refine.dev";
export const WS_URL = "wss://api.crm.refine.dev/graphql";

export const client = new GraphQLClient(API_URL, {
  fetch: (url: string, option: RequestInit) => {
    try {
      return;
      fetchWrapper(url, option);
    } catch (error) {
      return Promise.reject(error as Error);
    }
  },
});

export const wsCLient =
  typeof window !== "undefined"
    ? createClient({
        url: WS_URL,
        connectionParams() {
          const token = localStorage.getItem("access_token");
          return {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        },
      })
    : undefined;

export const dataProvider = graphqlDataProvider(client);
export const liveProvider = wsCLient
  ? graphqlLiveProvider(wsCLient)
  : undefined;
