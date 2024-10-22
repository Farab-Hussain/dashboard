import { GraphQLFormattedError } from "graphql";

type Error = {
  message: string;
  statusCode: string;
};

const customFetch = async (url: string, options: RequestInit) => {
  const accessToken = localStorage.getItem("accessToken");

  const headers = options.headers as Record<string, string>;

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: headers?.Authorization || `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Apollo-Request-Preflight": "true",
    },
  });
};
const getGraphQLError = (
  body: Record<"errors", GraphQLFormattedError[] | undefined>
): Error | null => {
  if (!body || !body.errors) {
    return {
      message: "Unknown Error",
      statusCode: "INTERNAL_SERVER_ERROR",
    };
  }
  if ("errors" in body) {
    const errors = body?.errors;
    const message = errors?.map((error) => error.message).join("");
    const code = errors?.map((error) => error.extensions?.code);

    return {
      message: message || JSON.stringify(body),
      statusCode: code?.join(",") || "500",
    };
  }
  return null;
};

export const fetchWrapper = async (url: string, options: RequestInit) => {
  const response = await customFetch(url, options);
  const body = await response.json();
  const error = getGraphQLError(body);
  if (error) {
    throw error;
  }
  return response;
};

export default customFetch;
