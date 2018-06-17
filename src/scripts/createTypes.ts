import { generateNamespace } from "@gql2ts/from-schema";
import * as fs from "fs";
import path from "path"
import { genSchema } from "../utils/genSchema";

const typescriptTypes = generateNamespace("GQL", genSchema());
fs.writeFileSync(path.join(__dirname, "../types/schema.d.ts"), typescriptTypes);