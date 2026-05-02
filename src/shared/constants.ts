export const DEFAULT_WIDTH = 1920;
export const DEFAULT_HEIGHT = 1080;
export const MIN_RESOLUTION = 1;
export const MAX_RESOLUTION = 8192;

export const DEFAULT_JSX = `function Component() {
  return (
    <div style={{
      width: 800,
      height: 300,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 40,
      background: "rgba(20, 20, 28, 0.92)",
      color: "white",
      fontSize: 56,
      fontWeight: 700,
      boxShadow: "0 24px 80px rgba(0,0,0,0.35)"
    }}>
      Sample UI Asset
    </div>
  );
}

export default Component;`;
