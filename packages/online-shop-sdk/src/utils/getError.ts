export const getError = (err: any) => {
  if (err.response) {
    return {
      status: err.response.status,
      statusText: err.response.statusText,
      data: err.response.data,
      error: err,
    };
  } else if (err.request) {
    return err.request;
  } else {
    return err.message;
  }
};
