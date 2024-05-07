import { assignModule } from "ork_decorators";
import { Application } from "../src/deps.ts";
import { AppModule } from "./app.module.ts";

const app = new Application();
app.use(assignModule(AppModule));

await app.listen({ port: 8000 });
