import { Comments } from "~/lib/Comments";
import type { CommentTarget } from "~/types/comment";
import { v4 } from "uuid";
import { toast } from "vue-sonner";

export const useComments = async (recipeId: Ref<string>) => {
  const client = useSupabaseClient();

  const comments = await useAsyncData(
    "recipeComments",
    () => Comments.using(client).findByRecipeId(recipeId.value),
    {
      lazy: true,
      watch: [recipeId],
    },
  );

  const optimisticComments = ref<
    {
      id: string;
      target: CommentTarget;
      created_at: Date;
      content: string;
      isNew: true;
    }[]
  >([]);

  const optimisticRemoved = ref<string[]>([]);

  const commentsForStep = (stepId: string) => {
    const commentsValue = comments.data.value ?? [];
    const allComments = [
      ...commentsValue,
      ...optimisticComments.value.filter(
        (el) => !commentsValue.find((it) => it.id === el.id),
      ),
    ].filter((el) => !optimisticRemoved.value?.includes(el.id));

    return allComments.filter((el) => {
      const target = el.target;
      return target && "step" in target && target.step === stepId;
    });
  };

  const addCommentToStep = (stepId: string) => {
    const id = v4();

    Comments.using(client)
      .addComment({
        id: id,
        target: { step: stepId },
        recipe_id: recipeId.value,
        content: "",
      })
      .catch(() => {
        toast.error("Unable to add comment, try again later.");
      });

    return (optimisticComments.value = [
      ...optimisticComments.value,
      {
        id: id,
        target: { step: stepId },
        content: "",
        created_at: new Date(),
        isNew: true,
      },
    ]);
  };

  const updateComment = async (id: string, value: string) => {
    Comments.using(client)
      .updateComment(id, value)
      .finally(() => {
        refreshNuxtData("recipeComments");
      })
      .catch(() => {
        toast.error("Unable to update comment, try again later.");
      });
  };

  const deleteComment = async (id: string) => {
    optimisticRemoved.value = [...optimisticRemoved.value, id];

    Comments.using(client)
      .deleteComment(id)
      .finally(() => {
        refreshNuxtData("recipeComments");
      })
      .catch(() => {
        toast.error("Unable to delete comment, try again later.");
      });
  };

  return { commentsForStep, addCommentToStep, updateComment, deleteComment };
};
