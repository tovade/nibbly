export type ErrorResponse = {
  errors: Array<string>
  message: string
}

export type DataResponse<T> = {
  errors?: Array<string>
  message: string
  data?: T
}

export function isError<T>(
  response: ErrorResponse | DataResponse<T>,
): response is ErrorResponse {
  return response.errors !== undefined
}
