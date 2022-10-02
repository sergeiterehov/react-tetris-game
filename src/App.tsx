import { TetrisGame } from "./tetris/TetrisGame";

const App: React.FC = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        fontFamily: "monospace",
      }}
    >
      <TetrisGame />
    </div>
  );
};

export default App;
