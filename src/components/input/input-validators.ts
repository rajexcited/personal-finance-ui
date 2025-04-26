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
        errorMessage: errorMessage || defaultErrorMessage
      };
    };
  },

  passwordValidator: (errorMessage?: string) => {
    const passwordRegex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[!@#<$>%^&*])[\w!@#<$>%^&*\)\(\=]+$/;
    const defaultErrorMessage = "password must contain a special character, number, UPPERCASE.";

    return (value: string): InputValidateResponse => {
      return {
        isValid: passwordRegex.test(value),
        errorMessage: errorMessage || defaultErrorMessage
      };
    };
  },

  phoneNoValidator: (errorMessage?: string) => {
    const phoneNoRegex = /^(\+\d{1,2}[\s-])?\d{3}[\s.-]?\d{3}[\s.-]?\d{4}$/;
    const defaultErrorMessage = "phone number must follow the pattern 222-3333-4444 or +1-222-333-4444";

    return (value: string): InputValidateResponse => {
      return {
        isValid: phoneNoRegex.test(value),
        errorMessage: errorMessage || defaultErrorMessage
      };
    };
  }
};
