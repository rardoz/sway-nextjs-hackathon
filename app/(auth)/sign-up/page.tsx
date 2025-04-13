import AuthCard from "@/common/components/auth/auth-card";
import ButtonHandler from "@/common/components/auth/sign-up/button-handler";
import HightlightBar from "@/common/components/auth/sign-up/highlight-bar";
import RegistrationStep from "@/common/components/auth/sign-up/registration-step";
import { SignUpFormProvider } from "@/common/providers/form-provider";

export default function Page() {
  return (
    <AuthCard
      title="Sign up"
      description="Create an account to get started"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    >
      <div id="clerk-captcha" className="sr-only" />
      <SignUpFormProvider>
        <div className="flex flex-col gap-5">
          <RegistrationStep />
          <ButtonHandler />
          <HightlightBar />
        </div>
      </SignUpFormProvider>
    </AuthCard>
  );
}
