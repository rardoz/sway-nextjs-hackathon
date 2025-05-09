import { USER_REGISTRATION_FORM } from "@/common/constants/forms";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import FormGenerator from "./form-generator";

type Props = {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
};

function AccountDetailsForm({ errors, register }: Props) {
  return (
    <>
      {USER_REGISTRATION_FORM.map((field, index) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          name={field.name}
          autoFocus={index === 0}
        />
      ))}
    </>
  );
}

export default AccountDetailsForm;
