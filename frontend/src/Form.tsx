/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FC, useState, createContext, FormEvent } from 'react';
import { PrimaryButton, gray5, gray6 } from './Styles';

// define "INDEXABLE TYPE"
export interface Values {
  [key: string]: any;
}
// render a validation error if the field has been touched and lost focus
export interface Errors {
  [key: string]: string[];
}
export interface Touched {
  [key: string]: boolean;
}
export interface SubmitResult {
  success: boolean;
  errors?: Errors;
}

interface FormContextProps {
  values: Values;
  setValue?: (fieldName: string, value: any) => void;
  errors: Errors;
  validate?: (fieldName: string) => void;
  touched: Touched;
  setTouched?: (fieldName: string) => void;
}

// create the 'form context'
export const FormContext = createContext<FormContextProps>({
  values: {},
  errors: {},
  touched: {},
});

//  create a type for a validator by using "TYPE ALIAS"
type Validator = (value: any, args?: any) => string;

//  create the first validator to check if a field is populated or not
export const required: Validator = (value: any): string =>
  value === undefined || value === null || value === ''
    ? 'This must be populated'
    : '';

//  create the second validator to check if the number of characters of a value is met or not
export const minLength: Validator = (value: any, length: number): string =>
  value && value.length < length
    ? `This must be at least ${length} characters`
    : '';

//  add a prop to allow validation rules to be defined on the form
interface Validation {
  validator: Validator;
  arg?: any;
}

// we can specify a single rule or an array of rules
interface ValidationProps {
  [key: string]: Validation | Validation[];
}

// define Props interface
interface Props {
  submitCaption?: string;
  validationRules?: ValidationProps;
  onSubmit: (values: Values) => Promise<SubmitResult> | void;
  submitResult?: SubmitResult;
  successMessage?: string;
  failureMessage?: string;
}

// ************** implement the Form function component **************
export const Form: FC<Props> = ({
  submitCaption,
  children,
  validationRules,
  onSubmit,
  submitResult,
  successMessage = 'Success!',
  failureMessage = 'Something went wrong',
}) => {
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  //  The submitting state indicates whether the submission is in progress,
  //  the submitted state indicates whether the form has been submitted,
  //  and the submitError state indicates whether the submission failed
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // return an empty array if there are no rules to check
  const validate = (fieldName: string): string[] => {
    if (!validationRules) {
      return [];
    }
    if (!validationRules[fieldName]) {
      return [];
    }
    //  rules can either be a single Validation object or an array of Validation objects. Therefore,
    //  we standardize into uniform situation by always working with an array of rules
    const rules = Array.isArray(validationRules[fieldName])
      ? (validationRules[fieldName] as Validation[])
      : ([validationRules[fieldName]] as Validation[]);
    //  create fieldErrors array
    const fieldErrors: string[] = [];
    //  iterate through the rules, invoking the validator and
    //  collecting any errors in a fieldErrors array
    rules.forEach((rule) => {
      const error = rule.validator(values[fieldName], rule.arg);
      if (error) {
        fieldErrors.push(error);
      }
    });
    //  update "errors" state with newErrors
    const newErrors = { ...errors, [fieldName]: fieldErrors };
    setErrors(newErrors);
    return fieldErrors;
  };

  //  create an async "handleSubmit" function to handle form submission.
  //  This is because the consumers submit a handler function that is likely to call a web service, which is asynchronous
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      // set state to indicate submission is in progress
      setSubmitting(true);
      setSubmitError(false);
      //  call the onSubmit() function
      const result = await onSubmit(values);
      // The result may be passed through as a prop
      if (result === undefined) {
        return;
      }
      //  update the 'errors' state from the submission result
      setErrors(result.errors || {});
      //  set the 'submitError' state
      setSubmitError(!result.success);
      //  set state to indicate submission has finished
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const validateForm = () => {
    const newErrors: Errors = {};
    let haveError: boolean = false;
    if (validationRules) {
      Object.keys(validationRules).forEach((fieldName) => {
        newErrors[fieldName] = validate(fieldName);
        if (newErrors[fieldName].length > 0) {
          haveError = true;
        }
      });
    }
    setErrors(newErrors);
    return !haveError;
  };

  const disabled = submitResult
    ? submitResult.success
    : submitting || (submitted && !submitError);

  const showError = submitResult
    ? !submitResult.success
    : submitted && submitError;

  const showSuccess = submitResult
    ? submitResult.success
    : submitted && !submitError;

  return (
    <FormContext.Provider
      value={{
        values,
        setValue: (fieldName: string, value: any) => {
          setValues({ ...values, [fieldName]: value });
        },
        //  These additions to the context will allow the Field component to
        //  access the validation errors and whether it has been touched
        errors,
        validate,
        touched,
        setTouched: (fieldName: string) => {
          setTouched({ ...touched, [fieldName]: true });
        },
      }}
    >
      <form noValidate={true} onSubmit={handleSubmit}>
        <fieldset
          //  disable the form when submission is in progress or the form has been successfully submitted
          disabled={disabled}
          css={css`
            margin: 10px auto 0 auto;
            padding: 30px;
            width: 350px;
            background-color: ${gray6};
            border-radius: 4px;
            border: 1px solid ${gray5};
            box-shadow: 0 3px 5px 0 rgba(0, 0, 0, 0.16);
          `}
        >
          {children}
          <div
            css={css`
              margin: 30px 0px 0px 0px;
              padding: 20px 0px 0px 0px;
              border-top: 1px solid ${gray5};
            `}
          >
            <PrimaryButton type="submit">{submitCaption}</PrimaryButton>
          </div>
          {showError && (
            <p
              css={css`
                color: red;
              `}
            >
              {failureMessage}
            </p>
          )}
          {showSuccess && (
            <p
              css={css`
                color: green;
              `}
            >
              {successMessage}
            </p>
          )}
        </fieldset>
      </form>
    </FormContext.Provider>
  );
};
