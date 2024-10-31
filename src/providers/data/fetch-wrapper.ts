import { GraphQLFormattedError } from "graphql";

type Error = {
  message: string;
  statusCode: string;
};

const customFetch = async (url: string, options: RequestInit) => {
  const accessToken = localStorage.getItem("accessToken");

  const headers = options.headers as Record<string, string>;

  console.log("Fetching URL:", url);
  console.log("Request Options:", options);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        "Content-Type": "application/json",
        "Apollo-Request-Preflight": "true",
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Error Response:", errorBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error; // Rethrow the error for further handling
  }
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
    const errors = body.errors;
    const message = errors.map((error) => error.message).join(", ");
    const code = errors.map((error) => error.extensions?.code);

    return {
      message: message || JSON.stringify(body),
      statusCode: code.join(", ") || "500",
    };
  }
  return null;
};

export const fetchWrapper = async (url: string, options: RequestInit) => {
  try {
    const response = await customFetch(url, options);

    // Check if response is OK
    if (!response.ok) {
      const body = await response.json();
      const error = getGraphQLError(body);
      console.error("Error Response:", body);
      throw (
        error || {
          message: "Network Error",
          statusCode: response.status.toString(),
        }
      );
    }

    const body = await response.json();
    const error = getGraphQLError(body);
    if (error) {
      console.error("GraphQL Error:", error);
      throw error;
    }

    return response;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw { message: "Fetch failed", statusCode: "500", details: error };
  }
};

export default customFetch;
