/** `VERSION` managed by https://deno.land/x/publish */
export const VERSION = "0.0.6";

/** `prepublish` will be invoked before publish */
export async function prepublish(version: string): Promise<boolean> {
  const toml = await Deno.readTextFile("./Cargo.toml");
  const readme = await Deno.readTextFile("./README.md");
  await Deno.writeTextFile(
    "./Cargo.toml",
    toml.replace(/version = "[\d\.]+"/, `version = "${version}"`),
  );
  await Deno.writeTextFile(
    "./README.md",
    readme.replaceAll(/lol_html@[\d\.]+/g, `lol_html@${version}`),
  );
  const p = Deno.run({
    cmd: ["deno", "run", "-A", "build.ts"],
    stdout: "inherit",
    stderr: "inherit",
  });
  const { success } = await p.status();
  p.close();
  return success;
}
