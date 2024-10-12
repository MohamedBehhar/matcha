const theme = localStorage.getItem("theme") || "system";

export function ThemeSwithcer() {
  return (
    <select
      defaultValue={theme}
      className="bg-card px-3 py-1.5 rounded"
      onChange={(e) => {
        const value = e.target.value;
        const body = document.body;
        body.classList.remove("system", "light", "dark");
        body.classList.add(value);
        localStorage.setItem("theme", value);
      }}
    >
      <option value="system">system</option>
      <option value="light">light</option>
      <option value="dark">dark</option>
    </select>
  );
}
