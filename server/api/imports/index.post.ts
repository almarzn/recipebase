import { getInputContent } from "./getInputContent";
import { getChatClient } from "~/server/api/imports/getChatClient";
import { extractRecipes } from "~/server/api/imports/extractRecipes";
import { TrackerGroup } from "are-we-there-yet";
import { startTracker } from "~/server/api/imports/startTracker";

export default defineEventHandler(async (event) => {
  setHeader(event, "cache-control", "no-cache");
  setHeader(event, "connection", "keep-alive");
  setHeader(event, "content-type", "text/event-stream");
  setResponseStatus(event, 200);

  const top = new TrackerGroup("Extracting Recipe");

  top.on("change", (name, completed) => {
    event.node.res.write(`progress:${JSON.stringify([name, completed])}\n`);
  });

  const reading = top.newItem("Reading recipes", 1);
  const scanningContent = top.newGroup("Extracing recipes", 5);

  try {
    event._handled = true;

    startTracker(reading);

    const content = await getInputContent(event);

    const client = await getChatClient(event);

    reading.completeWork(1);

    startTracker(scanningContent);

    const recipes = await extractRecipes(
      client,
      {
        role: "user",
        content: [content.completion],
      },
      scanningContent,
      content.metadata,
    );

    event.node.res.write(`response:${JSON.stringify(recipes)}\n`);
  } catch (e) {
    console.error(e);

    event.node.res.write(`error\n`);
  } finally {
    event.node.res.end();
  }
});
