import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BattleView } from './pages/BattleView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BattleView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
