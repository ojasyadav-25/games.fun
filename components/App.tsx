
import React from 'react';
// Use namespace import to fix "no exported member" errors in some environments
import * as ReactRouterDOM from 'react-router-dom';
import HomePage from './HomePage';
import PerfectCircleGame from './PerfectCircleGame';
import PotatoClickerGame from './PotatoClickerGame';
import TapTrapGame from './TapTrapGame';

const App: React.FC = () => {
  return (
    <ReactRouterDOM.Routes>
      <ReactRouterDOM.Route path="/" element={<HomePage />} />
      <ReactRouterDOM.Route path="/tap-trap" element={<TapTrapGame />} />
      <ReactRouterDOM.Route path="/perfect-circle" element={<PerfectCircleGame />} />
      <ReactRouterDOM.Route path="/potato-clicker" element={<PotatoClickerGame />} />
    </ReactRouterDOM.Routes>
  );
};

export default App;
