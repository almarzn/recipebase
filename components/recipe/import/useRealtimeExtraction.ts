import { ref, onUnmounted } from "vue";
import type { SourceValue } from "~/components/recipe/import/SourceValue";
import type { RecipePayload } from "~/types/recipe";

const initialProgress = { progress: 0, name: "Uploading..." };
const sendBody = (value: SourceValue, xhr: XMLHttpRequest) => {
  if (value.current === "image") {
    const body = new FormData();
    body.set("image", value.image!);

    return xhr.send(body);
  }

  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(
    JSON.stringify(
      value.current === "text"
        ? {
            text: value.text,
          }
        : {
            url: value.url,
          },
    ),
  );
};

export function useRealtimeExtraction(
  model: Ref<string | undefined>,
  payload: Ref<SourceValue>,
) {
  const progress = ref<{ progress: number; name: string }>(initialProgress);
  const data = ref<RecipePayload[] | undefined>(undefined);
  const error = ref<boolean>(false);

  const xhr = ref<XMLHttpRequest | null>(null);

  function execute() {
    progress.value = initialProgress;
    data.value = undefined;
    error.value = false;

    if (xhr.value) {
      xhr.value.abort();
      xhr.value = null;
    }

    xhr.value = new XMLHttpRequest();
    xhr.value.open("POST", `/api/imports?model=${model.value}`, true);

    xhr.value.setRequestHeader("Accept", "text/event-stream");

    let buffer = "";

    xhr.value.onprogress = function () {
      const newChunk = xhr.value!.responseText.substring(buffer.length);
      buffer += newChunk;

      let startIdx = 0;
      let newlineIdx: number;

      while ((newlineIdx = buffer.indexOf("\n", startIdx)) !== -1) {
        const line = buffer.substring(startIdx, newlineIdx).trim();
        startIdx = newlineIdx + 1;

        if (line.startsWith("progress:")) {
          const data = line.substring("progress:".length).trim();
          const [name, p] = JSON.parse(data);
          progress.value = { name, progress: p };
        } else if (line.startsWith("response:")) {
          const response = line.substring("response:".length).trim();
          data.value = JSON.parse(response);
        } else if (line === "error") {
          error.value = true;
        }
      }

      buffer = buffer.substring(startIdx);
    };

    xhr.value.onerror = function () {
      error.value = true;
    };

    xhr.value.onload = function () {
      if (!data.value) {
        error.value = true;
      }
    };

    sendBody(payload.value, xhr.value);
  }

  /**
   * Clean up when the component using this composable unmounts,
   * so we don't keep the XHR connection open.
   */
  onUnmounted(() => {
    if (xhr.value) {
      xhr.value.abort();
      xhr.value = null;
    }
  });

  const status = computed(() => {
    const hasXhr = !!xhr.value;
    const hasError = !!error.value;
    const hasResponse = !!data.value;

    if (hasError) {
      return "error" as const;
    }

    if (hasResponse) {
      return "success" as const;
    }

    if (hasXhr) {
      return "pending" as const;
    }

    return "idle" as const;
  });

  return {
    progress,
    data,
    error,
    execute,
    status,
  };
}
