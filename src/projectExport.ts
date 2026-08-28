/**
 * Упаковка всего проекта в ZIP прямо в браузере.
 *
 * `import.meta.glob(..., { query: "?raw" })` — на этапе сборки Vite сам
 * подставляет точное текстовое содержимое каждого файла проекта, поэтому
 * ничего не нужно копировать вручную: архив всегда соответствует исходникам.
 */
const files = import.meta.glob(
  [
    "../package.json",
    "../vite.config.js",
    "../tsconfig.json",
    "../index.html",
    "../README.md",
    "./**/*.{ts,tsx,css}",
  ],
  { query: "?raw", import: "default", eager: true }
) as Record<string, string>;

/** Приводит ключ вида "../package.json" или "./components/X.tsx" к пути внутри архива */
function zipPath(key: string): string {
  const relative = key.startsWith("../") ? key.slice(3) : "src/" + key.slice(2);
  return `solar-system/${relative}`;
}

export async function downloadProjectZip(): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const [key, content] of Object.entries(files)) {
    zip.file(zipPath(key), content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "solar-system.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
