<template>
  <div
    class="mt-16 flex w-full max-w-96 grow-0 flex-col gap-6 self-center rounded-xl border surface-1 p-8 pt-6 shadow-lg"
  >
    <Tabs default-value="login" class="flex flex-col items-center gap-5">
      <TabsList>
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign up</TabsTrigger>
      </TabsList>

      <div class="flex flex-col gap-4 self-stretch">
        <Field v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="email" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </Field>
        <Field v-slot="{ componentField }" name="password">
          <FormItem>
            <div class="flex items-center justify-between">
              <FormLabel>Password</FormLabel>
              <SpinnerButton
                class="h-auto px-2 py-0"
                variant="link"
                tabindex="-1"
                @click="forgotPassword.execute()"
              >
                Forgot password
              </SpinnerButton>
            </div>
            <FormControl>
              <Input v-bind="componentField" type="password" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </Field>
        <Field v-slot="{ setValue, value }" name="captcha">
          <FormItem class="self-stretch">
            <FormControl>
              <VueTurnstile
                :model-value="value"
                :site-key="config.public.turnstileKey"
                theme="dark"
                size="flexible"
                @update:model-value="
                  (val: string) => {
                    setValue(val);
                  }
                "
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </Field>

        <div class="self-stretch">
          <TabsContent value="signup" class="flex flex-col gap-1">
            <SpinnerButton
              variant="secondary"
              :loading="signUpInternal.status.value === 'pending'"
              @click="signUpInternal.execute()"
            >
              Create an account
            </SpinnerButton>
          </TabsContent>

          <TabsContent value="login" class="flex flex-col gap-1">
            <SpinnerButton
              variant="secondary"
              :loading="logInInternal.status.value === 'pending'"
              @click.prevent="logInInternal.execute()"
            >
              Login
            </SpinnerButton>
          </TabsContent>
        </div>
      </div>

      <Separator label="Or" class="self-stretch" />

      <div class="flex flex-col gap-3 self-stretch">
        <Button variant="secondary" @click="signInWithOAuth()">
          Login with Google
        </Button>
      </div>
    </Tabs>
  </div>
</template>
<script setup lang="ts">
import { Field, useForm } from "vee-validate";

import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import VueTurnstile from "vue-turnstile";
import { toast } from "vue-sonner";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

const config = useRuntimeConfig();

const schema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z.string().min(6, "Password must contain at least 6 characters"),
  captcha: z.string().min(1, "Unable to solve captcha"),
});

const form = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    captcha: "",
  },
});

const supabase = useSupabaseClient();

const signInWithOAuth = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/confirm",
    },
  });
  if (error) console.log(error);
};

const logInInternal = useAsyncData(
  async () => {
    const res = await form.validate();

    const { email, password, captcha } = schema.parse(res.values!);

    const result = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken: captcha,
      },
    });

    if (result.error) {
      toast.error(result.error.message);

      window.turnstile.reset();

      return;
    }

    navigateTo("/");
  },
  {
    immediate: false,
  },
);

watch(logInInternal.data, (loginResult) => {
  if (loginResult?.data.session) {
    navigateTo("/");
  }
});

const signUpInternal = useAsyncData(
  async () => {
    const res = await form.validate();

    const { email, password, captcha } = schema.parse(res.values!);

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        captchaToken: captcha,
      },
    });

    if (result.error) {
      toast.error(result.error.message);

      window.turnstile.reset();

      return;
    }

    toast.success(
      "Account created. Please confirm your email before logging in.",
    );
  },
  {
    immediate: false,
  },
);

const forgotPassword = useAsyncData(
  async () => {
    const email = await form.validateField("email");
    const captcha = await form.validateField("captcha");

    if (email.valid && captcha.valid) {
      const result = await supabase.auth.resetPasswordForEmail(
        form.values.email!,
        {
          captchaToken: form.values.captcha,
          redirectTo: window.location.origin + "/reset",
        },
      );

      if (result.error) {
        console.log(result.error);

        toast.error("Unable to send recovery email. Please try again.");

        return;
      }

      toast.success("Please check your emails.");
    }
  },
  {
    immediate: false,
  },
);
</script>
