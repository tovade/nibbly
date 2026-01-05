export type ErrorResponse = {
  error: {
    message: string
  }
}

export type DataResponse<T> = {
  message: string
  data?: T
}

export function isError<T>(
  response: ErrorResponse | DataResponse<T>,
): response is ErrorResponse {
  return (response as ErrorResponse).error !== undefined
}
