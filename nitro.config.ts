export default defineNitroConfig({
  preset: "vercel",
  output: {
    dir: ".vercel/output",
    publicDir: ".vercel/output/static"
  }
});
