import { Application } from "oak";
import { assignModule } from "oak_decorators";
import { AppModule } from "./app.module.ts";

const app = new Application();
app.use(assignModule(AppModule));

await app.listen({ port: 8000 });
