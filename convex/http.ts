import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  pathPrefix: "/images/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const storageId = url.pathname.split("/").pop();

    if (!storageId) {
      return new Response("Missing storageId", { status: 400 });
    }

    const id = storageId as Id<"_storage">;
    const imageUrl = await ctx.storage.getUrl(id);

    if (!imageUrl) {
      return new Response("Image not found", { status: 404 });
    }

    return Response.redirect(imageUrl);
  }),
});

export default http;