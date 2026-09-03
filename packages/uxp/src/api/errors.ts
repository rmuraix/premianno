/** Temporary polyfill of the global error handler until UXP provides one. */
export const polyFillGlobalErrorHandler = () => {
  if (!Object.hasOwn(window, "onerror")) {
    window.onerror = (error) => {
      console.error(error);
      //* Add any global handling (logging, reporting) here
      return true;
    };
  }
};
