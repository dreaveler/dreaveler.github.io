import Hexo from "hexo";
import path from "node:path";

const command = process.argv[2] || "generate";
const root = process.cwd();
const hexo = new Hexo(root, {
  _: [command],
  draft: process.argv.includes("--draft"),
  safe: process.argv.includes("--safe"),
  debug: process.argv.includes("--debug"),
  silent: false
});

hexo.env.init = true;
hexo.script_dir = path.join(root, ".hexo-scripts") + path.sep;

try {
  await hexo.init();

  if (command === "clean") {
    await hexo.call("clean", {});
  } else if (command === "generate" || command === "build") {
    await hexo.call("generate", {});
  } else if (command === "deploy") {
    await hexo.call("clean", {});
    await hexo.call("generate", {});
  } else {
    throw new Error(`Unsupported Hexo command: ${command}`);
  }

  await hexo.exit();
} catch (error) {
  console.error(error.stack || error);
  await hexo.exit(error);
  process.exitCode = 1;
}
