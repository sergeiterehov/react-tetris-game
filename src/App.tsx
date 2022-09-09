import { TetrisGame } from "./tetris/TetrisGame";

const App: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
      }}
    >
      <TetrisGame />
      <div style={{ marginTop: 11 }}>
        <strong>Up</strong> - rotate figure, <strong>down</strong> - soft drop,{" "}
        <strong>right/left</strong> - move, <strong>enter</strong> - start
        again.
      </div>
      <div style={{ marginTop: 8, fontSize: "0.8em" }}>
        <a
          href="https://github.com/sergeiterehov/react-tetris-game"
          target="_blank"
          rel="noreferrer"
        >
          GitHub project
        </a>
      </div>
    </div>
  );
};

export default App;
