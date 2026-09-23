/** Make "local time" deterministic for every test worker (also works on Windows). */
export default function setup() {
  process.env.TZ = "America/New_York";
}
