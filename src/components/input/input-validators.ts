export interface InputValidateResponse {
  isValid: boolean;
  errorMessage: string;
}

export const InputValidators = {
  nameValidator: (errorMessage?: string) => {
    const regex = /^[\w\s'"\.,-]*$/;
    const defaultErrorMessage = "allow characters are alpha-numeric, digits, dash, underscore, comma, quote, and dot";

    return (inputValue: string): InputValidateResponse => {
      return {
        isValid: regex.test(inputValue),
        errorMessage: errorMessage || defaultErrorMessage,
      };
    };
  },

  passwordValidator: (errorMessage?: string) => {
    const passwordRegex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&*\)\(\=]+$/;
    const defaultErrorMessage = "password must contain a special character, number, UPPERCASE.";

    return (value: string): InputValidateResponse => {
      return {
        isValid: passwordRegex.test(value),
        errorMessage: errorMessage || defaultErrorMessage,
      };
    };
  },
};
