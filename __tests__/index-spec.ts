import { parse } from "../src/index";
import { load } from "./util";

const emptyDoc = load("empty.🙌");

test("Should lex an empty document", () => {
  expect(parse(emptyDoc)).toHaveLength(2);
});
