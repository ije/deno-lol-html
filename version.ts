/** `VERSION` managed by https://deno.land/x/publish */
export const VERSION = "0.1.0";

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
  const cmd = new Deno.Command("deno", {
    args: ["run", "-A", "build.ts"],
    stdout: "inherit",
    stderr: "inherit",
  });
  return (await cmd.spawn().status).success;
}
