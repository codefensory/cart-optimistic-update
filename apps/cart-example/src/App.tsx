import { SpotPage } from "./modules/spot/pages";
import { MainPage } from "./pages";

function App() {
  const path = window.location.pathname;

  return (
    <div className="App">
      {path === "/" && <MainPage />}
      {path === "/spot" && <SpotPage />}
    </div>
  );
}

export default App;
