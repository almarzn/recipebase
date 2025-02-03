<script setup lang="ts">
const props = defineProps<{
  submit: (value: string) => Promise<void>;
}>();

const value = ref<string[]>([]);
const submitting = ref<boolean>();

const submit = async (val: string[]) => {
  console.log("submit");
  submitting.value = true;
  try {
    await props.submit(val.join(""));
  } finally {
    submitting.value = false;
  }
};

const inputContainer = useTemplateRef<HTMLDivElement>("inputContainer");

onMounted(() => {
  inputContainer.value?.querySelectorAll("input")[0].focus();
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <h2 class="heading-3">Please reauthenticate</h2>
    <p class="text-xs text-muted-foreground">
      For security reasons, a one-time password has been sent to your email
      address, to confirm the password change.
    </p>
  </div>

  <div ref="inputContainer">
    <PinInput
      id="pin-input"
      v-model="value"
      otp
      placeholder="○"
      :disabled="submitting"
      @complete="submit"
    >
      <PinInputGroup>
        <PinInputInput
          v-for="(id, index) in 6"
          :key="id"
          ref="inputContainer"
          :index="index"
        />
      </PinInputGroup>
    </PinInput>
  </div>
</template>
